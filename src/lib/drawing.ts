import type { DrawPoint } from "@/lib/signals";

/**
 * Draw a smooth freehand stroke using midpoint quadratic curves.
 * Points are in normalized [0,1] space; w/h scale them to canvas pixels.
 */
export function drawSmooth(
  ctx: CanvasRenderingContext2D,
  points: DrawPoint[],
  color: string,
  width: number,
  w: number,
  h: number,
) {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.92;
  ctx.beginPath();

  const sx = (p: DrawPoint) => p.x * w;
  const sy = (p: DrawPoint) => p.y * h;

  ctx.moveTo(sx(points[0]), sy(points[0]));

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (sx(points[i]) + sx(points[i + 1])) / 2;
    const midY = (sy(points[i]) + sy(points[i + 1])) / 2;
    ctx.quadraticCurveTo(sx(points[i]), sy(points[i]), midX, midY);
  }

  const last = points[points.length - 1];
  ctx.lineTo(sx(last), sy(last));
  ctx.stroke();
  ctx.restore();
}
