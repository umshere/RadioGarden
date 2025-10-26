export const scrollToId = (
  id: string,
  block: ScrollLogicalPosition = "start"
) => {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });
};

export const scrollToTop = () => {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

export const scrollToSelector = (
  selector: string,
  block: ScrollLogicalPosition = "nearest"
) => {
  if (typeof document === "undefined") return;
  document
    .querySelector(selector)
    ?.scrollIntoView({ behavior: "smooth", block });
};

export const isElementOffscreen = (el: HTMLElement): boolean => {
  const rect = el.getBoundingClientRect();
  const viewportH = window.innerHeight || document.documentElement.clientHeight;
  return rect.top > viewportH * 0.9 || rect.bottom < 0;
};

export const scrollIfOffscreen = (
  id: string,
  block: ScrollLogicalPosition = "center"
) => {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el && isElementOffscreen(el)) {
    el.scrollIntoView({ behavior: "smooth", block });
  }
};
