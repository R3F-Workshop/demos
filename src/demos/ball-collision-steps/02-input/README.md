# 2. Drag and fling

Next we will enable grabbing a ball, moving it with the pointer, and releasing it with momentum. Ball handles input while Zustand keeps the data.

Continue in `src/demos/ball-collision-practice` from [lesson 1](../01-renderer/README.md).

## 1. Model a drag

We model a drag on one ball at a time. We need its `id`, the `pointerId` controlling it, and an `offset` to keep the original grab point under the pointer.

In `store.ts`, add `Drag` after `BallData`.

```ts
type Drag = {
  id: number;
  pointerId: number;
  offset: Vec2;
};
```

We need a way to set the grabbed ball's position and velocity, so add `drag`, `setBall`, and `setDrag` to `BallStore`. `Partial<BallData>` lets us pass only the properties we change.

```ts
type BallStore = {
  balls: BallData[];
  drag: Drag | null; // <--
  step: (delta: number) => void;
  setBall: (id: number, changes: Partial<BallData>) => void; // <--
  setDrag: (drag: Drag | null) => void; // <--
};
```

We start with no ball held, so add `drag: null` after `balls`. Comments with `...` stand for existing code to keep.

```ts
export const useBallStore = create<BallStore>((set) => ({
  balls: createBalls(count, radius),
  drag: null, // <--
  // ...
}));
```

Add `setBall` and `setDrag` after `step`. `setBall` copies the matching ball with new properties. `setDrag` sets the active drag, or clears it with `null`.

```ts
setBall: (id, changes) => set((state) => ({
  balls: state.balls.map((ball) => {
    if (ball.id !== id) return ball;
    return { ...ball, ...changes };
  }),
})),

setDrag: (drag) => set({ drag }),
```

## 2. Grab and drag a ball

Let's make the pointer move a ball and leave it where we release it.

In `scene.tsx`, update the Canvas style so dragging does not scroll the page or select text.

```tsx
<Canvas
  orthographic
  camera={{ position: [0, 0, 500], zoom: 1 }}
  background="#ffeab6"
  style={{ height: "100dvh", touchAction: "none", userSelect: "none" }}
>
  <BallRenderer />
</Canvas>
```

In `ball.tsx`, add `ThreeEvent` to the Fiber import.

```tsx
import { useFrame, type ThreeEvent } from "@react-three/fiber/webgpu";
```

Add `id` to Ball's props and read both actions so its handlers can set the ball and drag data.

```tsx
function Ball({ id, position, radius }: BallData) {
  const { setBall, setDrag } = useBallStore.getState();

  // ...
}
```

Add the following callbacks inside `Ball`, after the store actions and before `return`.

`onPointerDown` remembers the grab offset, stops the ball, and captures the pointer so dragging continues outside the circle.

```tsx
function onPointerDown(event: ThreeEvent<PointerEvent>) {
  if (useBallStore.getState().drag) return;

  event.stopPropagation();

  // Set the drag for the ball via ID with an offset from the pointer event
  const point = event.unprojectedPoint;
  setDrag({
    id,
    pointerId: event.pointerId,
    offset: { x: point.x - position.x, y: point.y - position.y },
  });

  // Set the ball's velocity to 0 since we are taking over control
  setBall(id, { velocity: { x: 0, y: 0 } });
  // Capture the pointer so the interaction does not get interrupted
  (event.target as Element).setPointerCapture(event.pointerId);
}
```

`onPointerMove` places the grabbed ball under the pointer while preserving the original grab offset.

```tsx
function onPointerMove(event: ThreeEvent<PointerEvent>) {
  const { drag } = useBallStore.getState();
  // Skip this event if the ball is not actively being dragged
  if (drag?.id !== id || drag.pointerId !== event.pointerId) return;

  event.stopPropagation();

  // Keep the ball's position locked on the pointer
  const point = event.unprojectedPoint;
  setBall(id, {
    position: { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
  });
}
```

`onPointerUp` ends the drag and releases pointer capture, leaving the ball where it was dropped.

