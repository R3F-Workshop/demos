import { Canvas } from "@react-three/fiber/webgpu";
import type { RefObject } from "react";
import { ACESFilmicToneMapping } from "three/webgpu";

import { DepthAttachmentSync } from "@/components/depth-attachment-sync";
import type { FlipGridConfig } from "@/demos/flip-grid/config";
import { FlipGridEnvironment } from "@/demos/flip-grid/environment";
import { FlipGrid } from "@/demos/flip-grid/flip-grid";

/** Uses an independent renderer outside the shared homepage canvas. */
export function FlipGridScene({
  config,
  bounds,
}: {
  config: FlipGridConfig;
  bounds: RefObject<HTMLElement | null>;
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 1 }}
      dpr={[1, 2]}
      // Odd/fractional drawing buffers desync the depth attachment from the swap chain: see DepthAttachmentSync.
      forceEven
      renderer={{
        alpha: true,
        antialias: true,
        // r3f already defaults to this: stated explicitly because the scene depends on it.
        toneMapping: ACESFilmicToneMapping,
      }}
      style={{ pointerEvents: "none" }}
    >
      <DepthAttachmentSync />
      <FlipGridEnvironment config={config} />
      {/* Remounting on a resolution change is deliberate: the storage buffer is sized to cols × rows. */}
      <FlipGrid
        key={`${config.cols}x${config.rows}`}
        config={config}
        bounds={bounds}
      />
    </Canvas>
  );
}
