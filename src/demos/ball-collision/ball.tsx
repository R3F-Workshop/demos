import { useFrame } from "@react-three/fiber/webgpu";
import { useState } from "react";

	// Our start and end positions
	const start = 0;
	const end = 200;

export function Ball() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState(100); // px/s

  // In a frame loop we update the position of the ball
  useFrame((_, delta) => {
    // If the ball reaches the start or finish, reverse the direction
    if (position.x >= end) setVelocity(-100);
    else if (position.x <= start) setVelocity(100);
    // Move by velocity × elapsed time
    setPosition((prev) => ({ x: prev.x + velocity * delta, y: prev.y }));
  });

  return (
    <mesh position={[position.x, position.y, 0]}>
      <circleGeometry args={[80, 96]} />
      <meshBasicMaterial color="red" toneMapped={false} />
    </mesh>
  );
}
