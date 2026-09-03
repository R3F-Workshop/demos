import { lazy } from "react";

/** Every demo, in the order the index lists them. The slug is the route. */
export const DEMOS = [
  {
    slug: "paris-hero",
    title: "Paris hero",
    blurb:
      "The workshop site's hero on its own: the tower over a generated Paris under a physical @pmndrs/sky atmosphere, FSR3 reconstruction, bloom, and a height fog that samples the sky for its color. Every knob live.",
    tags: ["FSR3", "@pmndrs/sky", "MRT post pipeline"],
    page: lazy(() => import("./demos/paris-hero/page")),
  },
  {
    slug: "magic-box",
    title: "Ten, written six ways",
    blurb:
      "A portal cube: six faces, six separate scenes, the numeral ten in six writing systems. Extruded from glyph outlines generated offline.",
    tags: ["MeshPortalMaterial", "ExtrudeGeometry", "multi-canvas"],
    page: lazy(() => import("./demos/magic-box/page")),
  },
  {
    slug: "grain-gradient",
    title: "Grain gradient",
    blurb:
      "Drifting blobs under a static sheet of grain. The grain feeds the colour ramp rather than sitting over it, so it brightens as it nears a blob. Every dial is live.",
    tags: ["TSL", "static grain", "tunable"],
    page: lazy(() => import("./demos/grain-gradient/page")),
  },
  {
    slug: "flip-grid",
    title: "A grid that flips to gold",
    blurb:
      "Tiles that flip as the cursor sweeps them and hold the pose before falling back. Angle, velocity and hold timer live in a storage buffer a compute pass integrates. The CPU writes five floats a frame however many tiles there are.",
    tags: ["compute shader", "storage buffer", "TSL struct"],
    page: lazy(() => import("./demos/flip-grid/page")),
  },
  {
    slug: "connectors",
    title: "A container with no walls",
    blurb:
      "A pile of bodies held together by a spring to the origin rather than by a box, shoved around by a kinematic cursor. After Lusion's connectors, with the pmndrs mark in place of their shape, and the glass done natively.",
    tags: ["Rapier", "transmission", "kinematic cursor"],
    page: lazy(() => import("./demos/connectors/page")),
  },
  {
    slug: "blending-cube",
    title: "One box, four imports",
    blurb:
      "A single mesh gaining one capability at a time: edges, contact shadows, metalness, and finally an environment to reflect. The fourth stage turns it black on purpose: metal has no colour of its own.",
    tags: ["drei", "generated IBL", "no re-renders"],
    page: lazy(() => import("./demos/blending-cube/page")),
  },
  {
    slug: "takehome-grid",
    title: "A directory, turning over",
    blurb:
      "Six tiles that turn one at a time to name the other demos here. The same effect as the flip grid, built the opposite way: no instancing, no storage buffer, no compute pass, because six tiles on a fixed timeline have no history to keep.",
    tags: ["CanvasTexture", "no GPU state", "the simple version"],
    page: lazy(() => import("./demos/takehome-grid/page")),
  },
  {
    slug: "block-city",
    title: "A city that builds itself",
    blurb:
      "A few hundred instanced blocks rising out of the ground in a wave and settling. The layout is a hash of the instance index rather than an array, and the frame loop latches off once the last block lands.",
    tags: ["InstancedMesh", "deterministic layout", "emissive maps"],
    page: lazy(() => import("./demos/block-city/page")),
  },
];