```tsx
function onPointerUp(event: ThreeEvent<PointerEvent>) {
  const { drag } = useBallStore.getState();
  if (drag?.id !== id || drag.pointerId !== event.pointerId) return;

  event.stopPropagation();

  // End the drag and release the pointer capture
  setDrag(null);
  (event.target as Element).releasePointerCapture(event.pointerId);
}
```

Finally, connect the callbacks to the mesh.

```tsx
return (
  <mesh
    position={[position.x, position.y, 0]}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
  >
    <circleGeometry args={[radius, 64]} />
    <meshBasicMaterial color="red" toneMapped={false} />
  </mesh>
);
```

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision-practice). Grab near a ball's edge, drag it around, and let go. It should follow the pointer and stay where you release it. You can grab it again. Reload if the other ball has left the screen.

## 3. Give the ball fling velocity

Now a released ball should keep moving. In `Ball`, replace `onPointerMove` with this. It reads the previous position and uses the change to set velocity for the throw.

```tsx
function onPointerMove(event: ThreeEvent<PointerEvent>) {
  const { drag, balls } = useBallStore.getState();
  // Skip this event if the ball is not actively being dragged
  if (drag?.id !== id || drag.pointerId !== event.pointerId) return;

  event.stopPropagation();

  const ball = balls.find((ball) => ball.id === id)!;

  // Keep the ball's position locked on the pointer
  const point = event.unprojectedPoint;
  setBall(id, {
    position: { x: point.x - drag.offset.x, y: point.y - drag.offset.y },
    velocity: {
      x: (point.x - drag.offset.x - ball.position.x) * 100,
      y: (point.y - drag.offset.y - ball.position.y) * 100,
    },
  });
}
```

`unprojectedPoint` gives scene coordinates, with positive y pointing up. Multiplying the position change by `100` sets fling strength.

Velocity is being kept while dragging so it is primed for letting go, but this means velocity would get applied to the ball we are dragging too. We need to skip applying velocity when it is the ball we are dragging. In `store.ts`, skip `moveBall` for the grabbed ball in `step`.

```ts
step: (delta) => set((state) => {
  const balls = structuredClone(state.balls);

  balls.forEach((ball) => {
    if (ball.id !== state.drag?.id) moveBall(ball, delta); // <--
  });
  return { balls };
}),
```

Try a throw. The ball should stay under the pointer while held, then continue moving when released. It will keep going offscreen until you reload.

## 4. Add friction

A throw should gradually settle with friction. In `physics.ts`, add it after movement in `moveBall`. The store already skips held balls, so only free balls slow down.

```ts
export function moveBall({ position, velocity }: BallData, delta: number) {
  position.x += velocity.x * delta;
  position.y += velocity.y * delta;

  // Friction slows the ball after release.
  velocity.x *= 0.99 ** (delta * 60);
  velocity.y *= 0.99 ** (delta * 60);
}
```

The exponent keeps friction consistent across frame rates. Try another throw and watch it slow down.

## 5. Harden pointer loss

If the mesh misses the release event, the ball can stay marked as dragged and stop moving. Clear the drag when pointer capture is lost too.

In `scene.tsx`, import the store and add `onLostPointerCapture` to Canvas. React handles this event on the Canvas wrapper.

```tsx
import { Canvas } from "@react-three/fiber/webgpu";

import { BallRenderer } from "./ball";
import { useBallStore } from "./store";

export function BallCollisionScene() {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 500], zoom: 1 }}
      background="#ffeab6"
      style={{ height: "100dvh", touchAction: "none", userSelect: "none" }}
      onLostPointerCapture={() => useBallStore.getState().setDrag(null)}
    >
      <BallRenderer />
    </Canvas>
  );
}
```

`setDrag(null)` ends the drag while keeping momentum. The pointer callbacks in `Ball` stay as they are.

Try dragging quickly outside the circle and releasing. The drag should end and the ball should keep moving.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=2) · [Next, walls →](../03-walls/README.md)
