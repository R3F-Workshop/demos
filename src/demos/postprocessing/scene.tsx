import {
  Bounds,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber/webgpu";
import { Suspense } from "react";
import { ACESFilmicToneMapping } from "three/webgpu";

import { ContactShadows } from "@react-three/drei/webgpu";
import type { PostprocessingConfig } from "./misc/config";
import { Robot } from "./misc/Robot";

/** Uses an independent renderer outside the shared homepage canvas. */
export function PostprocessingScene({
  config,
}: {
  config: PostprocessingConfig;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      // Odd/fractional drawing buffers desync the depth attachment from the swap chain: see DepthAttachmentSync.
      forceEven
      renderer={{
        alpha: false,
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
      }}
    >
      {/* <PostprocessingExisting config={config} /> */}

      <color attach="background" args={["#252525"]} />

      <Environment preset="sunset" blur={0.8} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      {/* Suspense inside the Canvas: a promise thrown past it would unmount the root. */}
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.5}>
          <Robot />
        </Bounds>

        <ContactShadows
          opacity={1}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          position={[0, -0.01, 0]}
          rotation-z={Math.PI / 2}
        />
      </Suspense>

      <PerspectiveCamera
        makeDefault
        position={[-10, 5, -10]}
        fov={45}
        near={0.1}
        far={100}
      />
      <OrbitControls makeDefault />
    </Canvas>
  );
}
