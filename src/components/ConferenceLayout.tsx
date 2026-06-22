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
  useParticipantContext,
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
import type { DrawStroke } from "@/lib/signals";
import type { FloatingEmoji } from "@/hooks/useRoomSignals";

type ConferenceLayoutProps = {
  floatingEmojis: FloatingEmoji[];
  strokes: DrawStroke[];
  penActive: boolean;
  onPenToggle: () => void;
  onStroke: (stroke: DrawStroke) => void;
  onClearDrawing: () => void;
  raisedHands: Record<string, string>;
};

export function ConferenceLayout({
  floatingEmojis,
  strokes,
  penActive,
  onPenToggle,
  onStroke,
  onClearDrawing,
  raisedHands,
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
      <div className="relative h-full w-full">
        <EmojiReactionsOverlay emojis={floatingEmojis} />

        {!focusTrack ? (
          <div className="lk-grid-layout-wrapper h-full">
            <GridLayout tracks={tracks} className="h-full">
              <ParticipantTileWithHand raisedHands={raisedHands} />
            </GridLayout>
          </div>
        ) : (
          <div className="lk-focus-layout-wrapper relative h-full">
            <FocusLayoutContainer className="h-full">
              <CarouselLayout tracks={carouselTracks}>
                <ParticipantTileWithHand raisedHands={raisedHands} />
              </CarouselLayout>
              <div className="relative h-full w-full">
                {focusTrack && <FocusLayout trackRef={focusTrack} />}
                {hasScreenShare && (
                  <ScreenAnnotator
                    strokes={strokes}
                    active={penActive}
                    onToggle={onPenToggle}
                    onStroke={onStroke}
                    onClear={onClearDrawing}
                  />
                )}
              </div>
            </FocusLayoutContainer>
          </div>
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
  const participant = useParticipantContext();
  const handRaised = raisedHands[participant.identity];

  return (
    <div className="relative h-full w-full">
      <ParticipantTile {...props} />
      {handRaised && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-amber-500/90 px-2 py-0.5 text-sm shadow-lg">
          ✋
        </span>
      )}
    </div>
  );
}
