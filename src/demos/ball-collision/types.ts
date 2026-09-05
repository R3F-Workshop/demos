export type Vec2 = { x: number; y: number };
export type Bounds = { width: number; height: number };

export type Ball = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  color: string;
};

export type Sample = { position: Vec2; time: number };

export type Drag = {
  id: number;
  pointerId: number;
  offset: Vec2;
  point: Vec2;
  samples: Sample[];
} | null;
