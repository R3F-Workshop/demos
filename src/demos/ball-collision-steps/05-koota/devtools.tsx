import { Inspector, useInspectorControls } from "@react-three/drei/webgpu";
import { useActions, useWorld } from "koota/react";

import { actions } from "./actions";
import { Settings } from "./traits";

export function Devtools() {
  return (
    <Inspector>
      <Controls />
    </Inspector>
  );
}

function Controls() {
  const { count, radius } = useWorld().get(Settings)!;
  const { restart } = useActions(actions);

  useInspectorControls({
    count: { value: count, label: "Balls", min: 1, max: 5_000, step: 1, onChange: (count) => restart({ count }) },
    radius: { value: radius, label: "Radius", min: 2, max: 40, step: 1, onChange: (radius) => restart({ radius }) },
  }, { title: "Ball collision" });

  return null;
}
