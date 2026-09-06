# 4. Let balls collide

Next we will plug collision handling into our simulation. It separates overlapping balls and changes their velocities so they bounce, while keeping a grabbed ball under the pointer.

Continue in `src/demos/ball-collision-practice` from [lesson 3](../03-walls/README.md).

## 1. Add collisions

Copy this function into `physics.ts` after `bounceOffWalls`. You can use it as provided and focus on how it connects to the store.

```ts
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
```

`moveBall` and `bounceOffWalls` affect one ball. `collideBalls` takes the whole array because it handles pairs, checking each pair once.

Call it after cloning the array, passing the grabbed ball's ID. Keeping it before `forEach` avoids mixing balls that have already moved with ones that have not, and leaves wall checks last.

```ts
step: (delta, bounds) => set((state) => {
  const balls = structuredClone(state.balls);

  collideBalls(balls, state.drag?.id); // <--

  balls.forEach((ball) => {
    if (ball.id !== state.drag?.id) moveBall(ball, delta);
    bounceOffWalls(ball, bounds);
  });

  return { balls };
}),
```

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision-practice). Watch the balls bounce apart, then drag one into the other and try a gentle fling. Increase `count` in `store.ts` to try more pairs, and reduce `radius` to fit more balls on screen. Fast flings can skip collisions between frames.

## 2. Add performance monitor and controls

Now we get to explore a little. We are going to use Three's built-in inspector to add a performance monitor and slider controls so we can dynamically change the number of balls and their size.

For our purposes, it is good enough to restart the simulation whenever we change the ball count. We will add a `restart` action replaces the balls and clears the drag. In `store.ts`, add the selected `radius` and `restart` to `BallStore`. Either setting can be omitted to keep its current value.

```ts
type BallStore = {
  balls: BallData[];
  radius: number; // <--
  restart: (settings: { count?: number; radius?: number }) => void; // <--
  drag: Drag | null;
  step: (delta: number, bounds: Bounds) => void;
  setBall: (id: number, changes: Partial<BallData>) => void;
  setDrag: (drag: Drag | null) => void;
};
```

Add `radius` with the properties and `restart` with the actions.

```ts
export const useBallStore = create<BallStore>((set) => ({
  balls: createBalls(count, radius),
  radius, // <--
  drag: null,

  restart: (settings) => set((state) => { // <--
    const { count = state.balls.length, radius = state.radius } = settings;
    return { balls: createBalls(count, radius), radius, drag: null };
  }),

  // ...
}));
```

In `ball.tsx`, scale a unit circle so resizing uses the same geometry.

```tsx
return (
  <mesh
    position={[position.x, position.y, 0]}
    scale={radius}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
  >
    <circleGeometry args={[1, 64]} />
    <meshBasicMaterial color="red" toneMapped={false} />
  </mesh>
);
```

## 3. Connect Devtools

Create `devtools.tsx` with the following. `Inspector` shows performance and provides the context that its controls hook needs.

```tsx
import { Inspector, useInspectorControls } from "@react-three/drei/webgpu";

import { useBallStore } from "./store";

export function Devtools() {
  return (
    <Inspector>
      <Controls />
    </Inspector>
  );
}

function Controls() {
  const { balls, radius, restart } = useBallStore.getState();

  useInspectorControls({
    count: { value: balls.length, label: "Balls", min: 1, max: 5_000, step: 1, onChange: (count) => restart({ count }) },
    radius: { value: radius, label: "Radius", min: 2, max: 40, step: 1, onChange: (radius) => restart({ radius }) },
  }, { title: "Ball collision" });

  return null;
}
```

Finally, import `Devtools` in `scene.tsx` and enable it beside `BallRenderer` inside Canvas.

```tsx
<BallRenderer />
<Devtools />
```

Try the Balls and Radius sliders. Each change resets positions and momentum while keeping the other setting. Add more balls and watch the FPS counter to stress test the simulation.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=4) · [Next, Koota →](../05-koota/README.md)
