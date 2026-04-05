import { useEffect, useMemo, useRef } from "react";
import { Environment, OrbitControls, PerspectiveCamera, Sky, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color, Vector3 } from "three";
import TruckModel from "../components/TruckModel";
import { getRoutePosition, lerp } from "../engine/SimulationEngine";

function CameraRig({ cameraMode, truckPosition, heading }) {
  const desired = useRef(new Vector3(0, 6, 12));
  const lookAt = useRef(new Vector3(0, 2, 0));

  useFrame((state) => {
    const camera = state.camera;
    const truckVector = new Vector3(...truckPosition);

    if (cameraMode === "follow") {
      desired.current.set(truckPosition[0] - Math.cos(heading) * 8, 4.6, truckPosition[2] - Math.sin(heading) * 8);
      lookAt.current.set(truckPosition[0], 2.2, truckPosition[2]);
    } else if (cameraMode === "top") {
      desired.current.set(truckPosition[0], 22, truckPosition[2] + 0.01);
      lookAt.current.set(truckPosition[0], 0, truckPosition[2]);
    } else if (cameraMode === "cinematic") {
      const t = state.clock.elapsedTime * 0.35;
      desired.current.set(truckPosition[0] + Math.cos(t) * 10, 4.5 + Math.sin(t * 1.7) * 1.5, truckPosition[2] + Math.sin(t) * 10);
      lookAt.current.copy(truckVector).setY(1.8);
    } else {
      return;
    }

    camera.position.lerp(desired.current, 0.06);
    camera.lookAt(lookAt.current);
  });

  return null;
}

function Road({ route }) {
  const points = route.map(([x, y, z]) => [x, y + 0.04, z]);
  return (
    <group>
      {points.slice(1).map((point, index) => {
        const previous = points[index];
        const midX = (previous[0] + point[0]) / 2;
        const midZ = (previous[2] + point[2]) / 2;
        const length = Math.hypot(point[0] - previous[0], point[2] - previous[2]);
        const rotation = Math.atan2(point[2] - previous[2], point[0] - previous[0]);
        return (
          <mesh key={`${midX}-${midZ}`} position={[midX, 0.02, midZ]} rotation={[-Math.PI / 2, 0, rotation]} receiveShadow>
            <planeGeometry args={[length + 1.4, 2.8]} />
            <meshStandardMaterial color="#101b2d" metalness={0.18} roughness={0.78} />
          </mesh>
        );
      })}
    </group>
  );
}

