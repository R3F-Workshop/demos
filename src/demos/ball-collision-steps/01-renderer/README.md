# 1. From Ball to BallRenderer

Move the ball data into Zustand, render an array of balls, then move them with one frame callback.

Copy `page.tsx`, `scene.tsx`, and `ball.tsx` from [the simple demo](../../ball-collision-simple/) into `src/demos/ball-collision-practice`. Make the following edits there. The files beside this guide contain the completed version.

## 1. Create the ball store

It all begins with the data model. We are modeling the balls with position, velocity and radius. Create `store.ts` with `count` and `radius` as the settings to change.

```ts
import { create } from "zustand";

const count = 2;
const radius = 40;

export type Vec2 = { x: number; y: number };
export type BallData = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
};

type BallStore = {
  balls: BallData[];
};

export const useBallStore = create<BallStore>(() => ({
  balls: createBalls(count, radius),
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
```

`createBalls(count, radius)` uses `Array.from` to create the requested number of balls with unique IDs and the chosen radius. Random positions scatter them around the center. Some may overlap until we add collisions in step 4.

## 2. Render the array

Now one component can render as many balls as we create. In `ball.tsx` add the `BallRenderer` component below. `BallRenderer` subscribes to the array provided by Zustand and each `Ball` draws its props, replacing its local state and start/end logic.

```tsx
import { useBallStore, type BallData } from "./store";

export function BallRenderer() {
  const balls = useBallStore((state) => state.balls);
  return balls.map((ball) => <Ball key={ball.id} {...ball} />);
}

function Ball({ position, radius }: BallData) {
  return (
    <mesh position={[position.x, position.y, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh>
  );
}
```

To render the balls, replace the `Ball` import in `scene.tsx` and replace the `<group>` and its `<Ball />` inside Canvas with `<BallRenderer />`.

```tsx
<Canvas
  orthographic
  camera={{ position: [0, 0, 500], zoom: 1 }}
  background="#ffeab6"
  style={{ height: "100dvh" }}
>
  <BallRenderer />
</Canvas>
```

The store positions each ball around the canvas center, so the group's offset is no longer needed.

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision-practice). You should see two stationary red circles. Change `count` to `20` and `radius` to `20` in `store.ts`, then reload to see 20 smaller balls.

## 3. Move the balls each frame

Create `physics.ts` with our first transform, `moveBall`. `delta` is elapsed seconds, so `velocity * delta` gives the distance to move.

```ts
import type { BallData } from "./store.ts";

export function moveBall({ position, velocity }: BallData, delta: number) {
  position.x += velocity.x * delta;
  position.y += velocity.y * delta;
}
```

In `store.ts`, import it below Zustand.

```ts
import { create } from "zustand";

import { moveBall } from "./physics.ts"; // <--
```

We update Zustand immutably by creating new state without changing the existing state. `structuredClone` copies the balls and their nested positions, so `+=` only changes the copies. Returning `{ balls }` passes the new array to `set` and notifies the renderer.

We create a step action to step our ball simulation forward by a delta time. This then gets called in the frame loop.

In `store.ts`, add `step` to the `BallStore` type.

```ts
type BallStore = {
  balls: BallData[];
  step: (delta: number) => void; // <--
};
```

Change `() =>` to `(set) =>` in `create`. `set` is used to tell Zustand there is a state change.

```ts
export const useBallStore = create<BallStore>((set) => ({
  // ...
}));
```

Finally, add this action after `balls`.

```ts
step: (delta) => set((state) => {
  const balls = structuredClone(state.balls);

  balls.forEach((ball) => moveBall(ball, delta));

  return { balls };
}),
```

In `ball.tsx`, import `useFrame` and call `step` inside `BallRenderer` to get real-time motion.

```tsx
import { useFrame } from "@react-three/fiber/webgpu"; // <--

import { useBallStore, type BallData } from "./store";

export function BallRenderer() {
  const balls = useBallStore((state) => state.balls);

  // Advance the external data once per frame.
  useFrame((_, delta) => useBallStore.getState().step(delta)); // <--

  return balls.map((ball) => <Ball key={ball.id} {...ball} />);
}
```

The balls now move, pass through each other, and leave the screen. Reload to reset. Change `count` and `radius` to try more balls at different sizes.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=1) · [Next, input →](../02-input/README.md)
