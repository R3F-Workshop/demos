import { create } from "zustand";

import { createBalls } from "./create-balls.ts";
import { collideWithWalls, limitSpeed, updateBalls } from "./physics.ts";
import type { Ball, Bounds, Drag, Vec2 } from "./types";

type SimStore = {
  balls: Ball[];
  bounds: Bounds;
  drag: Drag;
  setBounds: (bounds: Bounds) => void;
  startDragging: (point: Vec2, pointerId: number, time: number) => boolean;
  moveDragging: (point: Vec2, pointerId: number, time: number) => void;
  stopDragging: (pointerId: number, time: number, cancel?: boolean) => void;
  step: (delta: number) => void;
};

export const useSimStore = create<SimStore>((set, get) => ({
  balls: [],
  bounds: { width: 0, height: 0 },
  drag: null,

  setBounds: (bounds) => {
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const state = get();
    if (bounds.width === state.bounds.width && bounds.height === state.bounds.height) return;
    // Repack on resize so the balls fit the arena.
    set({ bounds, balls: createBalls(state.balls.length || 24, bounds), drag: null });
  },

  startDragging: (point, pointerId, time) => {
    const state = get();
    if (state.drag) return false;
    const ball = state.balls.findLast((ball) =>
      Math.hypot(point.x - ball.position.x, point.y - ball.position.y) <= ball.radius,
    );
    if (!ball) return false;
    set({
      drag: {
        id: ball.id,
        pointerId,
        point,
        offset: { x: point.x - ball.position.x, y: point.y - ball.position.y },
        samples: [{ position: ball.position, time }],
      },
      balls: state.balls.map((item) => {
        if (item.id !== ball.id) return item;
        return { ...item, velocity: { x: 0, y: 0 } };
      }),
    });
    return true;
  },

  moveDragging: (point, pointerId, time) => set((state) => {
    const drag = state.drag;
    if (!drag || drag.pointerId !== pointerId) return state;
    // Only movement updates the release velocity and timestamp.
    if (point.x === drag.point.x && point.y === drag.point.y) return state;
    const last = drag.samples.at(-1)!;
    // Measure velocity across the last 50 ms of samples, always spanning at least the previous one.
    // A short window follows a curved throw closely; spanning several samples keeps a tiny final
    // movement from erasing the throw.
    const recent = drag.samples.filter((sample) => sample === last || time - sample.time <= 50);
    const oldest = recent[0];
    const delta = Math.max((time - oldest.time) / 1_000, 1 / 240);
    const ball = state.balls.find((ball) => ball.id === drag.id)!;
    const next = {
      ...ball,
      position: { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
      velocity: { ...ball.velocity },
    };
    collideWithWalls([next], state.bounds);
    // Release velocity in px/s from the clamped positions, so pushing into a wall builds no speed.
    for (const axis of ["x", "y"] as const) {
      next.velocity[axis] = (next.position[axis] - oldest.position[axis]) / delta;
    }
    limitSpeed(next);
    return {
      drag: { ...drag, point, samples: [...recent, { position: next.position, time }] },
      balls: state.balls.map((ball) => (ball.id === drag.id ? next : ball)),
    };
  }),

  stopDragging: (pointerId, time, cancel = false) => set((state) => {
    const drag = state.drag;
    if (!drag || drag.pointerId !== pointerId) return state;
    // A brief hesitation still flings; holding still longer drops the ball without stale momentum.
    const stopped = cancel || time - drag.samples.at(-1)!.time > 150;
    return {
      drag: null,
      balls: state.balls.map((ball) => {
        if (ball.id !== drag.id || !stopped) return ball;
        return { ...ball, velocity: { x: 0, y: 0 } };
      }),
    };
  }),

  step: (delta) => set((state) => ({
    balls: updateBalls(state.balls, state.bounds, delta, state.drag?.id),
  })),
}));
