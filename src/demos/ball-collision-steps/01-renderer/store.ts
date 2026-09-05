import { create } from "zustand";

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
  balls: [
    { id: 0, position: { x: -100, y: 0 }, velocity: { x: 40, y: 0 }, radius: 40 },
    { id: 1, position: { x: 100, y: 0 }, velocity: { x: -40, y: 0 }, radius: 40 },
  ],

  step: (delta) => set((state) => {
    const balls = structuredClone(state.balls);

    balls.forEach(({ position, velocity }) => {
      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
    });

    return { balls };
  }),
}));
