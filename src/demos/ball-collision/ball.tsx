import { useFrame, useThree } from "@react-three/fiber/webgpu";
import { useLayoutEffect } from "react";

import { useSimStore } from "./store";
import type { Ball as BallData } from "./types";

export function BallRenderer() {
  // Read the external ball data and render a view for each ball.
  const balls = useSimStore((state) => state.balls);
  const { setBounds, step } = useSimStore.getState();
  const { width, height } = useThree((state) => state.size);

  useLayoutEffect(() => {
    setBounds({ width, height });
  }, [setBounds, width, height]);

  // In a frame loop we update the balls in the store.
  useFrame((_, delta) => step(delta));

  return (
    <group position={[-width / 2, height / 2, 0]}>
      {balls.map((ball) => (
        <Ball key={ball.id} {...ball} />
      ))}
    </group>
  );
}

// A ball view only draws the data it receives.
export function Ball({ position, radius, color }: BallData) {
  return (
    <mesh position={[position.x, -position.y, 0]}>
      <circleGeometry args={[radius, 48]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
