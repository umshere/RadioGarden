import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function TuningOverlay() {
    const navigation = useNavigation();
    const [isVisible, setIsVisible] = useState(false);
    const isLoading = navigation.state === "loading";

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isLoading) {
            setIsVisible(true);
        } else {
            // Keep it visible for a split second to smooth out fast transitions
            timeout = setTimeout(() => setIsVisible(false), 400);
        }
        return () => clearTimeout(timeout);
    }, [isLoading]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-500 ${isLoading ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Noise Layer */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-noise" />

            {/* Scanline Layer */}
            <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 h-8 bg-emerald-400/80 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                    <p className="text-emerald-400/90 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
                        Tuning...
                    </p>
                </div>
            </div>

            <style>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        .bg-scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
          background-size: 100% 4px;
        }
      `}</style>
        </div>
    );
}
