import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { emergencyService } from "@/lib/emergency-service";

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoidGVtcG9sYWJzIiwiYSI6ImNscjRwbDNvbzBjemwyam1qY3N2ZnVxY2kifQ.t6SLPGtbGwLtGcqXmxoLzA";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import MechanicList from "./MechanicList";
import FilterControls from "./FilterControls";

interface Mechanic {
  id: string;
  name: string;
  rating: number;
  distance: string;
  status: "available" | "busy";
  specialties: string[];
  phone: string;
}

interface AssistanceMapProps {
  mechanics?: Mechanic[];
  onMechanicSelect?: (mechanic: Mechanic) => void;
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

const AssistanceMap = ({
  mechanics = defaultMechanics,
  onMechanicSelect = () => {},
}: AssistanceMapProps) => {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading map...");
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [filteredMechanics, setFilteredMechanics] =
    useState<Mechanic[]>(mechanics);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10); // in miles

  const handleMechanicSelect = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    onMechanicSelect(mechanic);

    // Track mechanic selection in analytics
    try {
      import("@/components/analytics/AnalyticsTracker").then(
        ({ trackMechanicSelection }) => {
          trackMechanicSelection({
            mechanicId: mechanic.id,
            mechanicName: mechanic.name,
            distance: mechanic.distance,
            rating: mechanic.rating,
          });
        },
      );
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const mechanicMarkers = useRef<mapboxgl.Marker[]>([]);

  // Check if mobile device and handle responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      // Auto-close the mechanic list on mobile when resizing to desktop
      if (!isMobileView && isMobileListOpen) {
        setIsMobileListOpen(false);
      }

      // Adjust map container height for better mobile experience
      if (mapContainer.current) {
        if (isMobileView) {
          mapContainer.current.style.height = "calc(100vh - 200px)";
        } else {
          mapContainer.current.style.height = "100%";
        }
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [isMobileListOpen]);

  // Apply filters
  useEffect(() => {
    let filtered = [...mechanics];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (mechanic) => mechanic.status === statusFilter,
      );
    }

    // Filter by specialty
    if (specialtyFilter.length > 0) {
      filtered = filtered.filter((mechanic) =>
        mechanic.specialties.some((specialty) =>
          specialtyFilter.includes(specialty),
        ),
      );
    }

    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter((mechanic) => mechanic.rating >= minRating);
    }

    // Filter by distance (simplified for demo)
    if (maxDistance < 10) {
      filtered = filtered.filter((mechanic) => {
        // Extract numeric value from distance string (e.g., "0.5 miles" -> 0.5)
        const distanceValue = parseFloat(mechanic.distance.split(" ")[0]);
        return distanceValue <= maxDistance;
      });
    }

