import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Car, Phone } from "lucide-react";

interface RequestTrackerProps {
  requestId?: string;
  status?:
    | "pending"
    | "matched"
    | "en_route"
    | "arrived"
    | "completed"
    | "cancelled";
  mechanicName?: string;
  mechanicPhone?: string;
  estimatedArrival?: string;
  location?: string;
}

const RequestTracker = ({
  requestId = "REQ-12345",
  status = "en_route",
  mechanicName = "John Smith",
  mechanicPhone = "(555) 123-4567",
  estimatedArrival = "10-15 minutes",
  location = "Current Location",
}: RequestTrackerProps) => {
  const statusSteps = {
    pending: 0,
    matched: 25,
    en_route: 50,
    arrived: 75,
    completed: 100,
    cancelled: 0,
  };

  const statusMessages = {
    pending: "Looking for nearby mechanics...",
    matched: "Mechanic found and confirmed",
    en_route: "Mechanic is on the way",
    arrived: "Mechanic has arrived",
    completed: "Service completed",
    cancelled: "Request cancelled",
  };

  return (
    <Card className="w-full max-w-md p-6 bg-white shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Emergency Request</h3>
          <Badge variant={status === "cancelled" ? "destructive" : "default"}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
          </Badge>
        </div>

        <Progress value={statusSteps[status]} className="h-2" />

        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-blue-500" />
          <div>
            <p className="font-medium">{statusMessages[status]}</p>
            <p className="text-sm text-muted-foreground">
              Request ID: {requestId}
            </p>
          </div>
        </div>

        {status !== "pending" && status !== "cancelled" && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5" />
              <div>
                <p className="font-medium">Mechanic Details</p>
                <p className="text-sm text-muted-foreground">
                  {mechanicName} • {mechanicPhone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5" />
              <p className="text-sm">Estimated arrival: {estimatedArrival}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5" />
              <Button variant="outline" size="sm" className="text-sm">
                Call Mechanic
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            disabled={["pending", "matched", "en_route"].includes(status)}
          >
            {status === "completed" ? "Submit Review" : "Cancel Request"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RequestTracker;
