import { trait } from "koota";

export const IsBall = trait();
export const Position = trait({ x: 0, y: 0 });
export const Velocity = trait({ x: 0, y: 0 });
export const Radius = trait({ value: 40 });
export const Drag = trait({ pointerId: 0, offsetX: 0, offsetY: 0 });
export const Settings = trait({ count: 2, radius: 40 });
