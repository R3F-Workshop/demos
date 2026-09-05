import type { Ball, Bounds } from "./types";

export function updateBalls(previous: Ball[], bounds: Bounds, delta: number, heldId?: number) {
  if (delta <= 0 || !Number.isFinite(delta) || !previous.length) return previous;

  // Work on a copy so React can read the previous frame until this one is ready.
  const balls = previous.map((ball) => ({
    ...ball,
    position: { ...ball.position },
    velocity: { ...ball.velocity },
  }));

  // Short steps and a speed limit keep fast balls from skipping past each other.
  const elapsed = Math.min(delta, 1 / 30);
  const steps = Math.ceil(elapsed * 120);
  const smallestRadius = Math.min(...balls.map((ball) => ball.radius));
  const speedLimit = Math.min(1_500, smallestRadius * 120);

  for (const ball of balls) limitSpeed(ball, speedLimit);
  for (let i = 0; i < steps; i++) {
    moveBalls(balls, elapsed / steps, heldId);
    collideBalls(balls, heldId);
    collideWithWalls(balls, bounds);
    for (const ball of balls) limitSpeed(ball, speedLimit);
  }
  return balls;
}

export function moveBalls(balls: Ball[], delta: number, heldId?: number) {
  // Light friction lets a fling travel before settling.
  const decay = Math.exp(-0.15 * delta);
  for (const ball of balls) {
    if (ball.id === heldId) {
      // Pointer velocity fades when the hand stops moving.
      ball.velocity.x *= Math.exp(-20 * delta);
      ball.velocity.y *= Math.exp(-20 * delta);
      continue;
    }
    ball.velocity.x *= decay;
    ball.velocity.y *= decay;
    ball.position.x += ball.velocity.x * delta;
    ball.position.y += ball.velocity.y * delta;
  }
}

export function collideWithWalls(balls: Ball[], bounds: Bounds) {
  for (const ball of balls) {
    for (const axis of ["x", "y"] as const) {
      const size = axis === "x" ? bounds.width : bounds.height;
      const min = Math.min(ball.radius, size / 2);
      const max = Math.max(min, size - ball.radius);
      const clamped = Math.max(min, Math.min(max, ball.position[axis]));
      // Bounce only when crossing a wall, not when already moving back inside.
      if ((ball.position[axis] - clamped) * ball.velocity[axis] > 0) {
        ball.velocity[axis] *= -0.9;
      }
      ball.position[axis] = clamped;
    }
  }
}

export function collideBalls(balls: Ball[], heldId?: number) {
  // Test each pair once. This deliberately exposes the cost of more balls.
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const radius = a.radius + b.radius;
      if (Math.abs(dx) >= radius || Math.abs(dy) >= radius) continue;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= radius * radius) continue;

      const distance = Math.sqrt(distanceSquared);
      const nx = distance > 0 ? dx / distance : 1;
      const ny = distance > 0 ? dy / distance : 0;
      // Mass follows area. A held ball pushes others without being pushed.
      const inverseA = a.id === heldId ? 0 : 1 / (a.radius * a.radius);
      const inverseB = b.id === heldId ? 0 : 1 / (b.radius * b.radius);
      const inverseMass = inverseA + inverseB;
      const overlap = (radius - distance) / inverseMass;
      a.position.x -= nx * overlap * inverseA;
      a.position.y -= ny * overlap * inverseA;
      b.position.x += nx * overlap * inverseB;
      b.position.y += ny * overlap * inverseB;

      // Exchange momentum only when the balls are moving toward each other.
      const approach = (b.velocity.x - a.velocity.x) * nx +
        (b.velocity.y - a.velocity.y) * ny;
      if (approach < 0) {
        const impulse = -(1 + 0.9) * approach / inverseMass;
        a.velocity.x -= impulse * nx * inverseA;
        a.velocity.y -= impulse * ny * inverseA;
        b.velocity.x += impulse * nx * inverseB;
        b.velocity.y += impulse * ny * inverseB;
      }
    }
  }
}

export function limitSpeed(ball: Ball, max = 1_500) {
  const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
  if (speed > max) {
    ball.velocity.x *= max / speed;
    ball.velocity.y *= max / speed;
  }
}
