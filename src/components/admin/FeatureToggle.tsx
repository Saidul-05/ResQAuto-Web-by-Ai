import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

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

  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (id: string) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature,
      ),
    );
    setHasChanges(true);
  };

  const saveChanges = () => {
    // In a real app, this would save to a database
    console.log("Saving feature configuration:", features);
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
