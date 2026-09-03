import { useControls } from "leva";

import { PARIS_LATITUDE, CONFERENCE_DAY_OF_YEAR, TowerCanvas } from "@/demos/paris-hero/tower-scene/tower-canvas";
import {
  PARIS_ATMOSPHERE_DEFAULTS,
  PARIS_CITY_DEFAULTS,
} from "@/demos/paris-hero/tower-scene/paris-defaults";
import type { PerfSample } from "@/demos/paris-hero/tower-scene/perf-probe";
import type { TowerMode } from "@/demos/paris-hero/tower-scene/tower";

/** Leva controls for tuning and debugging the tower scene. */
export function HeroDemoScene({
  onSample,
}: {
  onSample: (s: PerfSample) => void;
}) {
  const {
    highRiseCount,
    lowRiseCount,
    treeCount,
    treeShadows,
    river,
    park,
    haussmann,
  } = useControls("city", {
    highRiseCount: {
      value: PARIS_CITY_DEFAULTS.highRiseCount,
      min: 0,
      max: 1000,
      step: 10,
    },
    lowRiseCount: {
      value: PARIS_CITY_DEFAULTS.lowRiseCount,
      min: 0,
      max: 20000,
      step: 500,
    },
    treeCount: {
      value: PARIS_CITY_DEFAULTS.treeCount,
      min: 0,
      max: 40000,
      step: 1000,
    },
    treeShadows: PARIS_CITY_DEFAULTS.treeShadows,
    // Geography experiments (geography.ts owns the shapes): the Seine-ish spline, the Champ-de-Mars strip, and the stylized near ring.
    river: PARIS_CITY_DEFAULTS.river,
    park: PARIS_CITY_DEFAULTS.park,
    haussmann: PARIS_CITY_DEFAULTS.haussmann,
  });

  const { towerMode, beacon, lettering, letterSize, letterSpread, letterGlow } =
    useControls("tower", {
      towerMode: {
        value: "glow" as TowerMode,
        options: ["glow", "metal", "sparkle"] as TowerMode[],
      },
      beacon: false,
      lettering: true,
      letterSize: { value: 6, min: 2.5, max: 12.5, step: 0.25 },
      letterSpread: { value: 0.8, min: 0.3, max: 1.6, step: 0.05 },
      letterGlow: { value: 1, min: 0, max: 3, step: 0.05 },
    });

  /** The full `SkyProps` surface. */
  const {
    skyEnabled,
    timeOfDay,
    latitude,
    dayOfYear,
    exposure,
    north,
    sunDisc,
    turbidity,
    mirrorBelowHorizon,
  } = useControls("sky", {
    skyEnabled: PARIS_ATMOSPHERE_DEFAULTS.skyEnabled,
    // Hours, 0..24.
    timeOfDay: { value: 20.5, min: 0, max: 24, step: 0.05 },
    latitude: { value: PARIS_LATITUDE, min: -90, max: 90, step: 0.01 },
    dayOfYear: { value: CONFERENCE_DAY_OF_YEAR, min: 1, max: 365, step: 1 },
    exposure: { value: 40, min: 1, max: 200, step: 1 },
    north: { value: "+Z", options: ["+Z", "-Z", "+X", "-X"] },
    sunDisc: true,
    turbidity: {
      value: PARIS_ATMOSPHERE_DEFAULTS.turbidity,
      min: 0,
      max: 10,
      step: 0.05,
    },
    // Mirrors the sky's lower hemisphere for a ground-free IBL bake.
    mirrorBelowHorizon: PARIS_ATMOSPHERE_DEFAULTS.mirrorBelowHorizon,
  });

  /** Star count rebuilds buffers. */
  const { stars, starCount, starIntensity, starSize, starTwinkle } =
    useControls("sky/stars", {
      stars: true,
      starCount: { value: 4200, min: 0, max: 8000, step: 100 },
      starIntensity: { value: 2.8, min: 0, max: 8, step: 0.05 },
      // Star diameter in render target pixels.
      starSize: { value: 5.25, min: 1, max: 16, step: 0.25 },
      starTwinkle: { value: 0.28, min: 0, max: 1, step: 0.01 },
    });

  const { preset, quality, cubeSize } = useControls("sky/rebuild", {
    preset: {
      value: PARIS_ATMOSPHERE_DEFAULTS.preset,
      options: ["earth", "mars", "titan"],
    },
    quality: {
      value: PARIS_ATMOSPHERE_DEFAULTS.quality,
      options: ["low", "medium", "high"],
    },
    cubeSize: {
      value: PARIS_ATMOSPHERE_DEFAULTS.cubeSize,
      options: [64, 128, 256, 512],
    },
  });

  const { haze, hazeStrength, hazePolicy, apKmPerSlice } = useControls(
    "sky/haze",
    {
      // Off by default (2026-08-10): the per-frame AP LUT update alone costs roughly half the frame budget (85 → 165 fps measured with it off).
      haze: PARIS_ATMOSPHERE_DEFAULTS.haze,
      hazeStrength: {
        value: PARIS_ATMOSPHERE_DEFAULTS.hazeStrength,
        min: 0,
        max: 3,
        step: 0.05,
      },
      hazePolicy: {
        value: PARIS_ATMOSPHERE_DEFAULTS.hazePolicy,
        options: ["auto", "ap", "raymarch"],
      },
      // Construction-time: 8 km × 32 slices = 256 km of AP coverage.
      apKmPerSlice: {
        value: PARIS_ATMOSPHERE_DEFAULTS.apKmPerSlice,
        min: 1,
        max: 32,
        step: 1,
      },
    },
  );

  /** Sky-colored height fog: the cheap aerial-perspective stand-in. */
  const { skyFog, fogDensity, fogHeight, fogHorizonClamp } = useControls(
    "sky/fog",
    {
      skyFog: PARIS_ATMOSPHERE_DEFAULTS.skyFog,
      // Extinction per km.
      fogDensity: {
        value: PARIS_ATMOSPHERE_DEFAULTS.fogDensity,
        min: 0,
        max: 2,
        step: 0.01,
      },
      // Altitude falloff of the fog layer, in world units (~metres).
      fogHeight: {
        value: PARIS_ATMOSPHERE_DEFAULTS.fogHeight,
        min: 50,
        max: 2000,
        step: 10,
      },
      // The baked sky cube is black below the horizon, so downward rays clamp their color lookup to the horizon band.
      fogHorizonClamp: PARIS_ATMOSPHERE_DEFAULTS.fogHorizonClamp,
    },
  );

  /** Metres per scene unit. */
  const { worldScale } = useControls("world", {
    worldScale: { value: 5, min: 1, max: 20, step: 0.5 },
  });

  const { padding, autoRotate, autoRotateSpeed, unlocked, polarDegrees } =
    useControls("framing", {
      // Hands the camera over: free orbit, wheel dolly, no polar lock, no auto-fit.
      unlocked: false,
      padding: { value: 0.1, min: 0, max: 1.5, step: 0.01 },
      polarDegrees: { value: 93, min: 30, max: 150, step: 0.5 },
      autoRotate: true,
      autoRotateSpeed: { value: 2, min: 0, max: 30, step: 0.5 },
    });

  const { postFx, ao, bloom } = useControls("post", {
    postFx: true,
    ao: true,
    bloom: true,
  });

  /** Stage 2 (FSR3) defaults on: the sole temporal resolver, scene pass at 1/renderScale render res. */
  const {
    fsr,
    renderScale,
    ssgi,
    ssgiIntensity,
    ssgiAoIntensity,
    ssgiSlices,
    ssgiSteps,
    ssgiRadius,
  } = useControls("post/fsr", {
    fsr: true,
    renderScale: { value: 1.5, min: 1, max: 2, step: 0.1 },
    ssgi: false,
    ssgiIntensity: { value: 10, min: 0, max: 30, step: 1 },
    ssgiAoIntensity: { value: 2, min: 0, max: 5, step: 0.1 },
    ssgiSlices: { value: 2, min: 1, max: 4, step: 1 },
    ssgiSteps: { value: 8, min: 2, max: 16, step: 1 },
    ssgiRadius: { value: 12, min: 1, max: 32, step: 1 },
  });

  const { buildings, tower, environment, shadows } = useControls("debug", {
    buildings: true,
    tower: true,
    environment: false,
    shadows: true,
  });

  return (
    <TowerCanvas
      highRiseCount={highRiseCount}
      lowRiseCount={lowRiseCount}
      treeCount={treeCount}
      treeShadows={treeShadows}
      river={river}
      park={park}
      haussmann={haussmann}
      towerMode={towerMode}
      beacon={beacon}
      lettering={lettering}
      letterSize={letterSize}
      letterSpread={letterSpread}
      letterGlow={letterGlow}
      skyEnabled={skyEnabled}
      timeOfDay={timeOfDay}
      latitude={latitude}
      dayOfYear={dayOfYear}
      exposure={exposure}
      north={north}
      sunDisc={sunDisc}
      turbidity={turbidity}
      mirrorBelowHorizon={mirrorBelowHorizon}
      stars={stars}
      starCount={starCount}
      starIntensity={starIntensity}
      starSize={starSize}
      starTwinkle={starTwinkle}
      preset={preset}
      quality={quality}
      cubeSize={cubeSize}
      haze={haze}
      hazeStrength={hazeStrength}
      hazePolicy={hazePolicy}
      apKmPerSlice={apKmPerSlice}
      skyFog={skyFog}
      fogDensity={fogDensity}
      fogHeight={fogHeight}
      fogHorizonClamp={fogHorizonClamp}
      worldScale={worldScale}
      unlocked={unlocked}
      padding={padding}
      polarDegrees={polarDegrees}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      postFx={postFx}
      ao={ao}
      bloom={bloom}
      fsr={fsr}
      renderScale={renderScale}
      ssgi={ssgi}
      ssgiIntensity={ssgiIntensity}
      ssgiAoIntensity={ssgiAoIntensity}
      ssgiSlices={ssgiSlices}
      ssgiSteps={ssgiSteps}
      ssgiRadius={ssgiRadius}
      buildings={buildings}
      tower={tower}
      environment={environment}
      shadows={shadows}
      // Uncapped: the perf readout above measures pipeline throughput.
      maxFps={0}
      onSample={onSample}
      tools
    />
  );
}
