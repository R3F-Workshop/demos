# Ball collision with Koota

The same red balls, drag and fling, walls, collisions, and Devtools as [the Zustand demo](../ball-collision-zustand/). Open `/ball-collision-koota` to try it.

| Term | In this demo |
| --- | --- |
| World | [world.ts](world.ts) holds all entities and the shared settings |
| Entity | One ball, created with `world.spawn` |
| Trait | [traits.ts](traits.ts) defines Position, Velocity, Radius and Drag. IsBall is a tag with no data |
| Query | Selects entities with matching traits. `Not(Drag)` excludes held balls |
| System | [systems.ts](systems.ts) contains plain functions for movement, walls and collisions |
| Action | [actions.ts](actions.ts) restarts the simulation and handles dragging |

[page.tsx](page.tsx) provides the world. [ball.tsx](ball.tsx) uses `useQuery` to create and remove balls. Each Ball reads Position and Radius with `useTrait` and passes them to the mesh through React props.

The frame callback runs collisions, movement, then walls. It publishes the final positions once per ball so React renders all physics changes together.

Movement and walls use `updateEach` with change detection disabled. Collisions use `useStores` and its layout to locate each ball's page and offset without copying each pair. The final `entity.changed(Position)` calls notify `useTrait`, including when collisions move a stationary ball.

[devtools.tsx](devtools.tsx) calls `restart` when either slider changes. Restart destroys the old balls and spawns new ones, clearing their drag and momentum.

The collision system still checks every pair and each ball still has its own mesh. Increasing count stresses both physics and rendering.

[Koota documentation](https://github.com/pmndrs/koota)
