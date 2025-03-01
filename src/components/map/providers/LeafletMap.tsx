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

interface LeafletMapProps {
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

const LeafletMap: React.FC<LeafletMapProps> = ({
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading map...");
  const [filteredMechanics, setFilteredMechanics] =
    useState<Mechanic[]>(defaultMechanics);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

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
        setUserLocation([latitude, longitude]);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError(
          "Unable to get your location. Using default location.",
        );
        // Default to New York City
        setUserLocation([40.7128, -74.006]);
        setIsLoading(false);
      },
    );
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!userLocation || !mapContainerRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = async () => {
      try {
        // Check if Leaflet is already loaded
        if (!window.L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.integrity =
              "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
            script.crossOrigin = "";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Leaflet"));
            document.head.appendChild(script);
          });
        }

        initializeMap();
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setLocationError("Failed to load map library. Please try again.");
      }
    };

    loadLeaflet();

    function initializeMap() {
      try {
        // Create map if it doesn't exist
        if (!mapRef.current) {
          mapRef.current = window.L.map(mapContainerRef.current).setView(
            userLocation,
            14,
          );

          // Add tile layer (OpenStreetMap)
          window.L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          ).addTo(mapRef.current);

          // Add user marker
          const userIcon = window.L.divIcon({
            className: "user-marker",
            html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          userMarkerRef.current = window.L.marker(userLocation, {
            icon: userIcon,
          })
            .addTo(mapRef.current)
            .bindPopup("Your Location");
        } else {
          // Update map view if it already exists
          mapRef.current.setView(userLocation, 14);

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(userLocation);
          }
        }

        // Add mechanic markers
        addMechanicMarkers();
      } catch (error) {
        console.error("Error initializing Leaflet map:", error);
        setLocationError("Failed to initialize map. Please try again.");
      }
    }

    function addMechanicMarkers() {
      if (!mapRef.current || !window.L) return;

      // Clear existing markers
      markersRef.current.forEach((marker) =>
        mapRef.current.removeLayer(marker),
      );
      markersRef.current = [];

      // Add markers for each mechanic
      filteredMechanics.forEach((mechanic, index) => {
        // Calculate position (spiral pattern around user)
        const angle = index * 137.5 * (Math.PI / 180);
        const radius = 0.002 + index * 0.0005;
        const position = [
          userLocation[0] + radius * Math.sin(angle),
          userLocation[1] + radius * Math.cos(angle),
        ];

        // Create custom icon
        const mechanicIcon = window.L.divIcon({
          className: "mechanic-marker",
          html: `<div style="background-color: ${mechanic.status === "available" ? "#22c55e" : "#94a3b8"}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Create marker
        const marker = window.L.marker(position as [number, number], {
          icon: mechanicIcon,
        }).addTo(mapRef.current).bindPopup(`
            <div style="min-width: 150px;">
              <h3 style="font-weight: bold; margin-bottom: 5px;">${mechanic.name}</h3>
              <p>${mechanic.status === "available" ? "Available Now" : "Currently Busy"}</p>
              <p>${mechanic.distance} away</p>
              <p style="font-size: 0.8rem; margin-top: 5px;">
                <span style="font-weight: bold;">Specialties:</span> ${mechanic.specialties.join(", ")}
              </p>
              <button style="background-color: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-top: 8px; cursor: pointer;">
                Select Mechanic
              </button>
            </div>
          `);

        // Add click event
        marker.on("click", () => {
          handleMechanicSelect(mechanic);
        });

        markersRef.current.push(marker);
      });
    }

    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
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
          <div ref={mapContainerRef} className="w-full h-full" />

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

export default LeafletMap;

// Add global type for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
