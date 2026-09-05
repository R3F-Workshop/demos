import type { BallData } from "./store.ts";

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
