# 3. Keep balls inside

[Run this step](http://localhost:5173/ball-collision-steps?step=3)

In [ball.tsx](ball.tsx), pass the current canvas size to `step`:

```tsx
useFrame(({ size }, delta) => useBallStore.getState().step(delta, size));
```

In [walls.ts](walls.ts), keep each center one radius inside the edges. The left limit is `-width / 2 + radius`:

```ts
if (position.x < left) {
  position.x = left;
  velocity.x = Math.abs(velocity.x);
} else if (position.x > right) {
  position.x = right;
  velocity.x = -Math.abs(velocity.x);
}
```

Repeat for y. `Math.abs` changes direction without changing speed.

In [store.ts](store.ts), copy each ball's position and velocity, move it, then call `bounceOffWalls`. Return the new array so Zustand publishes the update.

**Try:** Fling diagonally and resize the window. Balls should bounce at the current edges.

[Next: collisions →](../04-collisions/README.md)