    setFilteredMechanics(filtered);
  }, [mechanics, statusFilter, specialtyFilter, minRating, maxDistance]);

  // Get user's location with enhanced error handling and analytics tracking
  useEffect(() => {
    setLoadingMessage("Detecting your location...");
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser. Please use a modern browser with location services.",
      );
      setIsLoading(false);

      // Track geolocation not supported error
      try {
        import("@/components/analytics/AnalyticsTracker").then(
          ({ trackEvent }) => {
            trackEvent({
              category: "Map",
              action: "Location Error",
              label: "Geolocation Not Supported",
              value: 0,
            });
          },
        );
      } catch (error) {
        console.error("Analytics error:", error);
      }
      return;
    }

    // Set a timeout to handle slow location requests
    const locationTimeout = setTimeout(() => {
      if (isLoading) {
        setLocationError(
          "Location request timed out. Please check your device settings and try again.",
        );
        setIsLoading(false);

        // Track location timeout error
        try {
          import("@/components/analytics/AnalyticsTracker").then(
            ({ trackEvent }) => {
              trackEvent({
                category: "Map",
                action: "Location Error",
                label: "Timeout",
                value: 0,
              });
            },
          );
        } catch (error) {
          console.error("Analytics error:", error);
        }
      }
    }, 10000); // 10 second timeout

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(locationTimeout);
          const { latitude, longitude } = position.coords;
          setLoadingMessage("Initializing map...");
          setUserLocation([longitude, latitude]);

          // Add a small delay to show the loading message
          setTimeout(() => {
            setIsLoading(false);
          }, 500);

          // Track successful location acquisition
          try {
            import("@/components/analytics/AnalyticsTracker").then(
              ({ trackEvent }) => {
                trackEvent({
                  category: "Map",
                  action: "Location Detected",
                  label: "Success",
                  value: 1,
                });
              },
            );
          } catch (error) {
            console.error("Analytics error:", error);
          }

          // Log successful location acquisition for debugging
          console.log("Location acquired successfully", {
            latitude,
            longitude,
          });
        },
        (error) => {
          clearTimeout(locationTimeout);
          let errorMessage = "Unable to get your location";
          let errorLabel = "Unknown";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access was denied. Please enable location services in your browser settings and refresh the page.";
              errorLabel = "Permission Denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is unavailable. Please check your device's GPS or network connection and try again.";
              errorLabel = "Position Unavailable";
              break;
            case error.TIMEOUT:
              errorMessage =
                "Location request timed out. Please try again or use the 'Use Default Location' option.";
              errorLabel = "Timeout";
              break;
            default:
              errorMessage = `Location error: ${error.message || "Unknown error"}. Please try again.`;
              errorLabel = "Other";
          }

          setLocationError(errorMessage);
          setIsLoading(false);
          console.error("Geolocation error:", error);

          // Track location error
          try {
            import("@/components/analytics/AnalyticsTracker").then(
              ({ trackEvent }) => {
                trackEvent({
                  category: "Map",
                  action: "Location Error",
                  label: errorLabel,
                  value: 0,
                });
              },
            );
          } catch (error) {
            console.error("Analytics error:", error);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } catch (e) {
      clearTimeout(locationTimeout);
      console.error("Unexpected error getting location:", e);
      setLocationError(
        "An unexpected error occurred while trying to get your location. Please refresh the page and try again.",
      );
      setIsLoading(false);

      // Track unexpected location error
      try {
        import("@/components/analytics/AnalyticsTracker").then(
          ({ trackEvent }) => {
            trackEvent({
              category: "Map",
              action: "Location Error",
              label: "Unexpected Error",
              value: 0,
            });
          },
        );
      } catch (error) {
        console.error("Analytics error:", error);
      }
    }

    return () => clearTimeout(locationTimeout);
  }, [isLoading]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    setLoadingMessage("Loading map data...");

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation,
        zoom: 13,
      });

      // Add error handling for map load
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setLocationError(
          "Failed to load map. Please check your internet connection and try again.",
        );
      });

      // Add load event handler
      map.current.on("load", () => {
        setLoadingMessage("Adding markers...");
        // Add user marker once map is loaded
        try {
          userMarker.current = new mapboxgl.Marker({ color: "#ff0000" })
            .setLngLat(userLocation)
            .setPopup(new mapboxgl.Popup().setHTML("<h3>You are here</h3>"))
            .addTo(map.current);

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl());
        } catch (error) {
          console.error("Error adding markers or controls:", error);
          setLocationError(
            "Error displaying map elements. Please try refreshing the page.",
          );
        }
      });

      return () => {
        try {
          mechanicMarkers.current.forEach((marker) => marker.remove());
          userMarker.current?.remove();
          map.current?.remove();
        } catch (error) {
          console.error("Error cleaning up map resources:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setLocationError(
        "Failed to initialize map. Please try refreshing the page.",
      );
      return () => {};
    }
  }, [userLocation]);

  // Subscribe to mechanic location updates
  useEffect(() => {
    if (!userLocation) return;

    const subscription = emergencyService.subscribeMechanicLocations(
      mechanics.map((m) => m.id),
      (updatedMechanic) => {
        const index = mechanics.findIndex((m) => m.id === updatedMechanic.id);
        if (index !== -1) {
          const updatedMechanics = [...mechanics];
          updatedMechanics[index] = updatedMechanic;
          // Update marker position
          if (mechanicMarkers.current[index]) {
            mechanicMarkers.current[index].setLngLat(
              updatedMechanic.current_location,
            );
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [mechanics, userLocation]);

  // Add mechanic markers with improved functionality and animations
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Make sure map is fully loaded before adding markers
    if (!map.current.loaded()) {
      map.current.once("load", () => {
        addMechanicMarkers();
      });
    } else {
      addMechanicMarkers();
    }

    function addMechanicMarkers() {
      try {
        // Clear existing markers
        mechanicMarkers.current.forEach((marker) => marker.remove());
        mechanicMarkers.current = [];

        // Add new markers for mechanics
        filteredMechanics.forEach((mechanic, index) => {
          try {
            // Create custom marker element with pulse animation for available mechanics
            const el = document.createElement("div");
            el.className = "mechanic-marker";
            el.style.backgroundColor =
              mechanic.status === "available" ? "#22c55e" : "#94a3b8";
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.borderRadius = "50%";
            el.style.border = "2px solid white";
            el.style.cursor = "pointer";
            el.style.boxShadow = "0 0 0 rgba(34, 197, 94, 0.4)";

            // Add pulse animation for available mechanics
            if (mechanic.status === "available") {
              el.style.animation = "pulse 2s infinite";
              // Add CSS for pulse animation if not already in the document
              if (!document.getElementById("pulse-animation")) {
                const style = document.createElement("style");
                style.id = "pulse-animation";
                style.innerHTML = `
                  @keyframes pulse {
                    0% {
                      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
                    }
                    70% {
                      box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
                    }
                    100% {
                      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
                    }
                  }
                `;
                document.head.appendChild(style);
              }
            }

            // Calculate a realistic position near the user for demo purposes
            // Use a spiral pattern to distribute mechanics around the user
            const angle = index * 137.5 * (Math.PI / 180); // Golden angle in radians
            const radius = 0.002 + index * 0.0005; // Increasing radius for spiral
            const mechanicLocation: [number, number] = [
              userLocation[0] + radius * Math.cos(angle),
              userLocation[1] + radius * Math.sin(angle),
            ];

            // Create popup with enhanced styling and information
            const popup = new mapboxgl.Popup({
              offset: 25,
              closeButton: false,
            }).setHTML(
              `<div class="p-3 max-w-xs">
                  <h3 class="font-bold text-base mb-1">${mechanic.name}</h3>
                  <div class="flex items-center mb-1">
                    <span class="inline-block w-2 h-2 rounded-full ${mechanic.status === "available" ? "bg-green-500" : "bg-gray-400"} mr-2"></span>
                    <p class="text-sm">${mechanic.status === "available" ? "Available Now" : "Currently Busy"}</p>
                  </div>
                  <p class="text-sm mb-1">${mechanic.distance} away</p>
                  <div class="mt-2 text-xs">
                    <span class="font-medium">Specialties:</span> ${mechanic.specialties.join(", ")}
                  </div>
                  <div class="mt-2 text-xs flex items-center">
                    <span class="font-medium mr-1">Rating:</span>
                    <span class="text-yellow-500">${"★".repeat(Math.floor(mechanic.rating))}</span>
                    <span class="text-gray-300">${"★".repeat(5 - Math.floor(mechanic.rating))}</span>
                    <span class="ml-1">(${mechanic.rating})</span>
                  </div>
                  <div class="mt-2 pt-2 border-t border-gray-100 text-center">
                    <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">Select Mechanic</button>
                  </div>
                </div>`,
            );

            // Create and add the marker to the map
            const marker = new mapboxgl.Marker(el)
              .setLngLat(mechanicLocation)
              .setPopup(popup)
              .addTo(map.current);

            // Add click event to marker with analytics tracking
            el.addEventListener("click", () => {
              // Track marker click in analytics
              try {
                import("@/components/analytics/AnalyticsTracker").then(
                  ({ trackEvent }) => {
                    trackEvent({
                      category: "Map",
                      action: "Mechanic Marker Click",
                      label: mechanic.name,
                      value: 1,
                    });
                  },
                );
              } catch (error) {
                console.error("Analytics error:", error);
              }

              // Select the mechanic
              handleMechanicSelect(mechanic);

              // Fly to the mechanic location with animation
              map.current?.flyTo({
                center: mechanicLocation,
                zoom: 14,
                speed: 1.2,
                curve: 1.42,
                essential: true,
              });
            });

            // Add popup open event listener for analytics
            popup.on("open", () => {
              try {
                import("@/components/analytics/AnalyticsTracker").then(
                  ({ trackEvent }) => {
                    trackEvent({
                      category: "Map",
                      action: "Mechanic Popup Open",
                      label: mechanic.name,
                      value: 1,
                    });
                  },
                );
              } catch (error) {
                console.error("Analytics error:", error);
              }
            });

            mechanicMarkers.current.push(marker);
          } catch (error) {
            console.error("Error adding mechanic marker:", error);
          }
        });
      } catch (error) {
        console.error("Error managing mechanic markers:", error);
        setLocationError(
          "Error displaying mechanics on the map. Please try refreshing the page.",
        );
      }
    }
  }, [filteredMechanics, userLocation, handleMechanicSelect]);

  // Get all unique specialties for filter
  const allSpecialties = Array.from(
    new Set(mechanics.flatMap((mechanic) => mechanic.specialties)),
  );

  // Handle specialty filter change
  const toggleSpecialtyFilter = (specialty: string) => {
    if (specialtyFilter.includes(specialty)) {
      setSpecialtyFilter(specialtyFilter.filter((s) => s !== specialty));
    } else {
      setSpecialtyFilter([...specialtyFilter, specialty]);
    }
  };

  return (
    <div className="w-full h-[600px] bg-gray-100 p-4 relative">
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
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setLocationError("");
                    setIsLoading(true);
                    setTimeout(() => window.location.reload(), 500);
                  }}
                  className="mt-2"
                  variant="default"
                >
                  Retry
                </Button>
                <Button
                  onClick={() => {
                    // Fallback to default location (New York City)
                    setUserLocation([-74.006, 40.7128]);
                    setLocationError("");
                  }}
                  className="mt-2"
                  variant="outline"
                >
                  Use Default Location
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                If the problem persists, please check your internet connection
                and location settings.
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full h-full bg-white rounded-lg shadow-lg relative overflow-hidden"
      >
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
          resetFilters={() => {
            setStatusFilter("all");
            setSpecialtyFilter([]);
            setMinRating(0);
            setMaxDistance(10);
          }}
        />

        {/* Desktop mechanic cards */}
        <div className="absolute right-4 top-4 space-y-4 z-10 hidden md:block w-[300px] bg-white/90 rounded-lg shadow-lg">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-lg">Nearby Mechanics</h3>
          </div>
          <MechanicList
            mechanics={filteredMechanics}
            selectedMechanic={selectedMechanic}
            onMechanicSelect={handleMechanicSelect}
          />
        </div>

        {/* Mobile toggle button */}
        <div className="absolute bottom-4 right-4 z-10 md:hidden">
          <Button
            onClick={() => setIsMobileListOpen(!isMobileListOpen)}
            className="rounded-full h-12 w-12 shadow-lg"
            variant="default"
          >
            {isMobileListOpen ? (
              <ChevronRight className="h-6 w-6" />
            ) : (
              <ChevronLeft className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile mechanic list */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-[320px] bg-white shadow-xl z-20 transition-transform duration-300 md:hidden ${isMobileListOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Nearby Mechanics</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileListOpen(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <MechanicList
            mechanics={filteredMechanics}
            selectedMechanic={selectedMechanic}
            onMechanicSelect={handleMechanicSelect}
            isMobile={true}
            onClose={() => setIsMobileListOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default AssistanceMap;
