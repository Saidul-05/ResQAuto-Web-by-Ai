import React, { useState } from "react";
import Navbar from "./navigation/Navbar";
import HeroSection from "./sections/HeroSection";
import AssistanceMap from "./map/AssistanceMap";
import EmergencyRequestForm from "./forms/EmergencyRequestForm";
import HowItWorks from "./sections/HowItWorks";
import TestimonialsSection from "./sections/TestimonialsSection";
import Footer from "./layout/Footer";
import RequestService from "./request-tracking/RequestService";
import SmoothScroll from "./layout/SmoothScroll";
import { EmergencyRequest } from "@/types/schema";

const Home = () => {
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(
    null,
  );
  const [selectedMechanic, setSelectedMechanic] = useState(null);

  const handleRequestSubmit = (request: EmergencyRequest) => {
    setActiveRequest(request);
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <div id="hero" className="pt-20">
          <HeroSection />
        </div>

        {/* Map and Emergency Form Section */}
        <div id="map" className="relative py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map takes up 2/3 of the space on desktop */}
              <div className="lg:col-span-2">
                <AssistanceMap onMechanicSelect={setSelectedMechanic} />
              </div>
              {/* Emergency form takes up 1/3 of the space */}
              <div className="lg:col-span-1">
                {activeRequest ? (
                  <RequestService
                    initialRequest={activeRequest}
                    selectedMechanic={selectedMechanic}
                  />
                ) : (
                  <EmergencyRequestForm onRequestSubmit={handleRequestSubmit} />
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

        {/* Footer */}
        <div id="contact">
          <Footer />
        </div>
      </div>
    </SmoothScroll>
  );
};

export default Home;
