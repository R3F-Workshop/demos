# 3. Keep balls inside

Think about walls in three parts. Define where a ball is allowed to be, correct it when it leaves, then apply the same rule to each edge.

Continue in `src/demos/ball-collision-practice` from [lesson 2](../02-input/README.md).

## 1. Define the limits

We track the ball's center, so the limits need to sit one radius inside the canvas. Start by logging when a ball crosses them, before deciding how it should respond.

In `physics.ts`, add `Bounds` after the import and `bounceOffWalls` after `moveBall`.

```ts
export type Bounds = { width: number; height: number };

// ... Keep moveBall

export function bounceOffWalls(ball: BallData, { width, height }: Bounds) {
  const { position, radius } = ball;
  const left = -width / 2 + radius;
  const right = width / 2 - radius;
  const bottom = -height / 2 + radius;
  const top = height / 2 - radius;

  console.log(
    ball.id,
    position.x < left || position.x > right || position.y < bottom || position.y > top
      ? "past an edge"
      : "on screen",
  );
}
```

The renderer knows the canvas size. Pass it through the store to physics so the limits follow resizing. In `store.ts`, update the import and `step` type.

```ts
import { moveBall, bounceOffWalls, type Bounds } from "./physics.ts"; // <--
```

```ts
type BallStore = {
  // ...
  step: (delta: number, bounds: Bounds) => void; // <--
  // ...
};
```

Update the action to check walls after movement, including for grabbed balls.

```ts
step: (delta, bounds) => set((state) => {
  const balls = structuredClone(state.balls);

  balls.forEach((ball) => {
    if (ball.id !== state.drag?.id) moveBall(ball, delta);
    bounceOffWalls(ball, bounds); // <--
  });

  return { balls };
}),
```

In `ball.tsx`, update the frame callback inside `BallRenderer`.

```tsx
// Advance the external data once per frame.
useFrame(({ size }, delta) => useBallStore.getState().step(delta, size)); // <--
```

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision-practice). Drag a ball across an edge and back. The console should switch between `on screen` and `past an edge`.

## 2. Give the ball a response

A bounce needs two changes. Put the ball back inside and point its velocity inward. Try this on the horizontal axis first by replacing `bounceOffWalls` with the following.

```ts
export function bounceOffWalls(ball: BallData, { width }: Bounds) {
  const { position, velocity, radius } = ball;
  const left = -width / 2 + radius;
  const right = width / 2 - radius;

  if (position.x < left) {
    position.x = left;
    velocity.x = Math.abs(velocity.x);
  } else if (position.x > right) {
    position.x = right;
    velocity.x = -Math.abs(velocity.x);
  }
}
```

Fling left or right and try resizing. The ball should bounce at either side. The log is gone and the top and bottom are still open.

## 3. Reuse the rule

The vertical axis uses the same idea. Replace `bounceOffWalls` with this version to handle both axes. Each check changes only the position and velocity on its own axis, leaving sideways movement alone.

```ts
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
```

Fling diagonally. The ball should bounce at all four edges. Balls still pass through each other until the next lesson.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=3) · [Next, collisions →](../04-collisions/README.md)
