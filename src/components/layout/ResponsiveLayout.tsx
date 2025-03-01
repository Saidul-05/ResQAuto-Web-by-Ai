import React, { useEffect, useState } from "react";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  mobileBreakpoint = 640,
  tabletBreakpoint = 1024,
  className = "",
}) => {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newDeviceType =
        width <= mobileBreakpoint
          ? "mobile"
          : width <= tabletBreakpoint
            ? "tablet"
            : "desktop";

      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);

        // Track device type change for analytics
        trackEvent({
          category: "Responsive",
          action: "Device Change",
          label: newDeviceType,
          value: width,
        });
      }
    };

    // Set initial device type
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, [deviceType, mobileBreakpoint, tabletBreakpoint]);

  return (
    <div
      className={`responsive-layout ${className} ${deviceType}`}
      data-device={deviceType}
    >
      {children}
    </div>
  );
};

export default ResponsiveLayout;
