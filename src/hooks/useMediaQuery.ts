import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Set initial value
      setMatches(media.matches);

      // Define callback for media query changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add listener for changes
      media.addEventListener("change", listener);

      // Clean up listener on unmount
      return () => {
        media.removeEventListener("change", listener);
      };
    }
  }, [query]);

  return matches;
}
