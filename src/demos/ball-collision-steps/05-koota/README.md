# 5. From Zustand to Koota

Our Zustand store clones the balls each frame and publishes a new array. Koota lets us update their data through queries and subscribe to each ball separately. We will move the data into Koota while keeping the same physics and interactions.

Continue in `src/demos/ball-collision` from [lesson 4](../04-collisions/README.md). Koota is already installed. The files beside this guide contain the completed version.

## 1. Define traits

A Koota **world** holds **entities**, and each entity carries data defined by **traits**. Our ball fields become traits so systems can query the data they need.

Create `traits.ts`:

```ts
export const IsBall = trait();
export const Position = trait({ x: 0, y: 0 });
export const Velocity = trait({ x: 0, y: 0 });
export const Radius = trait({ value: 40 });
export const Drag = trait({ pointerId: 0, offsetX: 0, offsetY: 0 });
export const Settings = trait({ count: 2, radius: 40 });
```

Each ball gets its own trait data. `IsBall` is a tag with no data. Adding `Drag` to a ball marks it as held, replacing the store's single drag object. `Settings` will live on the world.

## 2. Create entities through actions

Actions group the operations that change a world. Create `actions.ts` with `restart`. It replaces the ball array reset with destroying and spawning entities. Koota supplies their identities.

```ts
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
}));
```

Move the drag logic out of `Ball` and into actions too. Add `startDrag` after `restart`:

```ts
startDrag: (entity: Entity, point: { x: number; y: number }, pointerId: number) => {
  if (world.queryFirst(Drag)) return false;
  const position = entity.get(Position)!;
  entity.add(Drag({ pointerId, offsetX: point.x - position.x, offsetY: point.y - position.y }));
  entity.set(Velocity, { x: 0, y: 0 });
  return true;
},
```

`queryFirst(Drag)` preserves the one-pointer-at-a-time rule. `entity.get` reads a snapshot of these traits, and `entity.set` writes data and notifies subscribers.

Add `moveDrag` after `startDrag`. It keeps the offset and fling math, then writes both traits.

```ts
moveDrag: (entity: Entity, point: { x: number; y: number }) => {
  const drag = entity.get(Drag)!;
  const position = entity.get(Position)!;
  const x = point.x - drag.offsetX;
  const y = point.y - drag.offsetY;
  entity.set(Velocity, { x: (x - position.x) * 100, y: (y - position.y) * 100 });
  entity.set(Position, { x, y });
},
```

Add `endDrag` after `moveDrag`. Removing the trait releases the ball while keeping its velocity.

```ts
endDrag: () => {
  world.query(Drag).forEach((entity) => entity.remove(Drag));
},
```

## 3. Provide the world

Create `world.ts` to initialize the balls and clean up the world during hot reload.

```ts
export const world = createWorld(Settings);
actions(world).restart({});

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
```

In `page.tsx`, wrap the scene with `WorldProvider` so Koota's React hooks can access the world.

```tsx
export default function Demo() {
  return (
    <WorldProvider world={world}>
      <BallCollisionScene />
    </WorldProvider>
  );
}
```

## 4. Move physics into systems

A system is a function that queries and updates entities. Create `systems.ts` with the movement system. The math stays the same, but the query replaces the array loop and `structuredClone`.

```ts
export function moveBalls(world: World, delta: number) {
  world.query(Position, Velocity, Not(Drag)).updateEach(([position, velocity]) => {
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;

    velocity.x *= 0.99 ** (delta * 60);
    velocity.y *= 0.99 ** (delta * 60);
  });
}
```

`Not(Drag)` skips the held ball. `updateEach` writes changed values back and detects changes for subscribed traits.

Append `bounceOffWalls`. The wall checks stay the same, with `radius.value` supplying the radius.

```ts
export function bounceOffWalls(world: World, { width, height }: { width: number; height: number }) {
  world.query(Position, Velocity, Radius).updateEach(([position, velocity, radius]) => {
    const left = -width / 2 + radius.value;
    const right = width / 2 - radius.value;
    const bottom = -height / 2 + radius.value;
    const top = height / 2 - radius.value;

    if (position.x < left) {
      position.x = left;
      velocity.x = Math.abs(velocity.x);
    } else if (position.x > right) {
      position.x = right;
      velocity.x = -Math.abs(velocity.x);
    }

    if (position.y < bottom) {
      position.y = bottom;
      velocity.y = Math.abs(velocity.y);
    } else if (position.y > top) {
      position.y = top;
      velocity.y = -Math.abs(velocity.y);
    }
  });
}
```

For collisions, `getPages()` gives direct access to trait arrays. Add this loop to visit each pair once. `indices` holds data offsets, while `entities` identifies the held ball.

```ts
export function collideBalls(world: World) {
  const held = world.queryFirst(Drag);

  // Cache each page before comparing its balls.
  const pages = world.query(Position, Velocity, Radius).getPages();

  for (const pageA of pages) {
    const [{ x: positionAX, y: positionAY }, { x: velocityAX, y: velocityAY }, radiusAStore] = pageA.stores;
    const radiusAPage = radiusAStore.value;

    for (let i = 0; i < pageA.indices.length; i++) {
      const a = pageA.indices[i];
      const radiusA = radiusAPage[a];

      for (let q = pageA.index; q < pages.length; q++) {
        const pageB = pages[q];
        const [{ x: positionBX, y: positionBY }, { x: velocityBX, y: velocityBY }, radiusBStore] = pageB.stores;
        const radiusBPage = radiusBStore.value;

        for (let j = q === pageA.index ? i + 1 : 0; j < pageB.indices.length; j++) {
          const b = pageB.indices[j];
          // Resolve this pair here
        }
      }
    }
  }
}
```

