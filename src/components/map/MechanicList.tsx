import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Mechanic {
  id: string;
  name: string;
  rating: number;
  distance: string;
  status: "available" | "busy";
  specialties: string[];
  phone: string;
}

interface MechanicListProps {
  mechanics: Mechanic[];
  selectedMechanic: Mechanic | null;
  onMechanicSelect: (mechanic: Mechanic) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const MechanicList = ({
  mechanics,
  selectedMechanic,
  onMechanicSelect,
  isMobile = false,
  onClose,
}: MechanicListProps) => {
  const handleMechanicSelect = (mechanic: Mechanic) => {
    onMechanicSelect(mechanic);
    if (isMobile && onClose) {
      onClose();
    }

    // Track mechanic selection in analytics
    try {
      import("@/components/analytics/AnalyticsTracker").then(
        ({ trackEvent }) => {
          trackEvent({
            category: "Mechanic",
            action: "Select",
            label: `${mechanic.name} (${mechanic.status})`,
            value: 1,
          });
        },
      );
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  return (
    <ScrollArea className={isMobile ? "h-[calc(100vh-64px)]" : "max-h-[500px]"}>
      <div className={`p-4 space-y-4 ${isMobile ? "" : "pr-2"}`}>
        {mechanics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No mechanics found matching your filters.</p>
          </div>
        ) : (
          mechanics.map((mechanic) => (
            <Card
              key={mechanic.id}
              className={`p-3 cursor-pointer transition-all ${selectedMechanic?.id === mechanic.id ? "border-primary" : ""}`}
              onClick={() => handleMechanicSelect(mechanic)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-semibold ${isMobile ? "" : "text-lg"}`}>
                    {mechanic.name}
                  </h3>
                  <div
                    className={`flex items-center gap-1 ${isMobile ? "text-xs" : "text-sm"} text-gray-600`}
                  >
                    <Star
                      className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-yellow-500`}
                    />
                    <span>{mechanic.rating}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    mechanic.status === "available" ? "default" : "secondary"
                  }
                  className={isMobile ? "text-xs" : ""}
                >
                  {mechanic.status}
                </Badge>
              </div>

              <div className={`mt-2 space-y-${isMobile ? "1" : "2"}`}>
                <div
                  className={`flex items-center gap-${isMobile ? "1" : "2"} ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  <MapPin className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                  <span>{mechanic.distance}</span>
                </div>
                <div
                  className={`flex items-center gap-${isMobile ? "1" : "2"} ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  <Clock className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                  <span>Est. arrival: 10-15 mins</span>
                </div>
              </div>

              <div
                className={`mt-${isMobile ? "2" : "3"} flex flex-wrap gap-${isMobile ? "1" : "2"}`}
              >
                {mechanic.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className={isMobile ? "text-xs py-0" : ""}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div
                className={`mt-${isMobile ? "3" : "4"} flex justify-between items-center`}
              >
                {isMobile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();

                      // Track call mechanic action
                      try {
                        import("@/components/analytics/AnalyticsTracker").then(
                          ({ trackEvent }) => {
                            trackEvent({
                              category: "Mechanic",
                              action: "Call",
                              label: mechanic.name,
                              value: 1,
                            });
                          },
                        );
                      } catch (error) {
                        console.error("Analytics error:", error);
                      }

                      window.location.href = `tel:${mechanic.phone.replace(/[^0-9]/g, "")}`;
                    }}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();

                            // Track call mechanic action
                            try {
                              import(
                                "@/components/analytics/AnalyticsTracker"
                              ).then(({ trackEvent }) => {
                                trackEvent({
                                  category: "Mechanic",
                                  action: "Call",
                                  label: mechanic.name,
                                  value: 1,
                                });
                              });
                            } catch (error) {
                              console.error("Analytics error:", error);
                            }

                            window.location.href = `tel:${mechanic.phone.replace(/[^0-9]/g, "")}`;
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {mechanic.phone}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to call</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  size="sm"
                  className={isMobile ? "text-xs h-8" : ""}
                  onClick={() => handleMechanicSelect(mechanic)}
                  disabled={mechanic.status === "busy"}
                >
                  Select
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default MechanicList;
