import { useFrame, type ThreeEvent } from "@react-three/fiber/webgpu";
import type { Entity } from "koota";
import { useActions, useQuery, useTrait, useWorld } from "koota/react";

import { actions } from "./actions";
import { bounceOffWalls, collideBalls, moveBalls } from "./systems";
import { Drag, IsBall, Position, Radius } from "./traits";

export function BallRenderer() {
  const world = useWorld();
  const balls = useQuery(IsBall);

  useFrame(({ size }, delta) => {
    collideBalls(world);
    moveBalls(world, delta);
    bounceOffWalls(world, size);
  });

  return balls.map((entity) => <Ball key={entity} entity={entity} />);
}

function Ball({ entity }: { entity: Entity }) {
  const radius = useTrait(entity, Radius);
  const position = useTrait(entity, Position);
  const { startDrag, moveDrag, endDrag } = useActions(actions);

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

  if (!radius || !position) return null;

  return (
    <mesh
      scale={radius.value}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      position={[position.x, position.y, 0]}
    >
      <circleGeometry args={[1, 64]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh>
  );
}
