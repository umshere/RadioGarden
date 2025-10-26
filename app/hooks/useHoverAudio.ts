import { useCallback, useRef, useEffect } from "react";

export function useHoverAudio() {
  const hoverAudioContextRef = useRef<AudioContext | null>(null);
  const hoverNoiseRef = useRef<(() => void) | null>(null);

  const triggerHoverStatic = useCallback(async () => {
    if (typeof window === "undefined") return;

    const AudioContextConstructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    if (!hoverAudioContextRef.current) {
      hoverAudioContextRef.current = new AudioContextConstructor();
    }

    const context = hoverAudioContextRef.current;
    if (!context) return;

    if (!hoverNoiseRef.current) {
      hoverNoiseRef.current = () => {
        const duration = 0.32;
        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * duration),
          context.sampleRate
        );
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < channel.length; i += 1) {
          const decay = 1 - i / channel.length;
          channel[i] = (Math.random() * 2 - 1) * Math.pow(decay, 1.6) * 0.4;
        }

        const source = context.createBufferSource();
        source.buffer = buffer;

        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1150;
        filter.Q.value = 1.8;

        const gain = context.createGain();
        gain.gain.value = 0.12;

        source.connect(filter).connect(gain).connect(context.destination);
        source.start();
        source.stop(context.currentTime + duration);
      };
    }

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    hoverNoiseRef.current?.();
  }, []);

  useEffect(() => {
    return () => {
      const context = hoverAudioContextRef.current;
      if (context) {
        context.close().catch(() => undefined);
        hoverAudioContextRef.current = null;
      }
    };
  }, []);

  return { triggerHoverStatic };
}
