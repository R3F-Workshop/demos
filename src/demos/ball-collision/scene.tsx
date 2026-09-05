import { Canvas } from "@react-three/fiber/webgpu";
import { useEffect, useRef, type PointerEvent } from "react";

import { BallRenderer } from "./ball";
import { useSimStore } from "./store";

export function BallCollisionScene() {
  const surface = useRef<HTMLDivElement>(null);
  const dragging = useSimStore((state) => state.drag !== null);
  const { startDragging, moveDragging, stopDragging } = useSimStore.getState();

  function pointerPosition(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const grabbed = startDragging(pointerPosition(event), event.pointerId, event.timeStamp);
    if (!grabbed) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    surface.current = event.currentTarget;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    moveDragging(pointerPosition(event), event.pointerId, event.timeStamp);
  }

  function release(event: PointerEvent<HTMLDivElement>, cancel = false) {
    stopDragging(event.pointerId, event.timeStamp, cancel);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  useEffect(() => {
    const cancel = () => {
      const { drag, stopDragging } = useSimStore.getState();
      if (!drag) return;
      stopDragging(drag.pointerId, performance.now(), true);
      if (surface.current?.hasPointerCapture(drag.pointerId)) {
        surface.current.releasePointerCapture(drag.pointerId);
      }
    };
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      cancel();
    };
  }, []);

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 500], zoom: 1 }}
      dpr={[1, 2]}
      background="#ffeab6"
      className="touch-none select-none"
      style={{ height: "100dvh", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => release(event)}
      onPointerCancel={(event) => release(event, true)}
      onLostPointerCapture={(event) => release(event, true)}
    >
      <BallRenderer />
    </Canvas>
  );
}
