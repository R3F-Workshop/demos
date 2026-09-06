# 5. From Zustand to Koota

Keep the same balls, physics, pointer events and meshes. Change how the data is stored and updated.

Continue in `src/demos/ball-collision` from [lesson 4](../04-collisions/README.md). Koota is already installed. The files beside this guide contain the completed version.

| Zustand example | Koota equivalent |
| --- | --- |
| Store holding balls and settings | **World** holding entities and shared traits |
| Ball object with an `id` | **Entity**, an identity with traits attached |
| `position`, `velocity`, `radius` fields | **Traits**, reusable data definitions |
| `restart`, `setBall`, `setDrag` | **Actions**, functions bound to a world |
| Physics functions called by `step` | **Systems**, functions that query and update entities |

## 1. Define traits

Create `traits.ts`:

```ts
import { trait } from "koota";

export const IsBall = trait();
export const Position = trait({ x: 0, y: 0 });
export const Velocity = trait({ x: 0, y: 0 });
export const Radius = trait({ value: 40 });
export const Drag = trait({ pointerId: 0, offsetX: 0, offsetY: 0 });
export const Settings = trait({ count: 2, radius: 40 });
```

These are definitions with default values. Each ball gets its own data when spawned. `IsBall` is a **tag**, a trait with no data.

**Different:** the store's single `drag` object becomes a `Drag` trait on the held entity. Adding or removing it starts or ends a drag. `Settings` will live on the world.

## 2. Create entities through actions

Create `actions.ts`. `restart` does the same job as before, but destroys and spawns entities instead of replacing an array. `world.spawn` returns the entity, so we no longer assign ball IDs.

```ts
import { createActions, type Entity } from "koota";

import { Drag, IsBall, Position, Radius, Settings, Velocity } from "./traits";

export const actions = createActions((world) => ({
  restart: (settings: { count?: number; radius?: number }) => {
    world.set(Settings, settings);
    const { count, radius } = world.get(Settings)!;
    world.query(IsBall).forEach((entity) => entity.destroy());

    for (let i = 0; i < count; i++) {
      world.spawn(
        IsBall,
        Position({ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 300 }),
        Velocity({ x: i % 2 === 0 ? 40 : -40, y: 0 }),
        Radius({ value: radius }),
      );
    }
  },

  startDrag: (entity: Entity, point: { x: number; y: number }, pointerId: number) => {
    if (world.queryFirst(Drag)) return false;
    const position = entity.get(Position)!;
    entity.add(Drag({ pointerId, offsetX: point.x - position.x, offsetY: point.y - position.y }));
    entity.set(Velocity, { x: 0, y: 0 });
    return true;
  },

  moveDrag: (entity: Entity, point: { x: number; y: number }) => {
    const drag = entity.get(Drag)!;
    const position = entity.get(Position)!;
    const x = point.x - drag.offsetX;
    const y = point.y - drag.offsetY;
    entity.set(Velocity, { x: (x - position.x) * 100, y: (y - position.y) * 100 });
    entity.set(Position, { x, y });
  },

  endDrag: () => {
    world.query(Drag).forEach((entity) => entity.remove(Drag));
  },
}));
```

A **query** finds entities with the requested traits. `queryFirst(Drag)` preserves our one-pointer-at-a-time rule. The pointer offset and fling math come straight from Zustand's `Ball`.

**Different:** `entity.set(Trait, values)` writes trait data and notifies subscribers. For these traits, `entity.get` returns a snapshot. Mutating that snapshot alone does not update the world.

## 3. Create and provide the world

Create `world.ts`. This replaces the store's initialization:

```ts
import { createWorld } from "koota";

import { actions } from "./actions";
import { Settings } from "./traits";

export const world = createWorld(Settings);
actions(world).restart({});

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
```

The world owns the entities and shared settings. World traits do not appear in entity queries. The last line cleans up during hot reload.

Replace `page.tsx` so the React hooks use this world:

```tsx
import { WorldProvider } from "koota/react";

import { BallCollisionScene } from "./scene";
import { world } from "./world";

export default function Demo() {
  return (
    <WorldProvider world={world}>
      <BallCollisionScene />
    </WorldProvider>
  );
}
```

## 4. Move physics into systems

A system is a plain function. We call it each frame, just like the old physics functions. Create `systems.ts`:

