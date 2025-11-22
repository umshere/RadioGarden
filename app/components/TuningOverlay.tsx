import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function TuningOverlay() {
    const navigation = useNavigation();
    const [isVisible, setIsVisible] = useState(false);
    const isLoading = navigation.state !== "idle";

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isLoading) {
            // Show immediately when loading starts
            setIsVisible(true);
        } else {
            // Hide quickly when loading completes
            timeout = setTimeout(() => setIsVisible(false), 150);
        }
        return () => clearTimeout(timeout);
    }, [isLoading]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-200 ${isLoading ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Simplified overlay - removed heavy effects */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 h-8 bg-indigo-500/80 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                    <p className="text-indigo-500/90 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
                        Tuning...
                    </p>
                </div>
            </div>
        </div>
    );
}
