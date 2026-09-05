import { useFrame } from "@react-three/fiber/webgpu";

import { useBallStore, type BallData } from "./store";

export function BallRenderer() {
  const balls = useBallStore((state) => state.balls);

  // Advance the external data once per frame.
  useFrame(({ size }, delta) => useBallStore.getState().step(delta, size));

  return balls.map((ball) => <Ball key={ball.id} {...ball} />);
}

function Ball({ position, radius }: BallData) {
  return (
    <mesh position={[position.x, position.y, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh>
  );
}
