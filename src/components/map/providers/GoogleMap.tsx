import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import FilterControls from "../FilterControls";
import MechanicList from "../MechanicList";

interface Mechanic {
  id: string;
  name: string;
  rating: number;
  distance: string;
  status: "available" | "busy";
  specialties: string[];
  phone: string;
}

interface GoogleMapProps {
  onMechanicSelect?: (mechanic: Mechanic) => void;
  filters?: {
    statusFilter: string;
    specialtyFilter: string[];
    minRating: number;
    maxDistance: number;
  };
}

const defaultMechanics: Mechanic[] = [
  {
    id: "1",
    name: "John Smith",
    rating: 4.8,
    distance: "0.5 miles",
    status: "available",
    specialties: ["Emergency Repair", "Towing"],
    phone: "(555) 123-4567",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    rating: 4.9,
    distance: "1.2 miles",
    status: "busy",
    specialties: ["Electrical", "Diagnostics"],
    phone: "(555) 987-6543",
  },
  {
    id: "3",
    name: "Mike Wilson",
    rating: 4.7,
    distance: "0.8 miles",
    status: "available",
    specialties: ["Tire Service", "Battery Jump"],
    phone: "(555) 456-7890",
  },
];

const GoogleMap: React.FC<GoogleMapProps> = ({
  onMechanicSelect = () => {},
  filters = {
    statusFilter: "all",
    specialtyFilter: [],
    minRating: 0,
    maxDistance: 10,
  },
}) => {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading map...");
  const [filteredMechanics, setFilteredMechanics] =
    useState<Mechanic[]>(defaultMechanics);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const handleMechanicSelect = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    onMechanicSelect(mechanic);
  };

  // Get user's location
  useEffect(() => {
    setLoadingMessage("Detecting your location...");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError(
          "Unable to get your location. Using default location.",
        );
        // Default to New York City
        setUserLocation({ lat: 40.7128, lng: -74.006 });
        setIsLoading(false);
      },
    );
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      // Load Google Maps API script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);

      return () => {
        // Clean up script if component unmounts before script loads
        document.head.removeChild(script);
      };
    } else {
      initializeMap();
    }

    function initializeMap() {
      try {
        googleMapRef.current = new window.google.maps.Map(mapRef.current!, {
          center: userLocation,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        // Add user marker
        new window.google.maps.Marker({
          position: userLocation,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Your Location",
        });

        // Add mechanic markers
        addMechanicMarkers();
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        setLocationError("Failed to initialize map. Please try again.");
      }
    }

    function addMechanicMarkers() {
      if (!googleMapRef.current) return;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add markers for each mechanic
      filteredMechanics.forEach((mechanic, index) => {
        // Calculate position (spiral pattern around user)
        const angle = index * 137.5 * (Math.PI / 180);
        const radius = 0.002 + index * 0.0005;
        const position = {
          lat: userLocation!.lat + radius * Math.sin(angle),
          lng: userLocation!.lng + radius * Math.cos(angle),
        };

        // Create marker
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: mechanic.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: mechanic.status === "available" ? "#22c55e" : "#94a3b8",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${mechanic.name}</h3>
              <p>${mechanic.status === "available" ? "Available Now" : "Currently Busy"}</p>
              <p>${mechanic.distance} away</p>
              <p style="font-size: 0.8rem; margin-top: 5px;">
                <span style="font-weight: bold;">Specialties:</span> ${mechanic.specialties.join(", ")}
              </p>
            </div>
          `,
        });

        // Add click event
        marker.addListener("click", () => {
          // Close any open info windows
          markersRef.current.forEach((m) => {
            const infoWindow = m.get("infoWindow");
            if (infoWindow) infoWindow.close();
          });

          // Open this info window
          infoWindow.open(googleMapRef.current, marker);

          // Select this mechanic
          handleMechanicSelect(mechanic);
        });

        // Store info window with marker
        marker.set("infoWindow", infoWindow);

        // Add to markers array
        markersRef.current.push(marker);
      });
    }
  }, [userLocation, filteredMechanics, handleMechanicSelect]);

  // Apply filters
  useEffect(() => {
    let filtered = [...defaultMechanics];

    // Filter by status
    if (filters.statusFilter !== "all") {
      filtered = filtered.filter(
        (mechanic) => mechanic.status === filters.statusFilter,
      );
    }

    // Filter by specialty
    if (filters.specialtyFilter.length > 0) {
      filtered = filtered.filter((mechanic) =>
        mechanic.specialties.some((specialty) =>
          filters.specialtyFilter.includes(specialty),
        ),
      );
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (mechanic) => mechanic.rating >= filters.minRating,
      );
    }

    // Filter by distance
    if (filters.maxDistance < 10) {
      filtered = filtered.filter((mechanic) => {
        const distanceValue = parseFloat(mechanic.distance.split(" ")[0]);
        return distanceValue <= filters.maxDistance;
      });
    }

    setFilteredMechanics(filtered);

    // Track filter application
    trackEvent({
      category: "Map",
      action: "Apply Filters",
      label: `Filters Applied: ${filtered.length} results`,
      value: filtered.length,
    });
  }, [filters]); // Only depend on the filters prop

  // Get all unique specialties for filter
  const allSpecialties = Array.from(
    new Set(defaultMechanics.flatMap((mechanic) => mechanic.specialties)),
  );

  // Handle specialty filter change
  const toggleSpecialtyFilter = (specialty: string) => {
    if (specialtyFilter.includes(specialty)) {
      setSpecialtyFilter(specialtyFilter.filter((s) => s !== specialty));
    } else {
      setSpecialtyFilter([...specialtyFilter, specialty]);
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setSpecialtyFilter([]);
    setMinRating(0);
    setMaxDistance(10);
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p>{loadingMessage}</p>
          </div>
        </div>
      )}
      {locationError && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center text-red-600 max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <MapPin className="h-12 w-12 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900">Map Error</h3>
              <p className="mb-2">{locationError}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-2"
                variant="default"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full">
        {/* Map container */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />

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
            filteredCount={filteredMechanics.length}
            resetFilters={resetFilters}
          />
        </div>

        {/* Mechanic list (desktop only) */}
        <div className="hidden md:block w-[300px] bg-white shadow-lg overflow-auto">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-lg">Nearby Mechanics</h3>
          </div>
          <MechanicList
            mechanics={filteredMechanics}
            selectedMechanic={selectedMechanic}
            onMechanicSelect={handleMechanicSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;
