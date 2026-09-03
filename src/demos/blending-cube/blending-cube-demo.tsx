import { folder, useControls } from "leva";
import { useState } from "react";

import { ControlsToggle } from "@/components/controls-toggle";
import { STAGE_CAPTIONS } from "@/demos/blending-cube/blending-cube";
import {
  BLENDING_CUBE_DEFAULTS,
  type BlendingCubeConfig,
} from "@/demos/blending-cube/config";
import { useWebGPU } from "@/lib/use-webgpu";
import { BlendingCubeCanvasScene } from "./scene";

const d = BLENDING_CUBE_DEFAULTS;

/** The interactive half of the demo page: the canvas, its controls, and the caption that names whatever the cube just gained. */
export function BlendingCubeDemo() {
  const support = useWebGPU();
  const [stage, setStage] = useState(0);

  // Namespaced, because Leva's store is global and every demo shares it.
  const config: BlendingCubeConfig = useControls("blending cube", {
    timing: folder({
      stageSeconds: { value: d.stageSeconds, min: 0.6, max: 6, step: 0.1 },
      blendSeconds: { value: d.blendSeconds, min: 0.1, max: 3, step: 0.05 },
      spin: { value: d.spin, min: 0, max: 0.4, step: 0.005 },
      bounce: { value: d.bounce, min: 0, max: 0.5, step: 0.01 },
    }),
    colour: folder({
      plain: { value: d.plain },
      metal: { value: d.metal },
      edge: { value: d.edge },
      lineWidth: { value: d.lineWidth, min: 0.5, max: 6, step: 0.1 },
      floor: { value: d.floor },
      plinth: { value: d.plinth, min: 0.8, max: 6, step: 0.1 },
      plainRoughness: { value: d.plainRoughness, min: 0, max: 1, step: 0.01 },
      metalRoughness: { value: d.metalRoughness, min: 0, max: 1, step: 0.01 },
    }),
    light: folder({
      ambient: { value: d.ambient, min: 0, max: 2, step: 0.01 },
      keyIntensity: { value: d.keyIntensity, min: 0, max: 10, step: 0.1 },
      envIntensity: { value: d.envIntensity, min: 0, max: 4, step: 0.05 },
      shadowOpacity: { value: d.shadowOpacity, min: 0, max: 1, step: 0.01 },
      shadowBlur: { value: d.shadowBlur, min: 0, max: 8, step: 0.1 },
    }),
  });

  return (
    <>
      <ControlsToggle />

      <div className="absolute inset-0">
        {support === "yes" ? (
          <BlendingCubeCanvasScene config={config} onStage={setStage} />
        ) : null}
      </div>

      {/* Sits under the title plate, in the same mono the eyebrow uses, so it reads as a running commentary rather than a caption on an image. */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
        <div className="rounded-full border border-border bg-background/80 px-4 py-2 font-mono text-[12px] tracking-[0.08em] text-muted-foreground backdrop-blur-sm">
          {STAGE_CAPTIONS[stage] ?? STAGE_CAPTIONS[0]}
        </div>
      </div>
    </>
  );
}
