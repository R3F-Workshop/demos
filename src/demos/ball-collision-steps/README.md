# Ball collision, step by step

Start with [lesson 1](01-renderer/README.md) and edit the existing [src/demos/ball-collision](../ball-collision/) folder throughout all five lessons. Each guide shows every edit needed for the next step. The numbered lesson folders contain the completed examples.

1. [BallRenderer](01-renderer/README.md) moves state into Zustand and renders multiple balls.
2. [Input](02-input/README.md) adds dragging and fling velocity to each Ball.
3. [Walls](03-walls/README.md) keeps balls inside the canvas.
4. [Collisions](04-collisions/README.md) makes balls bounce off each other.
5. [Koota](05-koota/README.md) replaces Zustand with traits, entities, a world, actions and systems.

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision). Change `count` and `radius` in `store.ts` to try different amounts and sizes. At the end of step 4, add Devtools with sliders and an FPS counter. Step 5 keeps those controls and moves the defaults to `Settings` in `traits.ts`. Balls can leave the screen until step 3.

[Explore the completed steps](http://localhost:5173/ball-collision-steps).
