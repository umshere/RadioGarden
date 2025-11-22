/**
 * Shared button styling utilities
 * Provides consistent neomorphic design across all buttons in the application
 */

export const neomorphicButtonBase =
  "rounded-2xl bg-[#e0e5ec] text-slate-600 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] " +
  "active:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] " +
  "transition-all duration-200 ease-out hover:text-slate-800";

export const neomorphicButtonPrimary =
  "rounded-3xl bg-slate-900 text-white shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] " +
  "active:scale-95 transition-transform duration-150 hover:bg-slate-800";

export const neomorphicButtonLarge =
  "flex items-center justify-center rounded-3xl bg-slate-900 text-white " +
  "shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] " +
  "active:scale-95 transition-transform duration-150 hover:bg-slate-800 " +
  "h-20 px-10 text-sm font-bold uppercase tracking-widest gap-2";

export const neomorphicButtonSmall =
  "flex items-center justify-center rounded-2xl bg-[#e0e5ec] text-slate-500 " +
  "shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] " +
  "active:shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] " +
  "transition-all duration-200 h-14 w-14 hover:text-slate-800";

export const getNeomorphicButtonClass = (
  variant: "base" | "primary" | "large" | "small" = "base"
) => {
  switch (variant) {
    case "primary":
      return neomorphicButtonPrimary;
    case "large":
      return neomorphicButtonLarge;
    case "small":
      return neomorphicButtonSmall;
    default:
      return neomorphicButtonBase;
  }
};
