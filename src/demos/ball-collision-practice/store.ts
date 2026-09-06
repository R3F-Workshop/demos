import { create } from "zustand";
import { moveBall, bounceOffWalls, type Bounds } from "./physics.ts";

const count = 20;
const radius = 20;

export type Vec2 = { x: number; y: number };
export type BallData = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
};

type Drag = {
  id: number;
  pointerId: number;
  offset: Vec2;
};

type BallStore = {
  balls: BallData[];
  drag: Drag | null; 
  step: (delta: number, bounds: Bounds) => void;
  setBall: (id: number, changes: Partial<BallData>) => void; 
  setDrag: (drag: Drag | null) => void; 
};

export const useBallStore = create<BallStore>((set) => ({
  balls: createBalls(count, radius),
  drag: null, 
  step: (delta, bounds) => set((state) => {
    const balls = structuredClone(state.balls);

    balls.forEach((ball) => {
      if (ball.id !== state.drag?.id) moveBall(ball, delta);
      bounceOffWalls(ball, bounds); // <--
    });

    return { balls };
  }),
  setBall: (id, changes) => set((state) => ({
    balls: state.balls.map((ball) => {
      if (ball.id !== id) return ball;
      return { ...ball, ...changes };
    }),
  })),

  setDrag: (drag) => set({ drag }),
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