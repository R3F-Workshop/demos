# 4. Let balls collide

[Run this step](http://localhost:5173/ball-collision-steps?step=4)

Add [collisions.ts](collisions.ts). For each pair of balls:

1. Check once using `j = i + 1`. They overlap when the distance between centers is less than their combined radii.
2. Find the direction from one center to the other, called the normal. Move each ball half the overlap apart along it. A held ball stays put, so its neighbor moves the full amount.
3. If approaching, exchange velocity along the normal. For equal masses, a head-on collision swaps velocities: `40, -40` becomes `-40, 40`.

In [store.ts](store.ts), move the balls, then resolve collisions and walls:

```ts
collideBalls(balls, state.drag?.id);
balls.forEach((ball) => bounceOffWalls(ball, bounds));
return { balls };
```

**Try:** Fling one ball gently into another, then push it while dragging. Fast flings can skip collisions between frames.

[Back to overview](../README.md)
