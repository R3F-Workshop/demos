import { WorldProvider } from "koota/react";

import { BallCollisionScene } from "./scene";
import { world } from "./world";

export default function Demo() {
  return (
    <WorldProvider world={world}>
      <BallCollisionScene />
    </WorldProvider>
  );
}
