import { useState, useRef, useEffect, useCallback } from "react";
import type { Station } from "~/types/radio";

export function useRadioPlayer() {
  const [nowPlaying, setNowPlaying] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoPlayRef = useRef(false);

  // Manage audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!nowPlaying) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
      return;
    }

    const streamUrl = nowPlaying.streamUrl ?? nowPlaying.url ?? "";
    if (!streamUrl) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
      return;
    }

    if (audio.src !== streamUrl) {
      audio.src = streamUrl;
    }

    if (autoPlayRef.current) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }

    autoPlayRef.current = false;
  }, [nowPlaying]);

  // Audio level animation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    let animationFrame: number;
    const animate = () => {
      setAudioLevel(isPlaying ? Math.random() * 0.6 + 0.2 : 0);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  const startStation = useCallback(
    (station: Station, options?: { autoPlay?: boolean }) => {
      const hasStream = Boolean(station.streamUrl ?? station.url);
      const autoPlay = options?.autoPlay ?? false;
      autoPlayRef.current = autoPlay && hasStream;
      setNowPlaying(station);
    },
    []
  );

  const playPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        /* ignore */
      });
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    setNowPlaying(null);
    setIsPlaying(false);
  }, []);

  return {
    nowPlaying,
    isPlaying,
    audioLevel,
    shuffleMode,
    currentStationIndex,
    audioRef,
    setShuffleMode,
    setCurrentStationIndex,
    setNowPlaying,
    startStation,
    playPause,
    stop,
  };
}
