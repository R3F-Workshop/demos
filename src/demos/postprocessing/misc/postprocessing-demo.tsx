import { ControlsToggle } from "@/components/controls-toggle";
import { useWebGPU } from "@/lib/use-webgpu";

import { PostprocessingScene } from "../scene";
import { POSTPROCESSING_DEFAULTS } from "./config";

const d = POSTPROCESSING_DEFAULTS;

export function PostprocessingDemo() {
  const support = useWebGPU();

  // Namespaced, because Leva's store is global and every demo shares it.
  // const config = useControls("postprocessing", {
  //   bloom: folder({
  //     bloomEnabled: { value: d.bloomEnabled, label: "enabled" },
  //     bloomStrength: {
  //       value: d.bloomStrength,
  //       min: 0,
  //       max: 5,
  //       step: 0.01,
  //       label: "strength",
  //     },
  //     bloomRadius: {
  //       value: d.bloomRadius,
  //       min: 0,
  //       max: 1,
  //       step: 0.01,
  //       label: "radius",
  //     },
  //   }),
  //   ao: folder({
  //     aoEnabled: { value: d.aoEnabled, label: "enabled" },
  //     aoRadius: {
  //       value: d.aoRadius,
  //       min: 0,
  //       max: 4,
  //       step: 0.01,
  //       label: "radius",
  //     },
  //     aoThickness: {
  //       value: d.aoThickness,
  //       min: 0,
  //       max: 2,
  //       step: 0.01,
  //       label: "thickness",
  //     },
  //     aoDistanceExponent: {
  //       value: d.aoDistanceExponent,
  //       min: 0.1,
  //       max: 2,
  //       step: 0.05,
  //       label: "distanceExponent",
  //     },
  //     aoIntensity: {
  //       value: d.aoIntensity,
  //       min: 0,
  //       max: 8,
  //       step: 0.05,
  //       label: "intensity",
  //     },
  //   }),
  // });

  const config = POSTPROCESSING_DEFAULTS;

  return (
    <>
      <ControlsToggle />
      <div className="absolute inset-0">
        {support === "yes" ? <PostprocessingScene config={config} /> : null}
      </div>
    </>
  );
}
