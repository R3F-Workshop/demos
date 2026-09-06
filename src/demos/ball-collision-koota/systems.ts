import { Not, type World } from "koota";

import { Drag, Position, Radius, Velocity } from "./traits";

export function moveBalls(world: World, delta: number) {
  world.query(Position, Velocity, Not(Drag)).updateEach(([position, velocity]) => {
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;

    // Friction slows the ball after release.
    velocity.x *= 0.99 ** (delta * 60);
    velocity.y *= 0.99 ** (delta * 60);
  }, { changeDetection: "never" });
}

export function bounceOffWalls(world: World, { width, height }: { width: number; height: number }) {
  world.query(Position, Velocity, Radius).updateEach(([position, velocity, radius]) => {
    const left = -width / 2 + radius.value;
    const right = width / 2 - radius.value;
    const bottom = -height / 2 + radius.value;
    const top = height / 2 - radius.value;

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
  }, { changeDetection: "never" });
}

export function collideBalls(world: World) {
  const held = world.queryFirst(Drag);

  // Cache each page before comparing its balls.
  const pages = world.query(Position, Velocity, Radius).getPages();

  for (const pageA of pages) {
    const [{ x: positionAX, y: positionAY }, { x: velocityAX, y: velocityAY }, radiusAStore] = pageA.stores;
    const radiusAPage = radiusAStore.value;

    for (let i = 0; i < pageA.indices.length; i++) {
      const a = pageA.indices[i];
      const radiusA = radiusAPage[a];

      for (let q = pageA.index; q < pages.length; q++) {
        const pageB = pages[q];
        const [{ x: positionBX, y: positionBY }, { x: velocityBX, y: velocityBY }, radiusBStore] = pageB.stores;
        const radiusBPage = radiusBStore.value;

        for (let j = q === pageA.index ? i + 1 : 0; j < pageB.indices.length; j++) {
          const b = pageB.indices[j];
          const dx = positionBX[b] - positionAX[a];
          const dy = positionBY[b] - positionAY[a];
          const distance = Math.hypot(dx, dy);
          const overlap = radiusA + radiusBPage[b] - distance;
          if (overlap <= 0) continue;

          const normalX = distance === 0 ? 1 : dx / distance;
          const normalY = distance === 0 ? 0 : dy / distance;
          const moveA = pageA.entities[i] === held ? 0 : 1;
          const moveB = pageB.entities[j] === held ? 0 : 1;
          const share = moveA + moveB;

          // Free balls separate while the held ball stays under the pointer.
          positionAX[a] -= normalX * overlap * moveA / share;
          positionAY[a] -= normalY * overlap * moveA / share;
          positionBX[b] += normalX * overlap * moveB / share;
          positionBY[b] += normalY * overlap * moveB / share;

          // Only exchange momentum when the balls are approaching.
          const relativeSpeed = (velocityBX[b] - velocityAX[a]) * normalX +
            (velocityBY[b] - velocityAY[a]) * normalY;
          if (relativeSpeed >= 0) continue;
          const impulse = -2 * relativeSpeed / share;
          velocityAX[a] -= impulse * normalX * moveA;
          velocityAY[a] -= impulse * normalY * moveA;
          velocityBX[b] += impulse * normalX * moveB;
          velocityBY[b] += impulse * normalY * moveB;
        }
      }
    }
  }
}
