import { Canvas } from "@react-three/fiber/webgpu";
import { ACESFilmicToneMapping } from "three/webgpu";

import {
  BlendingCubeScene,
  CUBE_CAMERA,
} from "@/demos/blending-cube/blending-cube";
import type { BlendingCubeConfig } from "@/demos/blending-cube/config";
import { DepthAttachmentSync } from "@/components/depth-attachment-sync";

/** Uses an independent renderer outside the shared homepage canvas. */
export function BlendingCubeCanvasScene({
  config,
  onStage,
}: {
  config: BlendingCubeConfig;
  onStage?: (index: number) => void;
}) {
  return (
    <Canvas
      camera={CUBE_CAMERA}
      dpr={[1, 2]}
      // Odd/fractional drawing buffers desync the depth attachment from the swap chain: see DepthAttachmentSync.
      forceEven
      renderer={{
        alpha: false,
        antialias: true,
        // Stated explicitly because the scene depends on it: the environment is HDR.
        toneMapping: ACESFilmicToneMapping,
      }}
      style={{ pointerEvents: "none" }}
    >
      <DepthAttachmentSync />
      <color attach="background" args={["#08080a"]} />
      <BlendingCubeScene config={config} onStage={onStage} />
    </Canvas>
  );
}
