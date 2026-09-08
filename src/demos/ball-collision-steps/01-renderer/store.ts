import { create } from "zustand";

import { moveBall } from "./physics.ts";

const count = 2;
const radius = 40;

export type Vec2 = { x: number; y: number };
export type BallData = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
};

type BallStore = {
  balls: BallData[];
  step: (delta: number) => void;
};

export const useBallStore = create<BallStore>((set) => ({
  balls: createBalls(count, radius),

  step: (delta) => set((state) => {
    const balls = structuredClone(state.balls);

    balls.forEach((ball) => moveBall(ball, delta));

    return { balls };
  }),
}));

function createBalls(count: number, radius: number): BallData[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    radius,
    position: {
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 300,
    },
    velocity: { x: id % 2 === 0 ? 40 : -40, y: 0 },
  }));
}
