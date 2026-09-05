import type { BallData } from "./store.ts";

export type Bounds = { width: number; height: number };

export function bounceOffWalls(ball: BallData, { width, height }: Bounds) {
  const { position, velocity, radius } = ball;
  const left = -width / 2 + radius;
  const right = width / 2 - radius;
  const bottom = -height / 2 + radius;
  const top = height / 2 - radius;

  if (position.x < left) {
    position.x = left;
    velocity.x = Math.abs(velocity.x);
  } else if (position.x > right) {
    position.x = right;
    velocity.x = -Math.abs(velocity.x);
  }

  if (position.y < bottom) {
    position.y = bottom;
    velocity.y = Math.abs(velocity.y);
  } else if (position.y > top) {
    position.y = top;
    velocity.y = -Math.abs(velocity.y);
  }
}
