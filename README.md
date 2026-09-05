# R3F workshop demos

The standalone demos from the Advanced React Three Fiber workshop, each on its
own page with Leva controls and a teaching write-up. Made with React Three
Fiber v10 (`@react-three/fiber/webgpu`), drei 11 alpha, three r185.

Every demo needs WebGPU. There is no WebGL fallback, by design.

## Install

```sh
corepack enable          # pnpm is pinned via packageManager
pnpm install
pnpm dev                 # http://localhost:5173
pnpm build               # tsc, then vite build into dist/
pnpm preview
```

**pnpm, not npm.** `pnpm-workspace.yaml` carries the peer-dependency override
that lets rapier 2.x install against R3F 10 (see below); npm doesn't read it.

## Routes

Each demo is `/<slug>`; there is no index page:

| Route | What it is |
| --- | --- |
| `/ball-collision-simple` | A flat red circle bouncing between two bounds, with React state driving a Three.js mesh. |
| `/ball-collision` | Zustand owns the balls. Drag and fling them, collide with each other and the walls, and increase the count in code to stress more meshes. |
| `/paris-hero` | The workshop site's hero: tower, generated Paris, `@pmndrs/sky`, FSR3, one MRT post graph. |
| `/magic-box` | A portal cube, six faces, the numeral ten in six writing systems. |
| `/grain-gradient` | Drifting blobs under a static sheet of grain, in TSL. |
| `/flip-grid` | Tiles that flip under the cursor, state in a storage buffer, integrated by a compute pass. |
| `/connectors` | A Rapier pile held by a spring rather than a box, after Lusion's connectors. |
| `/blending-cube` | One mesh gaining edges, contact shadows, metalness, then an environment. |
| `/takehome-grid` | Six tiles turning over to name the other demos. |
| `/block-city` | A few hundred instanced blocks rising and settling. |

Routing is a few lines in `src/main.tsx`: every `src/demos/<slug>/page.tsx` is
a route at `/<slug>`, so a new demo is a new folder and nothing else. The dev
server and `vite preview` fall back to `index.html` for deep links; a static
host needs the same rewrite.

Add `?debug` to any demo for the Leva panel, or use the button top right.
`?no3d` forces the no-WebGPU state.

## Where things are

| Path | What it is |
| --- | --- |
| `src/demos/<slug>/` | One folder per demo. `page.tsx` is the route (default export: title plate and write-up), the Leva wrapper, `scene.tsx` (its own `<Canvas>`), and the scene itself. Models and textures sit in the folder too, imported with `?url`. |
| `src/demos/paris-hero/tower-scene/` | The full hero pipeline the Paris hero runs on. |
| `src/components/` | The demo chrome: info dialog, controls toggle, WebGPU gate, LevaPanel, DepthAttachmentSync. |
| `src/lib/` | WebGPU detection, `cn`, the generated studio environment. |
| `vendor/pmndrs-sky` | Vendored `@pmndrs/sky` build (`link:` dep). `pnpm sync:sky` re-copies it from a local sky checkout (`SKY_REPO`); the checked-in `dist/` means fresh clones need nothing. |
| `scripts/build-glyphs.mjs` | Regenerates `src/demos/magic-box/ten-glyphs.ts` from a folder of fonts: `pnpm build:glyphs <font-dir>`. |

## Things that look odd but are load-bearing

- `pnpm-workspace.yaml` allows rapier 2.x to peer against R3F 10. The range
  upstream is stale, not wrong: rapier only uses `useFrame` and `useThree`, and
  R3F v10 shares its store across entries through a global symbol, so hooks
  imported from the root entry still find the WebGPU `<Canvas>`.
- `components/depth-attachment-sync.tsx` works around a three.js multi-canvas
  depth bug and belongs inside every `<Canvas>`.

These demos came out of the workshop site repo
([R3F-Workshop/workshop-fallback](https://github.com/R3F-Workshop/workshop-fallback)),
where the section scenes still live in the folders that own them.
