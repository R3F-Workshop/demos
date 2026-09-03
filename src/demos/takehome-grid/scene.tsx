import { Canvas } from "@react-three/fiber/webgpu";

import { DepthAttachmentSync } from "@/components/depth-attachment-sync";
import type { TakehomeGridConfig } from "@/demos/takehome-grid/config";
import {
  TAKEHOME_CAMERA,
  TakehomeGrid,
} from "@/demos/takehome-grid/takehome-grid";

/** Uses an independent renderer outside the shared homepage canvas. */
export function TakehomeGridScene({ config }: { config: TakehomeGridConfig }) {
  return (
    <Canvas
      camera={TAKEHOME_CAMERA}
      dpr={[1, 2]}
      // Odd/fractional drawing buffers desync the depth attachment from the swap chain: see DepthAttachmentSync.
      forceEven
      renderer={{ alpha: false, antialias: true }}
      style={{ pointerEvents: "none" }}
    >
      <DepthAttachmentSync />
      <color attach="background" args={["#08080a"]} />
      {/* Remounting on a grid-size change is deliberate: the label textures are built per tile. */}
      <TakehomeGrid key={`${config.cols}x${config.rows}`} config={config} />
    </Canvas>
  );
}
