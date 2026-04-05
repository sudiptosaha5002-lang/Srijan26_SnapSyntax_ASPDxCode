import { Float, Html, OrbitControls, Environment, ContactShadows, Sparkles } from "@react-three/drei";
import TruckModel from "../components/TruckModel";

function GarageSpotlight({ accent, quality }) {
  return (
    <>
      <spotLight position={[0, 18, 6]} angle={0.35} penumbra={0.8} intensity={quality.tier === "high" ? 150 : 90} color={accent} castShadow={quality.shadows} />
      <spotLight position={[-10, 8, 10]} angle={0.45} penumbra={1} intensity={quality.tier === "lite" ? 35 : 80} color="#7d7bff" />
      <spotLight position={[10, 8, -8]} angle={0.45} penumbra={1} intensity={quality.tier === "lite" ? 35 : 80} color="#49f0ff" />
    </>
  );
}

export default function GarageScene({ trucks, selectedTruckId, customization, quality, onModelReady }) {
  const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId) ?? trucks[0];

  return (
    <>
      <color attach="background" args={["#070b14"]} />
      <fog attach="fog" args={["#070b14", 18, 42]} />
      <ambientLight intensity={0.7} />
      <GarageSpotlight accent={customization.color} quality={quality} />
      <Environment preset="city" />
      <Sparkles count={quality.sparkles} scale={[22, 8, 22]} size={quality.tier === "lite" ? 1.2 : 2} speed={0.35} color="#7ce7ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[14, 80]} />
        <meshStandardMaterial color="#09111f" metalness={0.4} roughness={0.55} />
      </mesh>

      <Float speed={1.35} rotationIntensity={0.14} floatIntensity={0.36}>
        <group position={[0, 0.28, 0]}>
          <TruckModel
            modelPath={selectedTruck.modelPath}
            color={customization.color}
            accent={selectedTruck.accent}
            selected
            scale={0.92}
            rotation={[0, -Math.PI / 3, 0]}
            position={[0, 0.4, 0]}
            onReady={onModelReady}
          />

          <Html position={[0, 4.2, 0]} center distanceFactor={10}>
            <div className="garage-label garage-label-active">
              <strong>{selectedTruck.name}</strong>
              <span>{selectedTruck.recommendedFor}</span>
            </div>
          </Html>
        </group>
      </Float>

      {quality.contactShadows ? (
        <ContactShadows position={[0, -0.01, 0]} scale={28} blur={quality.tier === "high" ? 2.2 : 1.5} far={20} opacity={0.65} color="#02060d" />
      ) : null}

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={22}
        minPolarAngle={0.8}
        maxPolarAngle={1.45}
        autoRotate={quality.autoRotate}
        autoRotateSpeed={0.35}
      />
    </>
  );
}
