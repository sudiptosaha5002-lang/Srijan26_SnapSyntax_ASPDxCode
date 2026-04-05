import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Box3, Color, Group, MathUtils, MeshStandardMaterial, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

function getFileExtension(path = "") {
  return path.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

function createLoader(path) {
  const extension = getFileExtension(path);

  if (extension === "gltf" || extension === "glb") {
    return {
      type: "gltf",
      loader: new GLTFLoader(),
    };
  }

  if (extension === "obj") {
    return {
      type: "obj",
      loader: new OBJLoader(),
    };
  }

  throw new Error(`Unsupported 3D model format: ${extension || "unknown"}`);
}

function extractScene(loaded, type) {
  if (type === "gltf") {
    return loaded.scene || loaded.scenes?.[0] || null;
  }

  return loaded;
}

function normalizeObject(source) {
  const root = source.clone(true);
  const box = new Box3().setFromObject(root);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const uniformScale = 4.8 / maxAxis;

  root.position.sub(center);
  root.scale.setScalar(uniformScale);
  root.rotation.y = Math.PI;

  return root;
}

function applyTruckMaterial(object, color, accent, selected, hovered) {
  const bodyTone = new Color(color);
  const accentTone = new Color(accent);

  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.material = new MeshStandardMaterial({
      color: bodyTone,
      metalness: 0.45,
      roughness: 0.42,
      emissive: selected || hovered ? accentTone : bodyTone,
      emissiveIntensity: selected ? 0.2 : hovered ? 0.1 : 0.03,
    });
  });

  return object;
}

function Wheel({ position }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.55, 0.55, 0.4, 18]} />
      <meshStandardMaterial color="#111827" roughness={0.9} />
    </mesh>
  );
}

function FallbackTruck({ color, accent }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 2.2, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} emissive={accent} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[-1.9, 2.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 1.5, 2]} />
        <meshStandardMaterial color="#d9e5f7" metalness={0.25} roughness={0.45} />
      </mesh>
      <Wheel position={[2.8, 0.64, 0.72]} />
      <Wheel position={[2.8, 0.64, -0.72]} />
      <Wheel position={[-1.9, 0.64, 0.72]} />
      <Wheel position={[-1.9, 0.64, -0.72]} />
    </group>
  );
}

export default function TruckModel({
  modelPath,
  selected = false,
  hovered = false,
  color = "#4f7cff",
  accent = "#74f0ed",
  animateWheels = false,
  vibration = 0.045,
  scale = 1,
  onReady,
  onError,
  ...props
}) {
  const groupRef = useRef(null);
  const [loadedObject, setLoadedObject] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!modelPath) {
      setLoadedObject(null);
      setLoadError(new Error("Missing model path."));
      return undefined;
    }

    let disposed = false;
    const { loader, type } = createLoader(modelPath);

    setLoadedObject(null);
    setLoadError(null);

    loader.load(
      modelPath,
      (loaded) => {
        if (disposed) return;
        const sceneObject = extractScene(loaded, type);
        if (!sceneObject) {
          const error = new Error(`Loaded model has no renderable scene: ${modelPath}`);
          setLoadError(error);
          onError?.(error);
          return;
        }
        setLoadedObject(sceneObject);
      },
      undefined,
      (error) => {
        if (disposed) return;
        setLoadError(error);
        onError?.(error);
      },
    );

    return () => {
      disposed = true;
    };
  }, [modelPath, onError]);

  const model = useMemo(() => {
    if (!loadedObject) return null;
    const normalized = normalizeObject(loadedObject);
    return applyTruckMaterial(normalized, color, accent, selected, hovered);
  }, [accent, color, hovered, loadedObject, selected]);

  useEffect(() => {
    if (!model || !onReady) return;
    onReady(modelPath);
  }, [model, modelPath, onReady]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.PI;
  }, [model]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(time * 2.2) * vibration;
    groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.01;

    if (animateWheels) {
      groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, Math.sin(time * 14) * 0.01, delta * 4);
    }
  });

  return (
    <group ref={groupRef} scale={scale} {...props}>
      {model && !loadError ? <primitive object={model} /> : <FallbackTruck color={color} accent={accent} />}
    </group>
  );
}
