import { useGLTF } from "@react-three/drei";
import { type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

import kamdoModel from "./robot.glb?url";

type GLTFResult = {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

/** Frame-rate-independent exponential ease toward a target Euler. */
function dampEuler(
  current: THREE.Euler,
  target: [number, number, number],
  smoothTime: number,
  delta: number,
) {
  const t = 1 - Math.exp(-delta / smoothTime);
  current.x += (target[0] - current.x) * t;
  current.y += (target[1] - current.y) * t;
  current.z += (target[2] - current.z) * t;
}

export function Robot(props: ThreeElements["group"]) {
  const head = useRef<THREE.Group>(null!);
  const stripe = useRef<THREE.MeshStandardMaterial>(null!);
  const light = useRef<THREE.SpotLight>(null!);
  const { nodes, materials } = useGLTF(kamdoModel) as unknown as GLTFResult;
  useFrame((state, delta) => {
    const t = state.time * 0.0001;
    stripe.current.emissive.setHSL(t, 1, 0.5);
    light.current.color.setHSL(t, 1, 0.5);

    dampEuler(
      head.current.rotation,
      [0, -state.pointer.x * (state.camera.position.z > 1 ? 1 : -1), 0],
      0.4,
      delta,
    );
  });

  return (
    <group {...props}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.body001.geometry}
        material={materials.Body}
        material-aoMapIntensity={0}
      />
      <group ref={head}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.head001.geometry}
          material={materials.Head}
          material-aoMapIntensity={0}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.stripe001.geometry}
          material-aoMapIntensity={0}
        >
          <meshStandardMaterial ref={stripe} />
          <spotLight ref={light} intensity={0.5} angle={Math.PI} penumbra={2} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(kamdoModel);