function CityBackdrop({ quality }) {
  const buildings = useMemo(
    () => Array.from({ length: quality.buildingCount }, (_, index) => ({ id: index, x: -26 + (index % 7) * 8, z: -28 + Math.floor(index / 7) * 14, h: 4 + (index % 5) * 2.2 })),
    [quality.buildingCount],
  );

  const trees = useMemo(
    () => Array.from({ length: quality.treeCount }, (_, index) => ({ id: index, x: -24 + (index % 6) * 8, z: -20 + Math.floor(index / 6) * 11 })),
    [quality.treeCount],
  );

  return (
    <group>
      {buildings.map((building) => (
        <mesh key={building.id} castShadow={quality.shadows} receiveShadow position={[building.x, building.h / 2, building.z]}>
          <boxGeometry args={[3.2, building.h, 3.2]} />
          <meshStandardMaterial color="#12233d" emissive="#1c3357" emissiveIntensity={0.16} />
        </mesh>
      ))}

      {trees.map((tree) => (
        <group key={tree.id} position={[tree.x, 0, tree.z]}>
          <mesh castShadow={quality.shadows} position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 2.4, 8]} />
            <meshStandardMaterial color="#402b1e" />
          </mesh>
          <mesh castShadow={quality.shadows} position={[0, 2.5, 0]}>
            <coneGeometry args={[0.9, 2.2, 10]} />
            <meshStandardMaterial color="#1fbf8f" emissive="#13b38b" emissiveIntensity={0.18} />
          </mesh>
        </group>
      ))}

      <mesh position={[26, 2.2, -18]} castShadow={quality.shadows} receiveShadow>
        <boxGeometry args={[6, 4.4, 5]} />
        <meshStandardMaterial color="#0f2036" emissive="#112845" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function WeatherParticles({ weather, quality }) {
  const rainDrops = useMemo(
    () => Array.from({ length: quality.rainCount }, (_, index) => ({ id: index, x: -28 + (index % 20) * 2.8, y: 8 + (index % 8), z: -20 + Math.floor(index / 20) * 4.4 })),
    [quality.rainCount],
  );

  if (weather !== "rain" && weather !== "fog") return null;

  return (
    <group>
      {weather === "rain" &&
        rainDrops.map((drop) => (
          <mesh key={drop.id} position={[drop.x, drop.y, drop.z]} rotation={[0.3, 0, 0.15]}>
            <boxGeometry args={[0.03, 0.7, 0.03]} />
            <meshBasicMaterial color="#8ee9ff" transparent opacity={0.55} />
          </mesh>
        ))}
      {weather === "fog" && quality.tier !== "lite" && (
        <mesh position={[0, 1.5, -4]}>
          <boxGeometry args={[60, 3, 60]} />
          <meshBasicMaterial color="#bcc7d9" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

export default function SimulationScene({
  selectedTruck,
  activeRoute,
  progress,
  cameraMode,
  weather,
  timeOfDay,
  customization,
  activeEvent,
  quality,
  onModelReady,
}) {
  const truckGroup = useRef();
  const route = activeRoute;
  const { point, heading } = getRoutePosition(route, progress);
  const skyColor = useMemo(
    () => new Color().setHSL(0.62, 0.55, lerp(0.08, 0.58, 1 - Math.abs(timeOfDay - 0.5) * 1.8)),
    [timeOfDay],
  );
  const sunlightIntensity = timeOfDay > 0.78 || timeOfDay < 0.14 ? 0.25 : 1.15;

  useEffect(() => {
    if (!truckGroup.current) return;
    truckGroup.current.rotation.y = -heading;
  }, [heading]);

  useFrame((state) => {
    if (!truckGroup.current) return;
    const t = state.clock.elapsedTime;
    truckGroup.current.position.x = lerp(truckGroup.current.position.x, point[0], 0.08);
    truckGroup.current.position.y = 0.34 + Math.sin(t * 12) * 0.03;
    truckGroup.current.position.z = lerp(truckGroup.current.position.z, point[2], 0.08);
    truckGroup.current.rotation.y = lerp(truckGroup.current.rotation.y, -heading, 0.08);
  });

  return (
    <>
      <color attach="background" args={[skyColor.getStyle()]} />
      <fog attach="fog" args={[weather === "fog" ? "#97abc9" : "#070d18", 20, 70]} />
      <PerspectiveCamera makeDefault position={[10, 7, 18]} fov={42} />
      <CameraRig cameraMode={cameraMode} truckPosition={point} heading={heading} />
      <ambientLight intensity={0.45 + sunlightIntensity * 0.28} color={timeOfDay > 0.8 ? "#8ab4ff" : "#dff1ff"} />
      <directionalLight
        position={[16, 18, 10]}
        intensity={sunlightIntensity * 2.4}
        color={timeOfDay > 0.82 ? "#8db0ff" : "#fff4d6"}
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.tier === "high" ? 2048 : 1024}
        shadow-mapSize-height={quality.tier === "high" ? 2048 : 1024}
      />
      <Environment preset={timeOfDay > 0.82 ? "night" : "city"} />
      <Sky sunPosition={[100, 25 * sunlightIntensity, 100]} turbidity={quality.tier === "lite" ? 5 : 8} rayleigh={quality.tier === "lite" ? 0.8 : 1.2} />
      {timeOfDay > 0.82 && quality.stars > 0 && <Stars radius={80} depth={30} count={quality.stars} factor={3} fade />}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#07111f" />
      </mesh>

      <Road route={route} />
      <CityBackdrop quality={quality} />
      <WeatherParticles weather={weather} quality={quality} />

      <group ref={truckGroup}>
        <TruckModel
          modelPath={selectedTruck.modelPath}
          color={customization.color}
          accent={selectedTruck.accent}
          logoUrl={customization.logoUrl}
          animateWheels
          scale={0.88}
          onReady={onModelReady}
        />
        {(timeOfDay > 0.82 || weather === "fog") && quality.tier !== "lite" && (
          <>
            <spotLight position={[-2.4, 2.1, 0.52]} angle={0.2} intensity={30} color="#9be8ff" distance={18} />
            <spotLight position={[-2.4, 2.1, -0.52]} angle={0.2} intensity={30} color="#9be8ff" distance={18} />
          </>
        )}
        {activeEvent?.type === "breakdown" && <pointLight position={[0, 3, 0]} intensity={25} color="#ff9157" distance={7} />}
      </group>

      <OrbitControls enabled={cameraMode === "free"} maxDistance={30} minDistance={6} enableDamping={quality.tier !== "lite"} />
    </>
  );
}


