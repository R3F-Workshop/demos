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
  world.query(Position, Velocity, Radius).useStores(([position, velocity, radius], layout) => {
    const { entities, offsets, pageIds, pageStarts, pageCounts, pageCount } = layout;

    for (let p = 0; p < pageCount; p++) {
      const pageA = pageIds[p];
      const positionAX = position.x[pageA];
      const positionAY = position.y[pageA];
      const velocityAX = velocity.x[pageA];
      const velocityAY = velocity.y[pageA];
      const radiusAPage = radius.value[pageA];
      const endA = pageStarts[p] + pageCounts[p];

      for (let i = pageStarts[p]; i < endA; i++) {
        const a = offsets[i];
        const radiusA = radiusAPage[a];

        for (let q = p; q < pageCount; q++) {
          const pageB = pageIds[q];
          const positionBX = position.x[pageB];
          const positionBY = position.y[pageB];
          const velocityBX = velocity.x[pageB];
          const velocityBY = velocity.y[pageB];
          const radiusBPage = radius.value[pageB];
          const endB = pageStarts[q] + pageCounts[q];

          for (let j = Math.max(i + 1, pageStarts[q]); j < endB; j++) {
            const b = offsets[j];
            const dx = positionBX[b] - positionAX[a];
            const dy = positionBY[b] - positionAY[a];
            const distance = Math.hypot(dx, dy);
            const overlap = radiusA + radiusBPage[b] - distance;
            if (overlap <= 0) continue;

            const normalX = distance === 0 ? 1 : dx / distance;
            const normalY = distance === 0 ? 0 : dy / distance;
            const moveA = entities[i] === held ? 0 : 1;
            const moveB = entities[j] === held ? 0 : 1;
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
  });
}
