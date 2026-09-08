import { Canvas } from "@react-three/fiber/webgpu";
import { useActions } from "koota/react";

import { actions } from "./actions";
import { BallRenderer } from "./ball";
import { Devtools } from "./devtools";

export function BallCollisionScene() {
  const { endDrag } = useActions(actions);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 500], zoom: 1 }}
      background="#ffeab6"
      style={{ height: "100dvh", touchAction: "none", userSelect: "none" }}
      onLostPointerCapture={endDrag}
    >
      <BallRenderer />
      <Devtools />
    </Canvas>
  );
}
