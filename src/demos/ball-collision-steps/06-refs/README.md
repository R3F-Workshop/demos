# 6. From position props to mesh refs

Each ball currently subscribes to its position and rerenders when it moves. With many balls, that means React work every frame just to update coordinates. We will keep the position in Koota and move each mesh through a ref, avoiding those rerenders.

Continue in `src/demos/ball-collision` from [lesson 5](../05-koota/README.md). All edits are in `ball.tsx`.

## 1. Get a mesh ref

A ref gives us access to the Three.js mesh so we can update it directly. Inside `Ball`, replace `useTrait(entity, Position)` with a mesh ref. Keep the radius subscription and actions.

```tsx
function Ball({ entity }: { entity: Entity }) {
  const radius = useTrait(entity, Radius);
  const mesh = useRef<Mesh>(null); // <--
  const { startDrag, moveDrag, endDrag } = useActions(actions);

  // ...
}
```

Remove `position` from the guard before `return`, and replace the mesh's `position` prop with `ref`.

```tsx
if (!radius) return null; // <--

return (
  <mesh
    ref={mesh} // <--
    scale={radius.value}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
  >
    {/* ... Keep the geometry and material */}
  </mesh>
);
```

## 2. Read position each frame

Now we can move the mesh without rendering `Ball` again, avoid React doing any additional work. Add a frame callback inside `Ball`, after the hooks and before the pointer handlers.

```tsx
useFrame(() => {
  if (!mesh.current || !entity.isAlive()) return;
  const position = entity.get(Position);
  if (position) mesh.current.position.set(position.x, position.y, 0);
});
```

Each frame reads the entity's current position and changes the mesh's existing vector. The alive check handles balls removed by a restart.

## 3. Run physics first

Physics needs to finish before the balls copy their positions so the meshes show the current frame's result. In `BallRenderer`, name its frame callback `"physics"` so the mesh callbacks can run after it.

Also remove the `entity.changed(Position)` loop. We no longer have position subscribers to notify.

```tsx
useFrame(({ size }, delta) => {
  collideBalls(world);
  moveBalls(world, delta);
  bounceOffWalls(world, size);
}, { id: "physics" }); // <--
```

In `Ball`, add `after: "physics"` to the mesh's frame callback. This makes the order explicit without relying on priority numbers.

```tsx
useFrame(() => {
  // ... Keep the position update
}, { after: "physics" }); // <--
```

React still handles adding and removing balls and updating their scale. Movement now goes through the mesh ref, and React Compiler stays enabled.

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision). Drag, fling and restart the balls. They should behave as before. Record in React DevTools Profiler to check that movement no longer renders the ball components.

See [ball.tsx](ball.tsx) for the completed code.

## Optional: Optimizing even further

Each ball still registers its own `useFrame`, so N balls means N callbacks just to sync positions. A next step is to move that sync into a single `useFrame` that updates all N meshes after physics. The same meshes still need updating, but one shared callback could reduce the scheduling overhead.

Try exploring this with a large ball count and compare frame times.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=6) · [Previous, Koota](../05-koota/README.md) · [Back to overview](../README.md)
