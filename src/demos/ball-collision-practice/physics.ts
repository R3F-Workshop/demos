import type { BallData } from "./store.ts";

export type Bounds = { width: number; height: number };

export function moveBall({ position, velocity }: BallData, delta: number) {
  position.x += velocity.x * delta;
  position.y += velocity.y * delta;

  // Friction slows the ball after release.
  velocity.x *= 0.99 ** (delta * 60);
  velocity.y *= 0.99 ** (delta * 60);
}

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

export function collideBalls(balls: BallData[], heldId?: number) {
  // Compare each pair once.
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const distance = Math.hypot(dx, dy);
      const overlap = a.radius + b.radius - distance;
      if (overlap <= 0) continue;

      // The normal points from a to b. Coincident centers separate horizontally.
      const normalX = distance === 0 ? 1 : dx / distance;
      const normalY = distance === 0 ? 0 : dy / distance;
      const moveA = a.id === heldId ? 0 : 1;
      const moveB = b.id === heldId ? 0 : 1;
      const share = moveA + moveB;

      // Free balls each move halfway. A held ball stays under the pointer.
      a.position.x -= normalX * overlap * moveA / share;
      a.position.y -= normalY * overlap * moveA / share;
      b.position.x += normalX * overlap * moveB / share;
      b.position.y += normalY * overlap * moveB / share;

      // Only exchange momentum when the balls are approaching.
      const relativeSpeed = (b.velocity.x - a.velocity.x) * normalX +
        (b.velocity.y - a.velocity.y) * normalY;
      if (relativeSpeed >= 0) continue;
      const impulse = -2 * relativeSpeed / share;
      a.velocity.x -= impulse * normalX * moveA;
      a.velocity.y -= impulse * normalY * moveA;
      b.velocity.x += impulse * normalX * moveB;
      b.velocity.y += impulse * normalY * moveB;
    }
  }
}
