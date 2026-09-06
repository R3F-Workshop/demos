import type { BallData } from "./store.ts";

export function moveBall({ position, velocity }: BallData, delta: number) {
  position.x += velocity.x * delta;
  position.y += velocity.y * delta;
}
