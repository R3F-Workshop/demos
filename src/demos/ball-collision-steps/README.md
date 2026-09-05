# Ball collision, step by step

Build on [the simple ball](../ball-collision-simple/ball.tsx). Each folder contains a complete step, with instructions beside the code.

Run `pnpm dev` and open [the demo](http://localhost:5173/ball-collision-steps).

1. [BallRenderer](01-renderer/README.md): move state into Zustand and render multiple balls.
2. [Input](02-input/README.md): drag a ball and release it with velocity.
3. [Walls](03-walls/README.md): keep balls inside the canvas.
4. [Collisions](04-collisions/README.md): make balls bounce off each other.

Each lesson’s `page.tsx` renders its `scene.tsx`, which contains the Canvas. Compare the same files between steps. Reload to reset. Balls can leave the screen until step 3.
