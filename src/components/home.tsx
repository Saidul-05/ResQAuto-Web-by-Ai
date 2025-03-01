import React, { useState, useEffect, useRef } from "react";
import Navbar from "./navigation/Navbar";
import HeroSection from "./sections/HeroSection";
import RealTimeMap from "./map/RealTimeMap";
import EmergencyRequestForm from "./forms/EmergencyRequestForm";
import HowItWorks from "./sections/HowItWorks";
import TestimonialsSection from "./sections/TestimonialsSection";
import ContactSection from "./sections/ContactSection";
import Footer from "./layout/Footer";
import RequestService from "./request-tracking/RequestService";
import SmoothScroll from "./layout/SmoothScroll";
import { EmergencyRequest } from "@/types/schema";
import { trackPageView, trackEvent } from "./analytics/AnalyticsTracker";
import { FeatureProvider, useFeatures } from "@/contexts/FeatureContext";
import ResponsiveLayout from "./layout/ResponsiveLayout";

// Main component that uses the feature context
const HomeContent = () => {
  const { features } = useFeatures();
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(
    null,
  );
  const [selectedMechanic, setSelectedMechanic] = useState(null);

  // Track page view and setup scroll tracking when component mounts
  useEffect(() => {
    // Track initial page view
    trackPageView({
      path: "/",
      title: "ResQ Auto - Emergency Roadside Assistance",
      referrer: document.referrer,
    });

    // Set up intersection observers for section visibility tracking
    const sectionIds = [
      "hero",
      "map",
      "how-it-works",
      "testimonials",
      "contact",
    ];
    const sectionObservers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Track when a section becomes visible
                trackEvent({
                  category: "Section",
                  action: "View",
                  label:
                    id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
                  value: 1,
                });
              }
            });
          },
          { threshold: 0.3 }, // Fire when at least 30% of the section is visible
        );

        observer.observe(section);
        sectionObservers.push(observer);
      }
    });

    // Track device and viewport information
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const deviceType =
      viewportWidth <= 768
        ? "mobile"
        : viewportWidth <= 1024
          ? "tablet"
          : "desktop";

    trackEvent({
      category: "Device",
      action: "Visit",
      label: deviceType,
      value: 1,
    });

    trackEvent({
      category: "Viewport",
      action: "Dimensions",
      label: `${viewportWidth}x${viewportHeight}`,
      value: 1,
    });

    // Cleanup observers on unmount
    return () => {
      sectionObservers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleRequestSubmit = (request: EmergencyRequest) => {
    setActiveRequest(request);

    // Track successful request submission
    trackEvent({
      category: "Emergency",
      action: "Request Created",
      label: request.id,
      value: 1,
    });
  };

  const handleHeroExploreClick = () => {
    const mapSection = document.getElementById("map");
    if (mapSection) {
      // Track map exploration click
      trackEvent({
        category: "Navigation",
        action: "Hero CTA Click",
        label: "Explore Map",
        value: 1,
      });

      // Account for fixed header height
      const headerOffset = 80;
      const elementPosition = mapSection.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <SmoothScroll>
      <ResponsiveLayout className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Navbar />

        {/* Hero Section */}
        <div id="hero" className="pt-20">
          <HeroSection onExploreMapClick={handleHeroExploreClick} />
        </div>

        {/* Map and Emergency Form Section */}
        <div id="map" className="relative py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map takes up 2/3 of the space on desktop */}
              <div className="lg:col-span-2">
                <RealTimeMap onMechanicSelect={setSelectedMechanic} />
              </div>
              {/* Emergency form takes up 1/3 of the space */}
              <div className="lg:col-span-1">
                {activeRequest ? (
                  <RequestService
                    initialRequest={activeRequest}
                    selectedMechanic={selectedMechanic}
                  />
                ) : (
                  <EmergencyRequestForm
                    onRequestSubmit={handleRequestSubmit}
                    selectedMechanic={selectedMechanic}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Testimonials Section */}
        <div id="testimonials">
          <TestimonialsSection />
        </div>

        {/* Contact Section */}
        <div id="contact">
          <ContactSection />
        </div>

        {/* Footer */}
        <div id="footer">
          <Footer />
        </div>
      </ResponsiveLayout>
    </SmoothScroll>
  );
};

// Wrapper component that provides the feature context
const Home = () => {
  return (
    <FeatureProvider>
      <HomeContent />
    </FeatureProvider>
  );
};

export default Home;
