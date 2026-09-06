import { Canvas } from "@react-three/fiber/webgpu";

import { BallRenderer } from "./ball";

export function BallCollisionScene() {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 500], zoom: 1 }}
      background="#ffeab6"
      style={{ height: "100dvh" }}
    >
      <BallRenderer />    
    </Canvas>
  );
}
