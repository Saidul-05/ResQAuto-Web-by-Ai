import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoidGVtcG9sYWJzIiwiYSI6ImNscjRwbDNvbzBjemwyam1qY3N2ZnVxY2kifQ.t6SLPGtbGwLtGcqXmxoLzA";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MapPin, Clock, Star, Phone } from "lucide-react";

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

  const handleMechanicSelect = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    onMechanicSelect(mechanic);
  };

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const mechanicMarkers = useRef<mapboxgl.Marker[]>([]);

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);
        setIsLoading(false);
      },
      (error) => {
        setLocationError("Unable to get your location");
        setIsLoading(false);
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true },
    );
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation,
      zoom: 13,
    });

    // Add user marker
    userMarker.current = new mapboxgl.Marker({ color: "#ff0000" })
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML("<h3>You are here</h3>"))
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      mechanicMarkers.current.forEach((marker) => marker.remove());
      userMarker.current?.remove();
      map.current?.remove();
    };
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

  // Add mechanic markers
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Clear existing markers
    mechanicMarkers.current.forEach((marker) => marker.remove());
    mechanicMarkers.current = [];

    // Add new markers for mechanics
    mechanics.forEach((mechanic) => {
      const el = document.createElement("div");
      el.className = "mechanic-marker";
      el.style.backgroundColor =
        mechanic.status === "available" ? "#22c55e" : "#94a3b8";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";

      // Calculate a random position near the user for demo purposes
      const offset = Math.random() * 0.01 - 0.005;
      const mechanicLocation: [number, number] = [
        userLocation[0] + offset,
        userLocation[1] + offset,
      ];

      const marker = new mapboxgl.Marker(el)
        .setLngLat(mechanicLocation)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${mechanic.name}</h3><p>${mechanic.status}</p>`,
          ),
        )
        .addTo(map.current);

      mechanicMarkers.current.push(marker);
    });
  }, [mechanics, userLocation]);

  return (
    <div className="w-full h-[600px] bg-gray-100 p-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
            <p>Loading map...</p>
          </div>
        </div>
      )}
      {locationError && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{locationError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full h-full bg-white rounded-lg shadow-lg relative overflow-hidden"
      >
        <div className="absolute right-4 top-4 space-y-4 z-10">
          {mechanics.map((mechanic) => (
            <Card
              key={mechanic.id}
              className={`p-4 w-[300px] cursor-pointer transition-all ${selectedMechanic?.id === mechanic.id ? "border-primary" : ""}`}
              onClick={() => handleMechanicSelect(mechanic)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{mechanic.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{mechanic.rating}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    mechanic.status === "available" ? "default" : "secondary"
                  }
                >
                  {mechanic.status}
                </Badge>
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{mechanic.distance}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Est. arrival: 10-15 mins</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {mechanic.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        {mechanic.phone}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  onClick={() => handleMechanicSelect(mechanic)}
                  disabled={mechanic.status === "busy"}
                >
                  Select
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssistanceMap;
