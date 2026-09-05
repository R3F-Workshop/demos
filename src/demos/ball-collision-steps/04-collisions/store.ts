import { create } from "zustand";

import { bounceOffWalls, type Bounds } from "./walls.ts";
import { collideBalls } from "./collisions.ts";

export type Vec2 = { x: number; y: number };
export type BallData = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
};

type Sample = { point: Vec2; time: number };
type Drag = {
  id: number;
  pointerId: number;
  offset: Vec2;
  samples: Sample[];
};

type BallStore = {
  balls: BallData[];
  drag: Drag | null;
  step: (delta: number, bounds: Bounds) => void;
  startDrag: (point: Vec2, pointerId: number, time: number) => boolean;
  moveDrag: (point: Vec2, pointerId: number, time: number) => void;
  endDrag: (pointerId: number, time: number, cancel?: boolean) => void;
};

export const useBallStore = create<BallStore>((set, get) => ({
  balls: [
    { id: 0, position: { x: -100, y: 0 }, velocity: { x: 40, y: 0 }, radius: 40 },
    { id: 1, position: { x: 100, y: 0 }, velocity: { x: -40, y: 0 }, radius: 40 },
  ],
  drag: null,

  step: (delta, bounds) => set((state) => {
    const balls = structuredClone(state.balls);
    balls.forEach(({ id, position, velocity }) => {
      if (id === state.drag?.id) return;
      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
    });

    collideBalls(balls, state.drag?.id);
    balls.forEach((ball) => bounceOffWalls(ball, bounds));
    return { balls };
  }),

  startDrag: (point, pointerId, time) => {
    const { balls, drag } = get();
    if (drag) return false;
    const ball = balls.findLast((ball) =>
      Math.hypot(point.x - ball.position.x, point.y - ball.position.y) <= ball.radius,
    );
    if (!ball) return false;

    set({
      drag: {
        id: ball.id,
        pointerId,
        offset: { x: point.x - ball.position.x, y: point.y - ball.position.y },
        samples: [{ point, time }],
      },
      balls: balls.map((item) => {
        if (item.id !== ball.id) return item;
        return { ...item, velocity: { x: 0, y: 0 } };
      }),
    });
    return true;
  },

  moveDrag: (point, pointerId, time) => set((state) => {
    const { drag } = state;
    if (!drag || drag.pointerId !== pointerId) return state;
    const last = drag.samples.at(-1)!;
    // Only movement updates the release velocity and timestamp.
    if (point.x === last.point.x && point.y === last.point.y) return state;
    // Measure velocity across the last 50 ms of samples, always spanning at least the previous one.
    // A short window follows a curved throw closely; spanning several samples keeps a tiny final
    // movement from erasing the throw.
    const samples = drag.samples.filter((sample) => sample === last || time - sample.time <= 50);
    samples.push({ point, time });
    const oldest = samples[0];
    const delta = Math.max((time - oldest.time) / 1_000, 1 / 240);

    return {
      drag: { ...drag, samples },
      balls: state.balls.map((ball) => {
        if (ball.id !== drag.id) return ball;
        return {
          ...ball,
          position: { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
          velocity: {
            x: (point.x - oldest.point.x) / delta,
            y: (point.y - oldest.point.y) / delta,
          },
        };
      }),
    };
  }),

  endDrag: (pointerId, time, cancel = false) => set((state) => {
    const { drag } = state;
    if (!drag || drag.pointerId !== pointerId) return state;
    // A brief hesitation still flings; a longer hold drops the ball in place.
    const stopped = cancel || time - drag.samples.at(-1)!.time > 150;

    return {
      drag: null,
      balls: state.balls.map((ball) => {
        if (ball.id !== drag.id || !stopped) return ball;
        return { ...ball, velocity: { x: 0, y: 0 } };
      }),
    };
  }),
}));
