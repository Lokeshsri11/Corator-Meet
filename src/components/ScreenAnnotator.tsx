"use client";

import { useRef, useEffect, useCallback } from "react";
import type { DrawPoint, DrawStroke } from "@/lib/signals";
import type { LiveDraw } from "@/hooks/useRoomSignals";
import { drawSmooth } from "@/lib/drawing";

type ScreenAnnotatorProps = {
  strokes: DrawStroke[];
  liveDraws: LiveDraw[];
  active: boolean;
  color: string;
  onStroke: (stroke: DrawStroke) => void;
  onLivePoints: (id: string, points: DrawPoint[], color: string, width: number) => void;
};

const LINE_WIDTH = 3.5;

export function ScreenAnnotator({
  strokes,
  liveDraws,
  active,
  color,
  onStroke,
  onLivePoints,
}: ScreenAnnotatorProps) {
  // Base canvas: committed strokes + remote live draws
  const baseRef = useRef<HTMLCanvasElement>(null);
  // Overlay canvas: current local drawing (incremental, no clear-redraw)
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const drawingRef = useRef(false);
  const pointsRef = useRef<DrawPoint[]>([]);
  const strokeIdRef = useRef("");
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Redraw base canvas from committed strokes + remote live draws */
  const redrawBase = useCallback(() => {
    const canvas = baseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokes) {
      drawSmooth(ctx, s.points, s.color, s.width, canvas.width, canvas.height);
    }
    for (const ld of liveDraws) {
      drawSmooth(ctx, ld.points, ld.color, ld.width, canvas.width, canvas.height);
    }
  }, [strokes, liveDraws]);

  /** Sync canvas dimensions to parent */
  useEffect(() => {
    const base = baseRef.current;
    const overlay = overlayRef.current;
    if (!base || !overlay) return;
    const parent = base.parentElement;
    if (!parent) return;

    const sync = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      base.width = w;
      base.height = h;
      overlay.width = w;
      overlay.height = h;
      redrawBase();
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [redrawBase]);

  /** Redraw base whenever strokes or liveDraws change */
  useEffect(() => {
    redrawBase();
  }, [redrawBase]);

  /** Redraw when tab becomes visible again (handles cross-tab issue) */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") redrawBase();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [redrawBase]);

  /** Finish a stroke: commit overlay → base, clear overlay, notify parent */
  const commitStroke = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }

    const pts = pointsRef.current;
    const overlay = overlayRef.current;
    const base = baseRef.current;

    if (pts.length >= 2 && overlay && base) {
      // Blit the incrementally-drawn overlay onto the base canvas
      const baseCtx = base.getContext("2d");
      baseCtx?.drawImage(overlay, 0, 0);
      overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);

      onStroke({ id: strokeIdRef.current, points: pts, color, width: LINE_WIDTH });
    } else if (overlay) {
      overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
    }

    pointsRef.current = [];
    strokeIdRef.current = "";
  }, [color, onStroke]);

  /** Global pointerup so strokes don't end if pointer briefly exits canvas */
  useEffect(() => {
    const onUp = () => {
      if (drawingRef.current) commitStroke();
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [commitStroke]);

  const getPoint = (e: React.PointerEvent | PointerEvent): DrawPoint => {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();

    drawingRef.current = true;
    const pt = getPoint(e);
    pointsRef.current = [pt];
    strokeIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.setPointerCapture(e.pointerId);

    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || !drawingRef.current) return;

    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    const pt = getPoint(e);
    const pts = pointsRef.current;
    pts.push(pt);

    const w = overlay.width;
    const h = overlay.height;

    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.92;

    if (pts.length === 2) {
      // Draw first segment as a straight line
      ctx.beginPath();
      ctx.moveTo(pts[0].x * w, pts[0].y * h);
      ctx.lineTo(pts[1].x * w, pts[1].y * h);
      ctx.stroke();
    } else if (pts.length >= 3) {
      // Draw the newest smooth segment using the midpoint technique
      const p1 = pts[pts.length - 3];
      const p2 = pts[pts.length - 2];
      const p3 = pts[pts.length - 1];

      const prevMidX = (p1.x * w + p2.x * w) / 2;
      const prevMidY = (p1.y * h + p2.y * h) / 2;
      const newMidX = (p2.x * w + p3.x * w) / 2;
      const newMidY = (p2.y * h + p3.y * h) / 2;

      ctx.beginPath();
      ctx.moveTo(prevMidX, prevMidY);
      ctx.quadraticCurveTo(p2.x * w, p2.y * h, newMidX, newMidY);
      ctx.stroke();
    }

    // Throttle network updates (no need to send every pixel)
    if (!sendTimerRef.current) {
      sendTimerRef.current = setTimeout(() => {
        sendTimerRef.current = null;
        onLivePoints(strokeIdRef.current, [...pts], color, LINE_WIDTH);
      }, 40);
    }
  };

  return (
    <div
      className="absolute inset-0 z-20"
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
      {/* Base: committed + remote strokes */}
      <canvas
        ref={baseRef}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      />
      {/* Overlay: current local drawing */}
      <canvas
        ref={overlayRef}
        className={`absolute inset-0 ${active ? "cursor-crosshair" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      />
    </div>
  );
}
