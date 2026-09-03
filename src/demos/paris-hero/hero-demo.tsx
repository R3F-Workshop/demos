import { useCallback, useState } from "react";

import { ControlsToggle } from "@/components/controls-toggle";
import type { PerfSample } from "@/demos/paris-hero/tower-scene/perf-probe";
import { HeroDemoScene } from "./scene";

const EMPTY: PerfSample = {
  fps: 0,
  ms: 0,
  drawCalls: 0,
  triangles: 0,
  hasControls: false,
  cameraPos: [0, 0, 0],
  target: [0, 0, 0],
  distance: 0,
  near: 0,
  far: 0,
};

const vec = (v: [number, number, number]) => v.join(", ");

/** The tower scene with the full Leva surface, dressed as a demo page. */
export function HeroDemo() {
  const [perf, setPerf] = useState<PerfSample>(EMPTY);
  const onSample = useCallback((s: PerfSample) => setPerf(s), []);

  return (
    <>
      <div className="absolute inset-0">
        <HeroDemoScene onSample={onSample} />
      </div>

      <ControlsToggle />

      <div className="pointer-events-none absolute top-[7.5rem] left-5 z-20 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-white/60 sm:top-[8.5rem]">
        <div className="tabular-nums">
          {perf.fps} fps · {perf.ms.toFixed(2)} ms
        </div>
        {/* `renderer.info` reports the last pass, so under the post pipeline this is the present quad, not the scene. */}
        <div className="tabular-nums text-white/40">
          {perf.drawCalls.toLocaleString()} draws ·{" "}
          {perf.triangles.toLocaleString()} tris <span>(final pass)</span>
        </div>
        <div className="mt-1.5 text-white/40">
          controls:{" "}
          <span className={perf.hasControls ? "text-white/60" : "text-red-400"}>
            {perf.hasControls ? "yes" : "NONE"}
          </span>
        </div>
        <div className="tabular-nums text-white/40">
          cam [{vec(perf.cameraPos)}]
        </div>
        <div className="tabular-nums text-white/40">
          tgt [{vec(perf.target)}] · dist {perf.distance}
        </div>
        <div className="tabular-nums text-white/40">
          near {perf.near} · far {perf.far}
        </div>
      </div>
    </>
  );
}
