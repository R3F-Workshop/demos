import type { Ball, Bounds } from "./types";

export function createBalls(count: number, { width, height }: Bounds): Ball[] {
  const columns = Math.ceil(Math.sqrt(count * width / height));
  const rows = Math.ceil(count / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const maxRadius = Math.min(80, Math.min(cellWidth, cellHeight) * 0.35);

  // Start in a grid with room between balls, then send them in random directions.
  return Array.from({ length: count }, (_, id) => ({
    id,
    radius: maxRadius * (0.7 + Math.random() * 0.3),
    color: ["#ff0000", "#f68c28", "#4889ca", "#57a479", "#a477c6"][id % 5],
    position: {
      x: (id % columns + 0.5) * cellWidth,
      y: (Math.floor(id / columns) + 0.5) * cellHeight,
    },
    velocity: { x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 },
  }));
}