```ts
import { Not, type World } from "koota";

import { Drag, Position, Radius, Velocity } from "./traits";

export function moveBalls(world: World, delta: number) {
  world.query(Position, Velocity, Not(Drag)).updateEach(([position, velocity]) => {
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;

    velocity.x *= 0.99 ** (delta * 60);
    velocity.y *= 0.99 ** (delta * 60);
  });
}
```

`Not(Drag)` replaces `ball.id !== state.drag?.id`. `updateEach` writes the changed values back and detects changes for subscribed traits. The movement math is unchanged, and we no longer need `structuredClone` or Zustand's `set`.

Append `bounceOffWalls` and `collideBalls` from the completed [systems.ts](systems.ts). Their physics is already covered by the Zustand lessons:

- **Walls:** the same body runs inside `query(Position, Velocity, Radius).updateEach(...)`. `radius` becomes `radius.value`.
- **Collisions:** the same pair checks, separation and impulse math run over `getPages()`. This is the least direct transfer: Koota exposes arrays of trait fields instead of ball objects. `page.indices[i]` is a data offset, while `page.entities[i]` is the entity used to identify the held ball.

`getPages()` is an optimization in this example, not a requirement for systems. Direct array writes bypass change detection, so the frame callback below explicitly notifies Position subscribers after physics.

## 5. Connect React and input

Replace `ball.tsx`:

```tsx
import { useFrame, type ThreeEvent } from "@react-three/fiber/webgpu";
import type { Entity } from "koota";
import { useActions, useQuery, useTrait, useWorld } from "koota/react";

import { actions } from "./actions";
import { bounceOffWalls, collideBalls, moveBalls } from "./systems";
import { Drag, IsBall, Position, Radius } from "./traits";

export function BallRenderer() {
  const world = useWorld();
  const balls = useQuery(IsBall);

  useFrame(({ size }, delta) => {
    collideBalls(world);
    moveBalls(world, delta);
    bounceOffWalls(world, size);
    world.query(Position).forEach((entity) => entity.changed(Position));
  });

  return balls.map((entity) => <Ball key={entity} entity={entity} />);
}

function Ball({ entity }: { entity: Entity }) {
  const radius = useTrait(entity, Radius);
  const position = useTrait(entity, Position);
  const { startDrag, moveDrag, endDrag } = useActions(actions);

  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    if (!startDrag(entity, event.unprojectedPoint, event.pointerId)) return;
    (event.target as Element).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ThreeEvent<PointerEvent>) {
    if (entity.get(Drag)?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    moveDrag(entity, event.unprojectedPoint);
  }

  function onPointerUp(event: ThreeEvent<PointerEvent>) {
    if (entity.get(Drag)?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    endDrag();
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  if (!radius || !position) return null;

  return (
    <mesh
      position={[position.x, position.y, 0]}
      scale={radius.value}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <circleGeometry args={[1, 64]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh>
  );
}
```

**Different:** `useQuery(IsBall)` subscribes to which entities match, not their positions. Each `Ball` subscribes to its own data with `useTrait`. Mesh props and pointer capture work as before. Systems still run in the same order: collisions, movement, walls.

In `scene.tsx`, replace the store import with:

```ts
import { useActions } from "koota/react";
import { actions } from "./actions";
```

Inside `BallCollisionScene`, add `const { endDrag } = useActions(actions)` and change the Canvas prop to `onLostPointerCapture={endDrag}`.

In `devtools.tsx`, replace the store import with:

```ts
import { useActions, useWorld } from "koota/react";
import { actions } from "./actions";
import { Settings } from "./traits";
```

Replace the first line inside `Controls` with:

```ts
const { count, radius } = useWorld().get(Settings)!;
const { restart } = useActions(actions);
```

Change the count control's `value: balls.length` to `value: count`. Keep the slider callbacks. Delete the practice folder's `store.ts` and `physics.ts`, which are now unused.

## Try it

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision). Drag one ball into another, fling it against a wall, then change Balls and Radius. Each slider change should reset positions, momentum and drag while keeping the other setting.

Compare with [the Zustand step](http://localhost:5173/ball-collision-steps?step=4) and [the completed Koota step](http://localhost:5173/ball-collision-steps?step=5). Both still use React props, one mesh per ball and all-pairs collisions. This migration changes state management, not those scaling limits.

API reference: [Koota concepts](https://github.com/pmndrs/koota#quick-start), [change detection](https://github.com/pmndrs/koota#change-detection-with-updateeach), [direct trait arrays](https://github.com/pmndrs/koota#modifying-trait-stores-directly).

[Run the completed step](http://localhost:5173/ball-collision-steps?step=5) · [Back to overview](../README.md)
