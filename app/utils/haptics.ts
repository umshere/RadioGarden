// Lightweight haptics helper. Uses Vibration API when available.
export function vibrate(duration = 12) {
  if (typeof navigator === "undefined") return;
  // Guard: only short pulses on supported devices
  try {
    // @ts-ignore - vibrate may not exist on some browsers
    if (typeof navigator.vibrate === "function") {
      // @ts-ignore
      navigator.vibrate(duration);
    }
  } catch {
    // no-op
  }
}
