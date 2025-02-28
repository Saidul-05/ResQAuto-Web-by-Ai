import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
}

const AnalyticsTracker = () => {
  const location = useLocation();

  // Track page views when route changes
  useEffect(() => {
    trackPageView({
      path: location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }, [location]);

  return null; // This component doesn't render anything
};

// Function to track page views
export const trackPageView = (data: PageViewData) => {
  try {
    console.log("Analytics: Page View", data);

    // In a real implementation, you would send this to your analytics service
    // Example for Google Analytics:
    // if (window.gtag) {
    //   window.gtag('config', 'GA-MEASUREMENT-ID', {
    //     page_path: data.path,
    //     page_title: data.title,
    //     page_referrer: data.referrer
    //   });
    // }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Function to track events
export const trackEvent = (event: AnalyticsEvent) => {
  try {
    console.log("Analytics: Event", event);

    // In a real implementation, you would send this to your analytics service
    // Example for Google Analytics:
    // if (window.gtag) {
    //   window.gtag('event', event.action, {
    //     event_category: event.category,
    //     event_label: event.label,
    //     value: event.value,
    //     non_interaction: event.nonInteraction
    //   });
    // }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Function to track user identification
export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>,
) => {
  try {
    console.log("Analytics: Identify User", { userId, userProperties });

    // In a real implementation, you would send this to your analytics service
    // Example for a custom analytics service:
    // if (window.analytics) {
    //   window.analytics.identify(userId, userProperties);
    // }
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Function to track emergency requests
export const trackEmergencyRequest = (requestData: {
  requestId: string;
  location: string;
  serviceType?: string;
  mechanicId?: string;
}) => {
  try {
    console.log("Analytics: Emergency Request", requestData);

    trackEvent({
      category: "Emergency",
      action: "Request",
      label: requestData.serviceType || "General",
      value: 1,
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

// Function to track mechanic selection
export const trackMechanicSelection = (mechanicData: {
  mechanicId: string;
  mechanicName: string;
  distance: string;
  rating: number;
}) => {
  try {
    console.log("Analytics: Mechanic Selection", mechanicData);

    trackEvent({
      category: "Mechanic",
      action: "Selection",
      label: mechanicData.mechanicName,
      value: Math.round(mechanicData.rating * 100), // Convert rating to integer value
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
};

export default AnalyticsTracker;
