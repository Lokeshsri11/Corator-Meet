"use client";

import { useRef, useEffect, useCallback } from "react";
import type { DrawStroke } from "@/lib/signals";

type ScreenAnnotatorProps = {
  strokes: DrawStroke[];
  active: boolean;
  color: string;
  onStroke: (stroke: DrawStroke) => void;
};

export function ScreenAnnotator({
  strokes,
  active,
  color,
  onStroke,
}: ScreenAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [strokes]);

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

  const getPoint = (e: React.PointerEvent) => {
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
    currentPointsRef.current = [getPoint(e)];
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || !drawingRef.current) return;
    currentPointsRef.current.push(getPoint(e));
    redraw();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pts = currentPointsRef.current;
    if (pts.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    const last = pts[pts.length - 2];
    const cur = pts[pts.length - 1];
    ctx.moveTo(last.x * canvas.width, last.y * canvas.height);
    ctx.lineTo(cur.x * canvas.width, cur.y * canvas.height);
    ctx.stroke();
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const points = currentPointsRef.current;
    if (points.length >= 2) {
      onStroke({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        points,
        color,
        width: 3,
      });
    }
    currentPointsRef.current = [];
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
