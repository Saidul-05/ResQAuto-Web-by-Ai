import React, { createContext, useContext, useState, useEffect } from "react";

type MapProvider = "mapbox" | "google" | "leaflet" | "none";

interface FeatureContextType {
  mapProvider: MapProvider;
  setMapProvider: (provider: MapProvider) => void;
  features: Record<string, boolean>;
  toggleFeature: (featureId: string) => void;
  setFeatureEnabled: (featureId: string, enabled: boolean) => void;
}

const defaultFeatures = {
  "map-mapbox": true,
  "map-google": false,
  "map-leaflet": false,
  "emergency-form": true,
  "mechanic-list": true,
  "real-time-tracking": true,
  testimonials: true,
  "how-it-works": true,
  "contact-form": true,
};

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [features, setFeatures] =
    useState<Record<string, boolean>>(defaultFeatures);
  const [mapProvider, setMapProvider] = useState<MapProvider>("mapbox");

  // Load features from localStorage on mount
  useEffect(() => {
    const savedFeatures = localStorage.getItem("resq-features");
    if (savedFeatures) {
      try {
        const parsedFeatures = JSON.parse(savedFeatures);
        setFeatures(parsedFeatures);

        // Set map provider based on saved features
        if (parsedFeatures["map-mapbox"]) {
          setMapProvider("mapbox");
        } else if (parsedFeatures["map-google"]) {
          setMapProvider("google");
        } else if (parsedFeatures["map-leaflet"]) {
          setMapProvider("leaflet");
        } else {
          setMapProvider("none");
        }
      } catch (error) {
        console.error("Error parsing saved features:", error);
      }
    }
  }, []);

  // Save features to localStorage when they change
  useEffect(() => {
    localStorage.setItem("resq-features", JSON.stringify(features));
  }, [features]);

  const toggleFeature = (featureId: string) => {
    setFeatures((prev) => ({
      ...prev,
      [featureId]: !prev[featureId],
    }));

    // Handle map provider toggles
    if (featureId.startsWith("map-")) {
      const newProvider = featureId.replace("map-", "") as MapProvider;

      // Only set if enabling a provider
      if (!features[featureId]) {
        setMapProvider(newProvider);

        // Disable other map providers
        const updatedFeatures = { ...features };
        Object.keys(features).forEach((key) => {
          if (key.startsWith("map-") && key !== featureId) {
            updatedFeatures[key] = false;
          }
        });
        setFeatures(updatedFeatures);
      } else {
        // If disabling the current provider, set to none
        setMapProvider("none");
      }
    }
  };

  const setFeatureEnabled = (featureId: string, enabled: boolean) => {
    setFeatures((prev) => ({
      ...prev,
      [featureId]: enabled,
    }));

    // Handle map provider changes
    if (featureId.startsWith("map-") && enabled) {
      const newProvider = featureId.replace("map-", "") as MapProvider;
      setMapProvider(newProvider);

      // Disable other map providers
      const updatedFeatures = { ...features };
      Object.keys(features).forEach((key) => {
        if (key.startsWith("map-") && key !== featureId) {
          updatedFeatures[key] = false;
        }
      });
      setFeatures(updatedFeatures);
    }
  };

  return (
    <FeatureContext.Provider
      value={{
        mapProvider,
        setMapProvider,
        features,
        toggleFeature,
        setFeatureEnabled,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
};
