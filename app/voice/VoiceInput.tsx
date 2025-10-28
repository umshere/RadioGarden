import { useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";

type VoiceInputStatus = "idle" | "listening" | "error" | "unsupported";

type VoiceInputProps = {
  onTranscript: (transcript: string) => void;
  onStatusChange?: (status: VoiceInputStatus, message?: string) => void;
  className?: string;
  disabled?: boolean;
};

export default function VoiceInput({ onTranscript, onStatusChange, className, disabled }: VoiceInputProps) {
  const recognitionRef = useRef<any>(null);
  const [status, setStatus] = useState<VoiceInputStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

    if (!SpeechRecognitionCtor) {
      setStatus("unsupported");
      setError("Speech input is not supported in this browser.");
      onStatusChange?.("unsupported", "Speech input is not supported");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = event.results?.[event.resultIndex ?? 0];
      const transcript = result?.[0]?.transcript?.trim();
      setStatus("idle");
      if (transcript) {
        setError(null);
        onStatusChange?.("idle");
        onTranscript(transcript);
      } else {
        setError("We couldn't catch that. Try again?");
        onStatusChange?.("error", "We couldn't catch that. Try again?");
      }
    };

    recognition.onerror = (event: any) => {
      const message =
        event.error === "no-speech"
          ? "No speech detected."
          : event.error === "not-allowed"
          ? "Microphone access was blocked."
          : "Speech recognition error.";
      setStatus("error");
      setError(message);
      onStatusChange?.("error", message);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        setStatus((prev) => (prev === "listening" ? "idle" : prev));
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognitionRef.current = null;
    };
  }, [onStatusChange, onTranscript]);

  const tooltip = useMemo(() => {
    if (disabled) return "Voice search disabled while loading.";
    if (status === "unsupported") return error ?? "Voice input not supported.";
    if (status === "error") return error ?? "Voice input error.";
    if (status === "listening") return "Listening…";
    return "Ask the Passport for a vibe";
  }, [disabled, error, status]);

  const handleToggle = () => {
    if (disabled) return;
    if (!recognitionRef.current) {
      setError("Speech input is not supported in this browser.");
      setStatus("unsupported");
      onStatusChange?.("unsupported", "Speech input is not supported");
      return;
    }

    try {
      if (status === "listening") {
        recognitionRef.current.stop();
        setStatus("idle");
        onStatusChange?.("idle");
      } else {
        recognitionRef.current.start();
        setStatus("listening");
        setError(null);
        onStatusChange?.("listening");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start voice input.";
      setError(message);
      setStatus("error");
      onStatusChange?.("error", message);
    }
  };

  const Icon = status === "listening" ? IconMicrophoneOff : IconMicrophone;

  return (
    <Tooltip label={tooltip} position="top">
      <ActionIcon
        onClick={handleToggle}
        className={className}
        size="lg"
        radius="xl"
        variant={status === "listening" ? "filled" : "light"}
        color={status === "listening" ? "ocean.5" : "ocean.4"}
        disabled={status === "unsupported" || disabled}
      >
        <Icon size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
