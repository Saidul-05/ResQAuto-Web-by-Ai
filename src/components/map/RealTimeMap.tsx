import React, { useState, useEffect } from "react";
import { useFeatures } from "@/contexts/FeatureContext";
import MapboxMap from "./providers/MapboxMap";
import GoogleMap from "./providers/GoogleMap";
import LeafletMap from "./providers/LeafletMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle } from "lucide-react";
import FilterControls from "./FilterControls";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

interface RealTimeMapProps {
  onMechanicSelect?: (mechanic: any) => void;
}

const RealTimeMap: React.FC<RealTimeMapProps> = ({ onMechanicSelect }) => {
  const { mapProvider } = useFeatures();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading map...");
  const [mapError, setMapError] = useState<string>("");

  // Available specialties for filtering
  const allSpecialties = [
    "Emergency Repair",
    "Towing",
    "Electrical",
    "Diagnostics",
    "Tire Service",
    "Battery Jump",
    "Fuel Delivery",
    "Lockout Service",
  ];

  // Toggle specialty filter
  const toggleSpecialtyFilter = (specialty: string) => {
    setSpecialtyFilter((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all");
    setSpecialtyFilter([]);
    setMinRating(0);
    setMaxDistance(10);

    trackEvent({
      category: "Map",
      action: "Reset Filters",
      label: "All Filters",
      value: 1,
    });
  };

  // Handle mechanic selection with tracking
  const handleMechanicSelect = (mechanic: any) => {
    if (onMechanicSelect) {
      onMechanicSelect(mechanic);

      trackEvent({
        category: "Map",
        action: "Select Mechanic",
        label: `${mechanic.name} (${mechanic.status})`,
        value: mechanic.rating,
      });
    }
  };

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true);
    setLoadingMessage("Initializing map...");

    const timer = setTimeout(() => {
      setLoadingMessage("Detecting your location...");

      setTimeout(() => {
        setLoadingMessage("Finding nearby mechanics...");

        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }, 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mapProvider]);

  // Track map provider changes
  useEffect(() => {
    if (mapProvider) {
      trackEvent({
        category: "Map",
        action: "Provider Change",
        label: mapProvider,
        value: 1,
      });
    }
  }, [mapProvider]);

  const renderMap = () => {
    // Pass filters to map components
    const filterProps = {
      statusFilter,
      specialtyFilter,
      minRating,
      maxDistance,
    };

    switch (mapProvider) {
      case "mapbox":
        return (
          <MapboxMap
            onMechanicSelect={handleMechanicSelect}
            filters={filterProps}
          />
        );
      case "google":
        return (
          <GoogleMap
            onMechanicSelect={handleMechanicSelect}
            filters={filterProps}
          />
        );
      case "leaflet":
        return (
          <LeafletMap
            onMechanicSelect={handleMechanicSelect}
            filters={filterProps}
          />
        );
      case "none":
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Map Provider Not Selected
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Please enable a map provider in the admin panel to view the map.
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/admin")}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Go to Admin Panel
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 p-4 relative overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p className="dark:text-white">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {mapError && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center">
          <div className="text-center text-red-600 max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Map Error
              </h3>
              <p className="mb-2 dark:text-gray-300">{mapError}</p>
              <Button
                onClick={() => {
                  setMapError("");
                  setIsLoading(true);
                  setTimeout(() => window.location.reload(), 500);
                }}
                className="mt-2"
                variant="default"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter controls */}
      <FilterControls
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        specialtyFilter={specialtyFilter}
        toggleSpecialtyFilter={toggleSpecialtyFilter}
        minRating={minRating}
        setMinRating={setMinRating}
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
        allSpecialties={allSpecialties}
        filteredCount={10} // This would be dynamic in a real implementation
        resetFilters={resetFilters}
      />

      {renderMap()}
    </Card>
  );
};

export default RealTimeMap;
