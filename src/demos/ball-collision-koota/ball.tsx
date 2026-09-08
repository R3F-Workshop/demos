import { useFrame, type ThreeEvent } from "@react-three/fiber/webgpu";
import type { Entity } from "koota";
import { useActions, useQuery, useTrait, useWorld } from "koota/react";
import { useRef } from "react";
import type { Mesh } from "three/webgpu";

import { actions } from "./actions";
import { bounceOffWalls, collideBalls, moveBalls } from "./systems";
import { Drag, IsBall, Position, Radius } from "./traits";

export function BallRenderer() {
  const world = useWorld();
  const balls = useQuery(IsBall);

  // Finish physics before each ball copies its position.
  useFrame(({ size }, delta) => {
    collideBalls(world);
    moveBalls(world, delta);
    bounceOffWalls(world, size);
  }, { id: "physics" });

  return balls.map((entity) => <Ball key={entity} entity={entity} />);
}

function Ball({ entity }: { entity: Entity }) {
  const radius = useTrait(entity, Radius);
  const mesh = useRef<Mesh>(null);
  const { startDrag, moveDrag, endDrag } = useActions(actions);

  useFrame(() => {
    if (!mesh.current || !entity.isAlive()) return;
    const position = entity.get(Position);
    if (position) mesh.current.position.set(position.x, position.y, 0);
  }, { after: "physics" });

  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (!startDrag(entity, event.unprojectedPoint, event.pointerId)) return;
    (event.target as Element).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ThreeEvent<PointerEvent>) {
    if (entity.get(Drag)?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    moveDrag(entity, event.unprojectedPoint);
  }

  function onPointerUp(event: ThreeEvent<PointerEvent>) {
    if (entity.get(Drag)?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    endDrag();
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  if (!radius) return null;

  return (
    <mesh
      ref={mesh}
      scale={radius.value}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <circleGeometry args={[1, 64]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh>
  );
}
