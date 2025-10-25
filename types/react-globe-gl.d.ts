declare module "react-globe.gl" {
  import type { ForwardRefExoticComponent, RefAttributes } from "react";

  export interface GlobeMethods {
    controls?: () => {
      enableZoom?: boolean;
      enablePan?: boolean;
      autoRotate?: boolean;
      autoRotateSpeed?: number;
      minDistance?: number;
      maxDistance?: number;
    } & Record<string, unknown>;
    pointOfView(
      coords: { lat: number; lng: number; altitude: number },
      ms?: number
    ): void;
  }

  export type GlobeProps = Record<string, unknown>;

  const Globe: ForwardRefExoticComponent<
    GlobeProps & RefAttributes<GlobeMethods>
  >;
  export default Globe;
}
