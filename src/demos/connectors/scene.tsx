import { Canvas } from "@react-three/fiber/webgpu";
import type { RefObject } from "react";
import { ACESFilmicToneMapping } from "three/webgpu";

import type { ConnectorsConfig } from "@/demos/connectors/config";
import { ConnectorsScene } from "@/demos/connectors/connectors";
import { DepthAttachmentSync } from "@/components/depth-attachment-sync";

/** Uses an independent renderer outside the shared homepage canvas. */
export function ConnectorsDemoScene({
  config,
  bounds,
}: {
  config: ConnectorsConfig;
  bounds: RefObject<HTMLElement | null>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 17.5, near: 1, far: 40 }}
      dpr={[1, 2]}
      // Odd/fractional drawing buffers desync the depth attachment from the swap chain: see DepthAttachmentSync.
      forceEven
      renderer={{
        alpha: false,
        antialias: true,
        // The environment is HDR on purpose: softboxes sit well above 1 so the glass and the metal have something with range to bend.
        toneMapping: ACESFilmicToneMapping,
      }}
      // The cursor is read off `window`, not from R3F's pointer events, so the canvas has no reason to take them.
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#08080a"]} />
      <DepthAttachmentSync />
      <ConnectorsScene config={config} bounds={bounds} />
    </Canvas>
  );
}
