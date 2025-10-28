import { useState, useEffect } from "react";

/**
 * Returns true after the component has hydrated on the client.
 * Use this to prevent hydration mismatches for client-only content.
 * 
 * @example
 * ```tsx
 * const hydrated = useHydrated();
 * return (
 *   <div>
 *     {hydrated && <ClientOnlyComponent />}
 *   </div>
 * );
 * ```
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
