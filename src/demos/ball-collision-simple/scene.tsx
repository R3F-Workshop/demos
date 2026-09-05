import { Canvas } from "@react-three/fiber/webgpu";

import { Ball } from "./ball";

export function BallCollisionScene() {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 500], zoom: 1 }}
      background="#ffeab6"
      style={{ height: "100dvh" }}
    >
      <group position={[-100, 0, 0]}>
        <Ball />
      </group>
    </Canvas>
  );
}
