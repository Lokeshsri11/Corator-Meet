"use client";

import { useRef, useEffect, useCallback } from "react";
import type { DrawPoint, DrawStroke } from "@/lib/signals";
import { catmullRomToBezier } from "@/lib/signals";
import type { LiveDraw } from "@/hooks/useRoomSignals";

type ScreenAnnotatorProps = {
  strokes: DrawStroke[];
  liveDraws: LiveDraw[];
  active: boolean;
  color: string;
  onStroke: (stroke: DrawStroke) => void;
  onLivePoints: (id: string, points: DrawPoint[], color: string, width: number) => void;
};

const MIN_DIST = 3;

function dist(a: DrawPoint, b: DrawPoint) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: DrawPoint[],
  color: string,
  width: number,
  w: number,
  h: number,
) {
  if (points.length < 2) return;

  const scaled = points.map((p) => ({ x: p.x * w, y: p.y * h }));
  const path = catmullRomToBezier(scaled);
  if (!path) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.85;

  const p2d = new Path2D(path);
  ctx.stroke(p2d);
  ctx.restore();
}

export function ScreenAnnotator({
  strokes,
  liveDraws,
  active,
  color,
  onStroke,
  onLivePoints,
}: ScreenAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const currentPointsRef = useRef<DrawPoint[]>([]);
  const currentIdRef = useRef("");

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (const stroke of strokes) {
      drawSmoothStroke(ctx, stroke.points, stroke.color, stroke.width, w, h);
    }

    for (const ld of liveDraws) {
      drawSmoothStroke(ctx, ld.points, ld.color, ld.width, w, h);
    }

    if (drawingRef.current && currentPointsRef.current.length >= 2) {
      drawSmoothStroke(ctx, currentPointsRef.current, color, 3, w, h);
    }
  }, [strokes, liveDraws, color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      redraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPoint = (e: React.PointerEvent): DrawPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active) return;
    e.preventDefault();
    drawingRef.current = true;
    const pt = getPoint(e);
    currentPointsRef.current = [pt];
    currentIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || !drawingRef.current) return;

    const pt = getPoint(e);
    const pts = currentPointsRef.current;
    const last = pts[pts.length - 1];

    if (dist(pt, last) * 1000 < MIN_DIST) return;

    pts.push(pt);
    redraw();

    onLivePoints(currentIdRef.current, [...pts], color, 3);
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const points = currentPointsRef.current;
    if (points.length >= 2) {
      onStroke({
        id: currentIdRef.current,
        points,
        color,
        width: 3,
      });
    }
    currentPointsRef.current = [];
    currentIdRef.current = "";
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-20 ${active ? "cursor-crosshair" : "pointer-events-none"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
}
