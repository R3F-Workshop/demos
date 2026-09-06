import { Inspector, useInspectorControls } from "@react-three/drei/webgpu";

import { useBallStore } from "./store";

export function Devtools() {
  return (
    <Inspector>
      <Controls />
    </Inspector>
  );
}

function Controls() {
  const { balls, radius, restart } = useBallStore.getState();

  useInspectorControls({
    count: { value: balls.length, label: "Balls", min: 1, max: 5_000, step: 1, onChange: (count) => restart({ count }) },
    radius: { value: radius, label: "Radius", min: 2, max: 40, step: 1, onChange: (radius) => restart({ radius }) },
  }, { title: "Ball collision" });

  return null;
}
