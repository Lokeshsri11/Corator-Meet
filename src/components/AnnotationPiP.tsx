"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { DrawStroke } from "@/lib/signals";
import type { LiveDraw } from "@/hooks/useRoomSignals";
import { drawSmooth } from "@/lib/drawing";

export type AnnotationPiPHandle = {
  requestPiP: () => Promise<void>;
};

type Props = {
  screenTrack: MediaStreamTrack | null;
  strokes: DrawStroke[];
  liveDraws: LiveDraw[];
};

export const AnnotationPiP = forwardRef<AnnotationPiPHandle, Props>(
  function AnnotationPiP({ screenTrack, strokes, liveDraws }, ref) {
    const srcVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pipVideoRef = useRef<HTMLVideoElement>(null);
    const rafRef = useRef(0);
    const [active, setActive] = useState(false);

    const strokesRef = useRef(strokes);
    const liveDrawsRef = useRef(liveDraws);
    strokesRef.current = strokes;
    liveDrawsRef.current = liveDraws;

    useEffect(() => {
      const video = srcVideoRef.current;
      if (!video || !screenTrack) return;
      video.srcObject = new MediaStream([screenTrack]);
      video.play().catch(() => {});
      return () => {
        video.srcObject = null;
      };
    }, [screenTrack]);

    useEffect(() => {
      if (!active) return;

      const loop = () => {
        const canvas = canvasRef.current;
        const video = srcVideoRef.current;
        if (!canvas || !video) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;

        if (canvas.width !== vw) canvas.width = vw;
        if (canvas.height !== vh) canvas.height = vh;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        ctx.drawImage(video, 0, 0, vw, vh);

        const scale = vw / 400;
        for (const s of strokesRef.current) {
          drawSmooth(ctx, s.points, s.color, s.width * scale, vw, vh);
        }
        for (const ld of liveDrawsRef.current) {
          drawSmooth(ctx, ld.points, ld.color, ld.width * scale, vw, vh);
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    }, [active]);

    const requestPiP = useCallback(async () => {
      const canvas = canvasRef.current;
      const pipVideo = pipVideoRef.current;
      if (!canvas || !pipVideo) return;

      if (!active) setActive(true);

      await new Promise((r) => setTimeout(r, 100));

      try {
        const stream = canvas.captureStream(20);
        pipVideo.srcObject = stream;
        await pipVideo.play();

        if ("requestPictureInPicture" in pipVideo) {
          await pipVideo.requestPictureInPicture();
        }
      } catch (err) {
        console.warn("PiP failed:", err);
      }
    }, [active]);

    useImperativeHandle(ref, () => ({ requestPiP }), [requestPiP]);

    useEffect(() => {
      const pipVideo = pipVideoRef.current;
      if (!pipVideo) return;
      const onLeave = () => setActive(false);
      pipVideo.addEventListener("leavepictureinpicture", onLeave);
      return () => pipVideo.removeEventListener("leavepictureinpicture", onLeave);
    }, []);

    useEffect(() => {
      return () => {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {});
        }
      };
    }, []);

    return (
      <div style={{ position: "fixed", left: -9999, top: -9999, width: 1, height: 1, overflow: "hidden" }}>
        <video ref={srcVideoRef} muted playsInline />
        <canvas ref={canvasRef} />
        <video ref={pipVideoRef} muted playsInline />
      </div>
    );
  },
);
