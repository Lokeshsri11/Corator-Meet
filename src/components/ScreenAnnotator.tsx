"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { DrawStroke } from "@/lib/signals";

type ScreenAnnotatorProps = {
  strokes: DrawStroke[];
  active: boolean;
  onStroke: (stroke: DrawStroke) => void;
  onClear: () => void;
  onToggle: () => void;
};

export function ScreenAnnotator({
  strokes,
  active,
  onStroke,
  onClear,
  onToggle,
}: ScreenAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const [color, setColor] = useState("#3386fc");

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
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-20 ${active ? "cursor-crosshair" : "pointer-events-none"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-[#0f1524]/95 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
            active ? "bg-corator-600 text-white" : "bg-white/10 hover:bg-white/15"
          }`}
        >
          {active ? "Drawing on" : "Pen tool"}
        </button>
        {active && (
          <>
            {["#3386fc", "#ef4444", "#22c55e", "#f59e0b", "#ffffff"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 ${
                  color === c ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </>
  );
}
