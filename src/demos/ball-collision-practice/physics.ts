import type { BallData } from "./store.ts";

export function moveBall({ position, velocity }: BallData, delta: number) {
  position.x += velocity.x * delta;
  position.y += velocity.y * delta;

  // Friction slows the ball after release.
  velocity.x *= 0.99 ** (delta * 60);
  velocity.y *= 0.99 ** (delta * 60);
}
