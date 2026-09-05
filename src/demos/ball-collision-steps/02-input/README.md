# 2. Drag and fling

[Run this step](http://localhost:5173/ball-collision-steps?step=2)

In [scene.tsx](scene.tsx), put pointer handlers on Canvas. Convert pointer coordinates to the canvas center, with positive y pointing up. Capture the pointer when grabbing a ball so dragging continues outside the canvas.

In [store.ts](store.ts), add three actions:

1. `startDrag`: find a ball within its radius. Save its ID, pointer ID, grab offset, and the pointer position with its timestamp as the first sample. Stop its velocity and skip it during `step`.
2. `moveDrag`: ignore repeated pointer positions, then set position to pointer minus offset. Keep the samples from the last 50 ms (always at least the previous one) and calculate velocity from the distance across that window divided by its elapsed seconds:

```ts
velocity: {
  x: (point.x - oldest.point.x) / delta,
  y: (point.y - oldest.point.y) / delta,
},
```

A short window follows a curved throw closely instead of lagging behind it, and spanning several samples keeps a tiny final movement from killing the throw.

3. `endDrag`: clear the drag. Keep velocity to fling, or zero it when cancelled or held still for more than 150 ms before release. A brief hesitation still flings.

**Try:** Grab near the edge, drag, then fling. The grab point should stay under the pointer. Wind up in an arc and let go: the ball should leave along the direction you were moving.

[Next: walls →](../03-walls/README.md)
