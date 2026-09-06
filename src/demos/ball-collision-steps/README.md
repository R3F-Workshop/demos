# Ball collision, step by step

Start with [lesson 1](01-renderer/README.md), then keep building in the same `src/demos/ball-collision-practice` folder. Each guide shows every edit needed for the next step.

1. [BallRenderer](01-renderer/README.md) moves state into Zustand and renders multiple balls.
2. [Input](02-input/README.md) adds dragging and fling velocity to each Ball.
3. [Walls](03-walls/README.md) keeps balls inside the canvas.
4. [Collisions](04-collisions/README.md) makes balls bounce off each other.

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision-practice). Change `count` and `radius` in `store.ts` to try different amounts and sizes. At the end of step 4, add Devtools with sliders and an FPS counter. Balls can leave the screen until step 3.

[Explore the completed steps](http://localhost:5173/ball-collision-steps).
