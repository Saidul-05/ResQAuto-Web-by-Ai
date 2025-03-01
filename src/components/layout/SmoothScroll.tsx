import React, { useEffect } from "react";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    // Function to handle smooth scrolling with enhanced behavior and analytics tracking
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Find the closest anchor tag if the click was on a child element
      const anchorElement = target.closest("a");

      // Check if the clicked element or its parent is an anchor tag with a hash
      if (
        anchorElement &&
        anchorElement.getAttribute("href")?.startsWith("#")
      ) {
        e.preventDefault();

        const targetId = anchorElement.getAttribute("href")?.substring(1);
        const targetElement = document.getElementById(targetId || "");

        if (targetElement) {
          // Track the navigation event
          try {
            trackEvent({
              category: "Navigation",
              action: "Smooth Scroll",
              label: targetId || "Unknown Section",
              value: 1,
            });
          } catch (error) {
            console.error("Analytics error:", error);
          }

          // Calculate offset for fixed header (assuming header height is 80px)
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          // Scroll with smooth behavior
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Update URL hash without causing a jump
          window.history.pushState(
            null,
            "",
            anchorElement.getAttribute("href"),
          );
        }
      }
    };

    // Add event listener to the document
    document.addEventListener("click", handleSmoothScroll);

    // Handle initial hash in URL for smooth scrolling on page load
    const handleInitialHash = () => {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Delay scrolling slightly to ensure page is fully loaded
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Call the function to handle initial hash
    handleInitialHash();

    // Clean up event listener
    return () => {
      document.removeEventListener("click", handleSmoothScroll);
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
