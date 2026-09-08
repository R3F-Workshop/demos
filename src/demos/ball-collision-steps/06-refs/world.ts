import { createWorld } from "koota";

import { actions } from "./actions";
import { Settings } from "./traits";

export const world = createWorld(Settings);
actions(world).restart({});

if (import.meta.hot) import.meta.hot.dispose(() => world.destroy());
