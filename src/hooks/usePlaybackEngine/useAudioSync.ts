import { useEffect, useRef, useState, useCallback, type RefObject } from "react";
import type { AppMode } from "../../utils/appMode";
import type { SignalSource } from "../../utils/signalSource";
import { TRIAL_SECONDS } from "./useFrameTick";

interface Params {
  mode: AppMode;
  isPaused: boolean;
  speed: number;
  timeRef: RefObject<number>;
  sourceRef: RefObject<SignalSource>;
}

export interface AudioController {
  audioRef: RefObject<HTMLAudioElement | null>;
  audioHasErrorRef: RefObject<boolean>;
  audioError: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  syncTrialAudio: (trialIndex: number, startOffset?: number) => void;
  playStimulusAudio: () => void;
  pauseAudio: () => void;
}

// Manages the demo-mode <audio> element lifecycle and serves as the audio master
// clock controller for useFrameTick. Surfaces `audioError` when the expected asset fails to load.
export function useAudioSync({ mode, isPaused, speed, timeRef, sourceRef }: Params): AudioController {
  const [audioError, setAudioError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const isMutedRef = useRef(true);
  isMutedRef.current = isMuted;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioHasErrorRef = useRef(false);
  const currentTrialIndexRef = useRef<number | null>(null);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next || speed === 10;
        if (!next && !isPaused) {
          // If unmuting while playing, ensure audio currentTime is locked to the visual stimulus elapsed time
          const currentTotalTime = timeRef.current;
          const trialElapsed = currentTotalTime % TRIAL_SECONDS;
          if (trialElapsed >= 3.0) {
            const expectedAudioTime = trialElapsed - 3.0;
            if (Math.abs(audio.currentTime - expectedAudioTime) > 0.15) {
              audio.currentTime = expectedAudioTime;
            }
          }
          if (audio.paused) {
            audio.play().catch((err) => {
              console.log("Audio autoplay / play failed or was blocked by browser:", err);
            });
          }
        }
      }
      return next;
    });
  }, [speed, isPaused, timeRef]);

  // Load or switch audio track for the given trial
  const loadTrack = useCallback((trialIndex: number) => {
    if (mode.kind !== "demo") return;
    const trialNumStr = String(trialIndex + 1).padStart(2, "0");
    const expectedSrc = `/audio/video-${trialNumStr}.m4a`;

    if (!audioRef.current) {
      const audio = new Audio(expectedSrc);
      audio.preload = "auto";
      audio.muted = isMutedRef.current || speed === 10;
      audio.onerror = () => {
        audioHasErrorRef.current = true;
        setAudioError(true);
        audio.pause();
      };
      audioRef.current = audio;
      audioHasErrorRef.current = false;
      setAudioError(false);
    } else if (audioRef.current.src && !audioRef.current.src.endsWith(expectedSrc)) {
      audioRef.current.pause();
      audioRef.current.src = expectedSrc;
      audioRef.current.muted = isMutedRef.current || speed === 10;
      audioHasErrorRef.current = false;
      setAudioError(false);
      audioRef.current.load();
    } else if (audioRef.current) {
      audioRef.current.muted = isMutedRef.current || speed === 10;
    }
    currentTrialIndexRef.current = trialIndex;
  }, [mode.kind, speed, sourceRef]);

  const syncTrialAudio = useCallback((trialIndex: number, startOffset = 0) => {
    loadTrack(trialIndex);
    const audio = audioRef.current;
    if (!audio) return;

    if (startOffset < 3.0) {
      if (!audio.paused) audio.pause();
      audio.currentTime = 0;
    } else {
      audio.currentTime = startOffset - 3.0;
      if (!isPaused && !audioHasErrorRef.current) {
        audio.play().catch((err) => {
          console.log("Audio autoplay / play failed or was blocked by browser:", err);
        });
      }
    }
  }, [loadTrack, isPaused]);

  const playStimulusAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isPaused || audioHasErrorRef.current) return;
    if (audio.paused) {
      audio.play().catch((err) => {
        console.log("Audio autoplay / play failed or was blocked by browser:", err);
      });
    }
  }, [isPaused]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  // Update speed & muted whenever speed or isMuted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.muted = isMuted || speed === 10;
    }
  }, [speed, isMuted]);

  // Handle mode switches & pause toggles
  useEffect(() => {
    if (mode.kind !== "demo") {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioHasErrorRef.current = false;
      setAudioError(false);
      currentTrialIndexRef.current = null;
      return;
    }

    const trialIndex = Math.floor(timeRef.current / TRIAL_SECONDS) % 40;
    loadTrack(trialIndex);

    const trialElapsed = timeRef.current % TRIAL_SECONDS;
    if (isPaused) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    } else if (trialElapsed >= 3.0 && !audioHasErrorRef.current) {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((err) => {
          console.log("Audio autoplay / play failed or was blocked by browser:", err);
        });
      }
    }
  }, [mode.kind, isPaused, loadTrack, timeRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    audioRef,
    audioHasErrorRef,
    audioError,
    isMuted,
    toggleMute,
    syncTrialAudio,
    playStimulusAudio,
    pauseAudio,
  };
}
