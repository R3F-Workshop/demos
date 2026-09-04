import { useRenderPipeline, useUniforms } from "@react-three/fiber/webgpu";
import { useEffect } from "react";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { ao } from "three/examples/jsm/tsl/display/GTAONode.js";
import * as TSL from "three/tsl";
import * as THREE from "three/webgpu";

import type { PostprocessingConfig } from "./config";

type FloatUniform = THREE.UniformNode<"float", number>;
type Knobs = Record<
  | "bloomStrength"
  | "bloomRadius"
  | "aoRadius"
  | "aoThickness"
  | "aoDistanceExponent"
  | "aoIntensity",
  FloatUniform
>;

export function Postprocessing({ config }: { config: PostprocessingConfig }) {
  const u = useUniforms(
    {
      bloomStrength: config.bloomStrength,
      bloomRadius: config.bloomRadius,
      aoRadius: config.aoRadius,
      aoThickness: config.aoThickness,
      aoDistanceExponent: config.aoDistanceExponent,
      aoIntensity: config.aoIntensity,
    },
    "postprocessing",
  ) as unknown as Knobs;

  const setup: RenderPipelineSetupCallback = ({ passes }) => {
    const scenePass = passes.scenePass as THREE.PassNode;
    const mrt = TSL.mrt({
      output: TSL.output,
      emissive: TSL.emissive,
      normal: TSL.packNormalToRGB(TSL.normalView),
    });
    scenePass.setMRT(mrt);
  };

  const main: RenderPipelineMainCallback = ({
    renderPipeline,
    passes,
    camera,
  }) => {
    const scenePass = passes.scenePass;

    const scenePassNode = scenePass.getTextureNode("output");
    const emissiveNode = scenePass.getTextureNode("emissive");
    const depthNode = scenePass.getTextureNode("depth");
    const normalNode = TSL.sample((uv) => {
      return TSL.unpackRGBToNormal(
        scenePass.getTextureNode("normal").sample(uv),
      );
    });

    let composite: THREE.Node<"vec4"> = scenePassNode;

    if (config.aoEnabled) {
      const aoPass = ao(depthNode, normalNode, camera);
      aoPass.resolutionScale = 1;
      aoPass.radius = u.aoRadius;
      aoPass.thickness = u.aoThickness;
      aoPass.distanceExponent = u.aoDistanceExponent;
      aoPass.scale = u.aoIntensity;
      composite = composite.mul(aoPass.r);
    }

    if (config.bloomEnabled) {
      const bloomPass = bloom(emissiveNode, u.bloomStrength, u.bloomRadius);
      composite = composite.add(bloomPass);
    }

    renderPipeline.outputNode = composite;
  };

  const { rebuild } = useRenderPipeline(main, setup);

  // Toggles change the graph structure, so the pipeline needs a recompile; uniform-only edits above don't.
  useEffect(() => {
    rebuild();
  }, [config.aoEnabled, config.bloomEnabled, rebuild]);

  return null;
}