Replace `// Resolve this pair here` with the separation and impulse calculation from lesson 4, adapted to the trait arrays:

```ts
const dx = positionBX[b] - positionAX[a];
const dy = positionBY[b] - positionAY[a];
const distance = Math.hypot(dx, dy);
const overlap = radiusA + radiusBPage[b] - distance;
if (overlap <= 0) continue;

const normalX = distance === 0 ? 1 : dx / distance;
const normalY = distance === 0 ? 0 : dy / distance;
const moveA = pageA.entities[i] === held ? 0 : 1;
const moveB = pageB.entities[j] === held ? 0 : 1;
const share = moveA + moveB;

// Free balls separate while the held ball stays under the pointer.
positionAX[a] -= normalX * overlap * moveA / share;
positionAY[a] -= normalY * overlap * moveA / share;
positionBX[b] += normalX * overlap * moveB / share;
positionBY[b] += normalY * overlap * moveB / share;

// Only exchange momentum when the balls are approaching.
const relativeSpeed = (velocityBX[b] - velocityAX[a]) * normalX +
  (velocityBY[b] - velocityAY[a]) * normalY;
if (relativeSpeed >= 0) continue;
const impulse = -2 * relativeSpeed / share;
velocityAX[a] -= impulse * normalX * moveA;
velocityAY[a] -= impulse * normalY * moveA;
velocityBX[b] += impulse * normalX * moveB;
velocityBY[b] += impulse * normalY * moveB;
```

## 5. Subscribe to each ball

In `ball.tsx`, update `BallRenderer` to query ball entities and run the systems each frame. `useQuery` subscribes to which balls exist, so movement no longer replaces the list it renders.

```tsx
export function BallRenderer() {
  const world = useWorld(); // <--
  const balls = useQuery(IsBall); // <--

  useFrame(({ size }, delta) => {
    collideBalls(world);
    moveBalls(world, delta);
    bounceOffWalls(world, size);
  });

  return balls.map((entity) => <Ball key={entity} entity={entity} />); // <--
}
```

Change `Ball` to receive an entity and subscribe to its own radius and position. Read the drag actions here too.

```tsx
function Ball({ entity }: { entity: Entity }) {
  const radius = useTrait(entity, Radius); // <--
  const position = useTrait(entity, Position); // <--
  const { startDrag, moveDrag, endDrag } = useActions(actions); // <--

  // ... Keep the pointer handlers and return
}
```

Before `return`, add a guard for missing traits:

```tsx
if (!radius || !position) return null;
```

Replace the mesh return with this. Only the scale changes to read `radius.value`. Each ball still rerenders when its position changes.

```tsx
return (
  <mesh
    position={[position.x, position.y, 0]}
    scale={radius.value} // <--
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
  >
    <circleGeometry args={[1, 64]} />
    <meshBasicMaterial color="red" toneMapped={false} />
  </mesh>
);
```

## 6. Connect input and controls

The pointer handlers now call actions instead of doing the drag math. Replace `onPointerDown` with:

```tsx
function onPointerDown(event: ThreeEvent<PointerEvent>) {
  event.stopPropagation();
  if (!startDrag(entity, event.unprojectedPoint, event.pointerId)) return; // <--
  (event.target as Element).setPointerCapture(event.pointerId);
}
```

Replace `onPointerMove`. Check the entity's drag pointer, then let the action update its position and velocity.

```tsx
function onPointerMove(event: ThreeEvent<PointerEvent>) {
  if (entity.get(Drag)?.pointerId !== event.pointerId) return; // <--
  event.stopPropagation();
  moveDrag(entity, event.unprojectedPoint); // <--
}
```

Replace `onPointerUp` to end the drag and release capture.

```tsx
function onPointerUp(event: ThreeEvent<PointerEvent>) {
  if (entity.get(Drag)?.pointerId !== event.pointerId) return; // <--
  event.stopPropagation();
  endDrag(); // <--
  (event.target as Element).releasePointerCapture(event.pointerId);
}
```

In `scene.tsx`, read the action at the start of `BallCollisionScene`:

```tsx
const { endDrag } = useActions(actions);
```

Replace the Canvas's `onLostPointerCapture` prop so losing capture still ends a drag:

```tsx
onLostPointerCapture={endDrag}
```

In `devtools.tsx`, replace the store read at the start of `Controls` with:

```tsx
const { count, radius } = useWorld().get(Settings)!;
const { restart } = useActions(actions);
```

Replace the `count` entry in `useInspectorControls` to read the world setting. Keep the radius entry and the control options.

```tsx
count: { value: count, label: "Balls", min: 1, max: 5_000, step: 1, onChange: (count) => restart({ count }) },
```

Delete the practice folder's unused `store.ts` and `physics.ts`.

## Try it

Run `pnpm dev` and open [your practice demo](http://localhost:5173/ball-collision). Drag one ball into another, fling it against a wall, then change Balls and Radius. Each slider change should reset positions, momentum and drag while keeping the other setting.

Compare with [the Zustand step](http://localhost:5173/ball-collision-steps?step=4) and [the completed Koota step](http://localhost:5173/ball-collision-steps?step=5). Both still use React props, one mesh per ball and all-pairs collisions but Koota should perform better since it is not creating new objects each frame for immutability.

[Run the completed step](http://localhost:5173/ball-collision-steps?step=5) · [Next, refs →](../06-refs/README.md)
