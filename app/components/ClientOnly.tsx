import { useHydrated } from "~/hooks/useHydrated";

type ClientOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Wrapper component that only renders its children on the client after hydration.
 * Prevents hydration mismatches for client-only content.
 * 
 * @example
 * ```tsx
 * <ClientOnly fallback={<Skeleton />}>
 *   <ComponentWithClientOnlyLogic />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hydrated = useHydrated();
  return hydrated ? <>{children}</> : <>{fallback}</>;
}
