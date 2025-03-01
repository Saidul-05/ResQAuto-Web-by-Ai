import React, { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhoneCall, MapPin, Clock } from "lucide-react";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundUrl?: string;
  onEmergencyClick?: () => void;
  onExploreMapClick?: () => void;
}

const HeroSection = ({
  title = "24/7 Emergency Roadside Assistance",
  subtitle = "Professional mechanics at your service, anywhere, anytime",
  backgroundUrl = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80",
  onEmergencyClick = () => console.log("Emergency assistance requested"),
  onExploreMapClick = () => {
    const mapSection = document.getElementById("map");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },
}: HeroSectionProps) => {
  const controls = useAnimation();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    // Start the animation sequence when component is in view
    const animateHero = async () => {
      if (isInView) {
        // Track hero section view
        trackEvent({
          category: "Section",
          action: "View",
          label: "Hero",
          value: 1,
        });

        // Staggered animation sequence
        await controls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: "easeOut" },
        });
      }
    };

    animateHero();
  }, [controls, isInView]);

  // Track button clicks
  const handleEmergencyClick = () => {
    trackEvent({
      category: "Button",
      action: "Click",
      label: "Emergency Assistance",
      value: 1,
    });
    onEmergencyClick();
  };

  const handleExploreMapClick = () => {
    trackEvent({
      category: "Button",
      action: "Click",
      label: "Explore Map",
      value: 1,
    });
    onExploreMapClick();
  };
  return (
    <div className="relative w-full h-[800px] bg-gray-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="destructive"
              className="w-full sm:w-auto text-lg px-8 py-6"
              onClick={handleEmergencyClick}
            >
              <PhoneCall className="mr-2 h-5 w-5" />
              Request Emergency Assistance
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 hover:bg-white/20"
              onClick={handleExploreMapClick}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Explore Nearby Mechanics
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <Clock className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-300">
                Available round the clock for your emergencies
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <MapPin className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nationwide Coverage
              </h3>
              <p className="text-gray-300">
                Service available across the country
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center"
            >
              <PhoneCall className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quick Response</h3>
              <p className="text-gray-300">
                Average response time under 30 minutes
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
