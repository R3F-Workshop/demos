import { Canvas } from "@react-three/fiber/webgpu";
import type { PointerEvent } from "react";

import { BallRenderer } from "./ball";
import { useBallStore } from "./store";

export function BallCollisionScene() {
  const { startDrag, moveDrag, endDrag } = useBallStore.getState();

  // Match the orthographic camera: center is (0, 0), positive y points up.
  function pointerPosition(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: rect.height / 2 - (event.clientY - rect.top),
    };
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const grabbed = startDrag(pointerPosition(event), event.pointerId, event.timeStamp);
    if (grabbed) event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    moveDrag(pointerPosition(event), event.pointerId, event.timeStamp);
  }

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 500], zoom: 1 }}
      background="#ffeab6"
      style={{ height: "100dvh", touchAction: "none", userSelect: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => endDrag(event.pointerId, event.timeStamp)}
      onPointerCancel={(event) => endDrag(event.pointerId, event.timeStamp, true)}
      onLostPointerCapture={(event) => endDrag(event.pointerId, event.timeStamp, true)}
    >
      <BallRenderer />
    </Canvas>
  );
}
