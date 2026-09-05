# 1. From Ball to BallRenderer

Move the ball data into Zustand, render an array of balls, then move them with one frame callback.

Copy `page.tsx`, `scene.tsx`, and `ball.tsx` from [the simple demo](../../ball-collision-simple/) into `src/demos/ball-collision-practice`. Make the following edits there. The files beside this guide contain the completed version.

## 1. Create the ball store

Create `store.ts` with two balls. Position and velocity both use `{ x, y }`. Each ball gets an `id` for its React key and a `radius` for its size.

```ts
import { create } from "zustand";

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
  balls: [
    { id: 0, position: { x: -100, y: 0 }, velocity: { x: 40, y: 0 }, radius: 40 },
    { id: 1, position: { x: 100, y: 0 }, velocity: { x: -40, y: 0 }, radius: 40 },
  ],
}));
```

## 2. Render the array

Replace `ball.tsx` with this. `BallRenderer` subscribes to the array. Each `Ball` draws its props, replacing its local state and start/end logic.

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

To render the balls, replace the `Ball` import in `scene.tsx`.

```tsx
import { BallRenderer } from "./ball";
```

Replace the `<group>` and its `<Ball />` inside Canvas with `<BallRenderer />`.

```tsx
<BallRenderer />
```

The store positions each ball around the canvas center, so the group's offset is no longer needed. Keep `page.tsx` as copied.

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision-practice). You should see two stationary red circles.

## 3. Add movement to the store

We update Zustand immutably by creating new state without changing the existing state. `structuredClone` copies the balls and their nested positions, so `+=` only changes the copies. Returning `{ balls }` passes the new array to `set` and notifies the renderer.

In `store.ts`, add `step` to the `BallStore` type.

```ts
step: (delta: number) => void;
```

Change `() =>` to `(set) =>` in `create`, then add this action after `balls`.

```ts
step: (delta) => set((state) => {
  const balls = structuredClone(state.balls);

  balls.forEach(({ position, velocity }) => {
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;
  });

  return { balls };
}),
```

`delta` is elapsed seconds, so `velocity * delta` is the distance to move.

## 4. Advance once per frame

Add this import at the top of `ball.tsx`.

```tsx
import { useFrame } from "@react-three/fiber/webgpu";
```

Inside `BallRenderer`, add the frame callback after the `balls` subscription.

```tsx
// Advance the external data once per frame.
useFrame((_, delta) => useBallStore.getState().step(delta));
```

Both balls now move, pass through each other, and leave the screen. Reload to reset. Add a third ball with a unique `id` to try the same renderer with more data.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=1) · [Next, input →](../02-input/README.md)
