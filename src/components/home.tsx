import React from "react";
import Navbar from "./navigation/Navbar";
import HeroSection from "./sections/HeroSection";
import AssistanceMap from "./map/AssistanceMap";
import EmergencyRequestForm from "./forms/EmergencyRequestForm";
import HowItWorks from "./sections/HowItWorks";
import TestimonialsSection from "./sections/TestimonialsSection";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-20">
        <HeroSection />
      </div>

      {/* Map and Emergency Form Section */}
      <div className="relative py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map takes up 2/3 of the space on desktop */}
            <div className="lg:col-span-2">
              <AssistanceMap />
            </div>
            {/* Emergency form takes up 1/3 of the space */}
            <div className="lg:col-span-1">
              <EmergencyRequestForm />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
};

export default Home;
