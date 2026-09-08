import { createActions, type Entity } from "koota";

import { Drag, IsBall, Position, Radius, Settings, Velocity } from "./traits";

export const actions = createActions((world) => ({
  restart: (settings: { count?: number; radius?: number }) => {
    world.set(Settings, settings);
    const { count, radius } = world.get(Settings)!;
    world.query(IsBall).forEach((entity) => entity.destroy());

    for (let i = 0; i < count; i++) {
      world.spawn(
        IsBall,
        Position({ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 300 }),
        Velocity({ x: i % 2 === 0 ? 40 : -40, y: 0 }),
        Radius({ value: radius }),
      );
    }
  },

  startDrag: (entity: Entity, point: { x: number; y: number }, pointerId: number) => {
    if (world.queryFirst(Drag)) return false;
    const position = entity.get(Position)!;
    entity.add(Drag({ pointerId, offsetX: point.x - position.x, offsetY: point.y - position.y }));
    entity.set(Velocity, { x: 0, y: 0 });
    return true;
  },

  moveDrag: (entity: Entity, point: { x: number; y: number }) => {
    const drag = entity.get(Drag)!;
    const position = entity.get(Position)!;
    const x = point.x - drag.offsetX;
    const y = point.y - drag.offsetY;
    entity.set(Velocity, { x: (x - position.x) * 100, y: (y - position.y) * 100 });
    entity.set(Position, { x, y });
  },

  endDrag: () => {
    world.query(Drag).forEach((entity) => entity.remove(Drag));
  },
}));
