import { useFrame, useThree } from "@react-three/fiber/webgpu";
import { useMemo } from "react";
import * as THREE from "three/webgpu";
import {
  cos,
  float,
  fwidth,
  length,
  mix,
  mx_fractal_noise_float,
  mx_noise_float,
  screenCoordinate,
  sin,
  smoothstep,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";


/** The grain gradient behind the closing CTA, and the demo at /demos/grain-gradient. */

/** Gradient stops. */
const STOPS = 3;

export type GrainParams = {
  /** Band edge width. 0 = hard steps, 1 = smooth gradient. */
  softness: number;
  /** How far the grain displaces the field. */
  intensity: number;
  /** Positive-only grain. */
  noise: number;
  /** Device pixels per grain unit. */
  grainSize: number;
  /** Peak alpha. */
  opacity: number;
  /** How fast the warp kneads the shape. */
  speed: number;
  /** Below 1 enlarges the blobs, above 1 shrinks them. */
  scale: number;
  /** Radians. */
  rotation: number;
  offsetX: number;
  offsetY: number;
  /** Ramp stops, darkest to lightest. */
  color1: string;
  color2: string;
  color3: string;
};

export const GRAIN_DEFAULTS: GrainParams = {
  softness: 0.5,
  intensity: 0.5,
  noise: 0.28,
  grainSize: 2,
  opacity: 0.62,
  speed: 1,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  color1: "#22222a",
  color2: "#6e6e7a",
  color3: "#c8c8d4",
};

export function GrainField({ params }: { params: GrainParams }) {
  const { viewport } = useThree();

  const u = useMemo(
    () => ({
      time: uniform(0),
      aspect: uniform(1),
      softness: uniform(0),
      intensity: uniform(0),
      noise: uniform(0),
      grainSize: uniform(1),
      opacity: uniform(1),
      speed: uniform(1),
      scale: uniform(1),
      rotation: uniform(0),
      offset: uniform(new THREE.Vector2()),
      color1: uniform(new THREE.Color()),
      color2: uniform(new THREE.Color()),
      color3: uniform(new THREE.Color()),
    }),
    [],
  );

  u.aspect.value = viewport.width / viewport.height;
  u.softness.value = params.softness;
  u.intensity.value = params.intensity;
  u.noise.value = params.noise;
  u.grainSize.value = params.grainSize;
  u.opacity.value = params.opacity;
  u.speed.value = params.speed;
  u.scale.value = params.scale;
  u.rotation.value = params.rotation;
  u.offset.value.set(params.offsetX, params.offsetY);
  u.color1.value.set(params.color1);
  u.color2.value.set(params.color2);
  u.color3.value.set(params.color3);

  useFrame((state) => {
    u.time.value = state.elapsed;
  });

  const { colorNode, opacityNode } = useMemo(() => {
    // Blob centres live in *frame* space: a fraction of the width and height, independent of aspect.
    const centred = uv().sub(0.5);

    // Scale, rotate and offset the sample point rather than the blobs: one transform instead of three, and it composes.
    const s = centred.mul(u.scale);
    const c = cos(u.rotation);
    const sn = sin(u.rotation);
    const q = vec2(
      s.x.mul(c).sub(s.y.mul(sn)),
      s.x.mul(sn).add(s.y.mul(c)),
    ).sub(u.offset);

    /** x scaled to match y's physical size, so distances are circular. */
    const round = vec2(u.aspect, 1);
    const t = u.time.mul(u.speed).mul(0.06);

    // Low-frequency warp bends the whole field: the blobs ride on it rather than each being animated separately.
    const warp = mx_fractal_noise_float(
      vec3(q.mul(round).mul(0.9), t),
      3,
      2,
      0.5,
      1,
    );

    // Warp is added *after* correction: adding it before would stretch the wobble horizontally along with everything else.
    const blob = (cx: number, cy: number, r: number, w: number) =>
      smoothstep(
        r,
        0,
        length(
          q
            .sub(vec2(cx, cy))
            .mul(round)
            .add(vec2(warp.mul(w), warp.mul(w * 0.8))),
        ),
      );

    // Pushed out to the edges rather than centred.
    const shape = blob(-0.26, -0.1, 0.6, 0.34)
      .add(blob(0.24, 0.16, 0.56, 0.3))
      .add(blob(0.04, -0.52, 0.42, 0.26).mul(0.8))
      .clamp(0, 1);

    // Keyed to screen coordinates and, critically, with no time term: this field never changes.
    const g = screenCoordinate.xy.div(u.grainSize);
    const fine = mx_noise_float(vec3(g.mul(0.5), 0));
    const mid = mx_noise_float(vec3(g.mul(0.2), 0));

    // Very low frequencies, so grain density clumps and thins across the frame instead of sitting at one uniform level.
    const positive = (n: ReturnType<typeof mx_noise_float>, amp: number) =>
      n.mul(0.5).add(0.5).mul(amp);
    const cloudA = positive(
      mx_fractal_noise_float(vec3(g.mul(0.002), 0), 3, 2, 0.6, 1),
      0.39,
    );
    const cloudB = positive(
      mx_fractal_noise_float(vec3(g.mul(0.003), 0), 3, 2, 0.6, 1),
      0.39,
    );
    const cloudC = positive(
      mx_fractal_noise_float(vec3(g.mul(0.001), 0), 3, 2, 0.6, 1),
      0.78,
    );

    /** Signed: roughens band edges in both directions. */
    const distort = fine.mul(mid).sub(cloudA).sub(cloudB);
    /** Clamped positive, and mostly zero: the subtraction leaves only the peaks standing. */
    const lift = fine.mul(0.75).sub(cloudC).clamp(0, 1);

    // Add grain before the ramp so it inherits the local colour and brightness.
    const field = shape
      .add(distort.add(0.5).mul(u.intensity).mul(2).div(STOPS))
      .add(lift.mul(u.noise).mul(10).div(STOPS));

    // fwidth keeps the band edges from aliasing into stair-steps once softness is low enough for them to read as hard.
    const aa = fwidth(field);
    const v = field.sub(float(0.5).div(STOPS)).clamp(0, 1);

    /** Fades the whole thing out at the bottom of the ramp. */
    const coverage = smoothstep(
      0,
      u.softness.add(aa.mul(2)),
      v.mul(STOPS).clamp(0, 1),
    );

    const mixer = v.mul(STOPS - 1);
    const edge = (i: number) =>
      smoothstep(
        float(0.5).sub(u.softness.mul(0.5)).sub(aa),
        float(0.5).add(u.softness.mul(0.5)).add(aa),
        mixer.sub(i).clamp(0, 1),
      );

    const ramp = mix(mix(u.color1, u.color2, edge(0)), u.color3, edge(1));

    return {
      colorNode: ramp,
      // Not premultiplied: three does the blend, so the colour stays full strength and coverage drives alpha alone.
      opacityNode: coverage.mul(u.opacity),
    };
  }, [u]);

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicNodeMaterial
        colorNode={colorNode}
        opacityNode={opacityNode}
        transparent
      />
    </mesh>
  );
}
