/**
 * useHideNearFooter — returns true when the <footer> element
 * is visible in the viewport (buttons should hide to avoid overlap).
 */
import { useState, useEffect } from "react";

export function useHideNearFooter(): boolean {
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShouldHide(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return shouldHide;
}
