import { useFrame, type ThreeEvent } from "@react-three/fiber/webgpu";
import { useState } from "react";
import { useBallStore, type BallData } from "./store";

export function BallRenderer() {
  const balls = useBallStore((state) => state.balls);

  //advance the external data once per frame 
  useFrame(({size}, delta) => useBallStore.getState().step(delta, size)); 

  return balls.map((ball) => <Ball key={ball.id} {...ball} />);
}

function Ball({ id, position, radius }: BallData) {
  const { setBall, setDrag} = useBallStore.getState()

  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    if (useBallStore.getState().drag) return;

    event.stopPropagation();

    // Set the drag for the ball via ID with an offset from the pointer event
    const point = event.unprojectedPoint;
    setDrag({
      id,
      pointerId: event.pointerId,
      offset: { x: point.x - position.x, y: point.y - position.y },
    });

    // Set the ball's velocity to 0 since we are taking over control
    setBall(id, { velocity: { x: 0, y: 0 } });
    // Capture the pointer so the interaction does not get interrupted
    (event.target as Element).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ThreeEvent<PointerEvent>) {
    const { drag, balls } = useBallStore.getState();
    // Skip this event if the ball is not actively being dragged
    if (drag?.id !== id || drag.pointerId !== event.pointerId) return;

    event.stopPropagation();

    const ball = balls.find((ball) => ball.id === id)!;

    // Keep the ball's position locked on the pointer
    const point = event.unprojectedPoint;
    setBall(id, {
      position: { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
      velocity: {
        x: (point.x - drag.offset.x - ball.position.x) * 100,
        y: (point.y - drag.offset.y - ball.position.y) * 100,
      },
    });
  } 

  function onPointerUp(event: ThreeEvent<PointerEvent>) {
    const { drag } = useBallStore.getState();
    if (drag?.id !== id || drag.pointerId !== event.pointerId) return;

    event.stopPropagation();

    // End the drag and release the pointer capture
    setDrag(null);
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  return (
    <mesh 
      position={[position.x, position.y, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh> 
  );
}
