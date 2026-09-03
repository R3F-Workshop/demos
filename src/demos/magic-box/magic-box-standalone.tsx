import { Canvas } from "@react-three/fiber/webgpu";

import { DepthAttachmentSync } from "@/components/depth-attachment-sync";
import { LevaPanel } from "@/components/leva-panel";
import { BOX_CAMERA, MagicBoxScene } from "@/demos/magic-box/magic-box";
import { WebGPUGate } from "@/components/webgpu-gate";

/** The magic box on its own page, as the *primary* canvas. */
export function MagicBoxStandalone() {
  return (
    <WebGPUGate>
      <LevaPanel />
      <Canvas
        id="main"
        renderer={{
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        // Odd/fractional drawing buffers desync the depth attachment from the swap chain: see DepthAttachmentSync.
        forceEven
        camera={BOX_CAMERA}
        style={{ touchAction: "none", cursor: "grab" }}
      >
        <MagicBoxScene />
        <DepthAttachmentSync />
      </Canvas>
    </WebGPUGate>
  );
}
