"use client";

import { useEffect, useRef } from "react";
import {
  CarouselLayout,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  useCreateLayoutContext,
  useMaybeTrackRefContext,
  usePinnedTracks,
  useTracks,
} from "@livekit/components-react";
import {
  isEqualTrackRef,
  isTrackReference,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-core";
import { RoomEvent, Track } from "livekit-client";
import { ScreenAnnotator } from "@/components/ScreenAnnotator";
import { EmojiReactionsOverlay } from "@/components/EmojiReactionsOverlay";
import type { DrawPoint, DrawStroke } from "@/lib/signals";
import type { FloatingEmoji, LiveDraw } from "@/hooks/useRoomSignals";

type ConferenceLayoutProps = {
  floatingEmojis: FloatingEmoji[];
  strokes: DrawStroke[];
  liveDraws: LiveDraw[];
  penActive: boolean;
  penColor: string;
  onStroke: (stroke: DrawStroke) => void;
  onLivePoints: (id: string, points: DrawPoint[], color: string, width: number) => void;
  raisedHands: Record<string, string>;
  onScreenShareChange: (active: boolean) => void;
  viewMode: "auto" | "grid" | "speaker";
};

export function ConferenceLayout({
  floatingEmojis,
  strokes,
  liveDraws,
  penActive,
  penColor,
  onStroke,
  onLivePoints,
  raisedHands,
  onScreenShareChange,
  viewMode,
}: ConferenceLayoutProps) {
  const layoutContext = useCreateLayoutContext();
  const lastScreenShare = useRef<TrackReferenceOrPlaceholder | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((t) => t.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter((t) => !isEqualTrackRef(t, focusTrack));
  const hasScreenShare = screenShareTracks.some((t) => t.publication.isSubscribed);

  const useFocusLayout =
    viewMode === "speaker" ||
    (viewMode === "auto" && !!focusTrack);

  useEffect(() => {
    onScreenShareChange(hasScreenShare);
  }, [hasScreenShare, onScreenShareChange]);

  useEffect(() => {
    if (
      screenShareTracks.some((t) => t.publication.isSubscribed) &&
      lastScreenShare.current === null
    ) {
      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });
      lastScreenShare.current = screenShareTracks[0];
    } else if (
      lastScreenShare.current &&
      !screenShareTracks.some(
        (t) =>
          t.publication.trackSid ===
          lastScreenShare.current?.publication?.trackSid,
      )
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastScreenShare.current = null;
    }
  }, [screenShareTracks, layoutContext.pin]);

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="corator-meet-stage relative h-full w-full overflow-hidden p-2 sm:p-3">
        <EmojiReactionsOverlay emojis={floatingEmojis} />

        {viewMode === "grid" || (!useFocusLayout && viewMode === "auto") ? (
          <GridLayout tracks={tracks} className="h-full w-full">
            <ParticipantTileWithHand raisedHands={raisedHands} />
          </GridLayout>
        ) : (
          <FocusLayoutContainer className="h-full w-full">
            <CarouselLayout tracks={carouselTracks}>
              <ParticipantTileWithHand raisedHands={raisedHands} />
            </CarouselLayout>
            <div className="relative h-full min-h-0 w-full">
              {focusTrack && <FocusLayout trackRef={focusTrack} />}
              {hasScreenShare && (
                <ScreenAnnotator
                  strokes={strokes}
                  liveDraws={liveDraws}
                  active={penActive}
                  color={penColor}
                  onStroke={onStroke}
                  onLivePoints={onLivePoints}
                />
              )}
            </div>
          </FocusLayoutContainer>
        )}
      </div>
    </LayoutContextProvider>
  );
}

function ParticipantTileWithHand({
  raisedHands,
  ...props
}: React.ComponentProps<typeof ParticipantTile> & {
  raisedHands: Record<string, string>;
}) {
  const trackRef = useMaybeTrackRefContext();
  const handRaised = trackRef?.participant?.identity
    ? raisedHands[trackRef.participant.identity]
    : false;

  const isSpeaking = trackRef?.participant?.isSpeaking;

  return (
    <div
      className={`participant-tile-wrapper relative h-full w-full overflow-hidden rounded-xl transition-shadow duration-200 ${
        isSpeaking ? "ring-2 ring-corator-400/70 shadow-[0_0_12px_rgba(51,134,252,0.25)]" : ""
      }`}
    >
      <ParticipantTile {...props} />
      {handRaised && (
        <span className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-xs font-medium shadow-lg">
          <span className="text-sm">✋</span>
          <span className="hidden sm:inline">Raised</span>
        </span>
      )}
    </div>
  );
}
