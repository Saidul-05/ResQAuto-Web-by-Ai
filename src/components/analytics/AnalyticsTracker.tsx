import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Define types for analytics events
export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  timestamp?: string;
}

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp?: string;
  nonInteraction?: boolean;
}

export interface EmergencyRequestEvent {
  requestId: string;
  location: string;
  serviceType?: string;
  mechanicId?: string;
  timestamp?: string;
  deviceType?: string;
  browser?: string;
}

export interface MechanicSelectionEvent {
  mechanicId: string;
  mechanicName: string;
  distance: string;
  rating: number;
  timestamp?: string;
}

// Track page views
export const trackPageView = (data: PageViewEvent) => {
  try {
    // Add timestamp if not provided
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Page View:", eventData);
    }

    // In a real app, you would send this to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-XXXXXXXXXX", {
        page_path: data.path,
        page_title: data.title,
        page_referrer: data.referrer,
      });
    }

    // You could also store events in localStorage for debugging
    const storedEvents = localStorage.getItem("analytics_page_views");
    const events = storedEvents ? JSON.parse(storedEvents) : [];
    events.push(eventData);
    localStorage.setItem(
      "analytics_page_views",
      JSON.stringify(events.slice(-20)),
    ); // Keep last 20 events
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
};

// Track general events
export const trackEvent = (data: AnalyticsEvent) => {
  try {
    // Add timestamp if not provided
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 Event [${data.category}][${data.action}]:`, eventData);
    }

    // In a real app, you would send this to your analytics service
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", data.action, {
        event_category: data.category,
        event_label: data.label,
        value: data.value,
        non_interaction: data.nonInteraction,
      });
    }

    // Store events in localStorage for debugging
    const storedEvents = localStorage.getItem("analytics_events");
    const events = storedEvents ? JSON.parse(storedEvents) : [];
    events.push(eventData);
    localStorage.setItem("analytics_events", JSON.stringify(events.slice(-50))); // Keep last 50 events
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};

// Track emergency requests
export const trackEmergencyRequest = (data: EmergencyRequestEvent) => {
  try {
    // Add timestamp if not provided
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Emergency Request:", eventData);
    }

    // Track as a standard event
    trackEvent({
      category: "Emergency",
      action: "Request",
      label: data.serviceType || "General",
      value: 1,
    });

    // Store emergency requests in localStorage for debugging
    const storedRequests = localStorage.getItem("emergency_requests");
    const requests = storedRequests ? JSON.parse(storedRequests) : [];
    requests.push(eventData);
    localStorage.setItem(
      "emergency_requests",
      JSON.stringify(requests.slice(-20)),
    ); // Keep last 20 requests
  } catch (error) {
    console.error("Error tracking emergency request:", error);
  }
};

// Track mechanic selections
export const trackMechanicSelection = (data: MechanicSelectionEvent) => {
  try {
    // Add timestamp if not provided
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Mechanic Selection:", eventData);
    }

    // Track as a standard event
    trackEvent({
      category: "Mechanic",
      action: "Selection",
      label: data.mechanicName,
      value: Math.round(data.rating),
    });

    // Store mechanic selections in localStorage for debugging
    const storedSelections = localStorage.getItem("mechanic_selections");
    const selections = storedSelections ? JSON.parse(storedSelections) : [];
    selections.push(eventData);
    localStorage.setItem(
      "mechanic_selections",
      JSON.stringify(selections.slice(-20)),
    ); // Keep last 20 selections
  } catch (error) {
    console.error("Error tracking mechanic selection:", error);
  }
};

// Analytics tracker component for global tracking
const AnalyticsTracker: React.FC = () => {
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

export default AnalyticsTracker;

// Add global type for gtag
declare global {
  interface Window {
    gtag: (command: string, target: string, config?: any) => void;
  }
}
