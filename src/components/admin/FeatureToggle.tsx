import React, { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Map } from "lucide-react";
import { useFeatures } from "@/contexts/FeatureContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  section:
    | "hero"
    | "map"
    | "emergency"
    | "how-it-works"
    | "testimonials"
    | "other";
}

const FeatureToggle = () => {
  const {
    features: contextFeatures,
    toggleFeature,
    setFeatureEnabled,
    mapProvider,
    setMapProvider,
  } = useFeatures();
  const [selectedMapProvider, setSelectedMapProvider] =
    useState<string>(mapProvider);

  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "hero",
      name: "Hero Section",
      description: "Main landing section with background video and CTA buttons",
      enabled: true,
      section: "hero",
    },
    {
      id: "map",
      name: "Interactive Map",
      description: "Real-time map showing available mechanics in the area",
      enabled: true,
      section: "map",
    },
    {
      id: "emergency-form",
      name: "Emergency Request Form",
      description: "Quick form for requesting immediate assistance",
      enabled: true,
      section: "emergency",
    },
    {
      id: "how-it-works",
      name: "How It Works Section",
      description: "Step-by-step guide explaining the service process",
      enabled: true,
      section: "how-it-works",
    },
    {
      id: "testimonials",
      name: "Testimonials Carousel",
      description: "Customer reviews and ratings carousel",
      enabled: true,
      section: "testimonials",
    },
    {
      id: "mechanic-cards",
      name: "Mechanic Cards",
      description: "Cards showing mechanic details on the map",
      enabled: true,
      section: "map",
    },
    {
      id: "emergency-call",
      name: "Emergency Call Button",
      description: "Direct call button for immediate phone assistance",
      enabled: true,
      section: "emergency",
    },
    {
      id: "service-filters",
      name: "Service Type Filters",
      description: "Filter mechanics by service type",
      enabled: false,
      section: "map",
    },
    {
      id: "animation",
      name: "UI Animations",
      description: "Framer Motion animations throughout the site",
      enabled: true,
      section: "other",
    },
  ]);

  // Initialize map provider from context
  useEffect(() => {
    setSelectedMapProvider(mapProvider);
  }, [mapProvider]);

  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (id: string) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature,
      ),
    );
    setHasChanges(true);

    // Track feature toggle
    trackEvent({
      category: "Admin",
      action: "Toggle Feature",
      label: id,
      value: features.find((f) => f.id === id)?.enabled ? 0 : 1,
    });
  };

  const handleMapProviderChange = (provider: string) => {
    setSelectedMapProvider(provider);
    setHasChanges(true);

    // Track map provider change
    trackEvent({
      category: "Admin",
      action: "Change Map Provider",
      label: provider,
      value: 1,
    });
  };

  const saveChanges = () => {
    // Save regular features
    features.forEach((feature) => {
      // Map to context feature IDs if needed
      const contextId = feature.id;
      if (contextFeatures.hasOwnProperty(contextId)) {
        setFeatureEnabled(contextId, feature.enabled);
      }
    });

    // Save map provider selection
    setMapProvider(selectedMapProvider as any);

    console.log("Saving feature configuration:", features);
    console.log("Selected map provider:", selectedMapProvider);

    // Track save action
    trackEvent({
      category: "Admin",
      action: "Save Features",
      label: `Map Provider: ${selectedMapProvider}`,
      value: 1,
    });

    setHasChanges(false);
  };

  const sections = [
    { id: "hero", name: "Hero Section" },
    { id: "map", name: "Map & Location" },
    { id: "emergency", name: "Emergency Services" },
    { id: "how-it-works", name: "How It Works" },
    { id: "testimonials", name: "Testimonials" },
    { id: "other", name: "Other Features" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feature Management</h2>
        <Button
          onClick={saveChanges}
          disabled={!hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <p className="text-muted-foreground">
        Enable or disable features on the ResQ Auto website. Changes will be
        applied immediately after saving.
      </p>

      {/* Map Provider Selection */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Map className="h-5 w-5" />
          Map Provider
        </h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Map Provider</CardTitle>
            <CardDescription>
              Choose which map provider to use for the interactive map
            </CardDescription>

            <div className="mt-4">
              <RadioGroup
                value={selectedMapProvider}
                onValueChange={handleMapProviderChange}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="mapbox" id="mapbox" />
                  <Label htmlFor="mapbox">Mapbox</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="google" id="google" />
                  <Label htmlFor="google">Google Maps</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="leaflet" id="leaflet" />
                  <Label htmlFor="leaflet">Leaflet (OpenStreetMap)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">None (Disable Map)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardHeader>
        </Card>
        <Separator className="my-6" />
      </div>

      {/* Other Feature Toggles */}
      {sections.map((section) => {
        const sectionFeatures = features.filter(
          (f) => f.section === section.id,
        );
        if (sectionFeatures.length === 0) return null;

        return (
          <div key={section.id} className="space-y-4">
            <h3 className="text-lg font-semibold">{section.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionFeatures.map((feature) => (
                <Card key={feature.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {feature.name}
                      </CardTitle>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => handleToggle(feature.id)}
                        id={`switch-${feature.id}`}
                      />
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <Separator className="my-6" />
          </div>
        );
      })}
    </div>
  );
};

export default FeatureToggle;
