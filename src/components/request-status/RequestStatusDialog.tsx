import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmergencyRequest } from "@/types/schema";
import { emergencyService } from "@/lib/emergency-service";
import { Clock, CheckCircle, XCircle, Car, MapPin } from "lucide-react";

interface RequestStatusDialogProps {
  request: EmergencyRequest;
  onClose: () => void;
}

const statusSteps = {
  pending: 0,
  matched: 25,
  en_route: 50,
  arrived: 75,
  completed: 100,
};

const statusMessages = {
  pending: "Looking for nearby mechanics...",
  matched: "Mechanic found and confirmed",
  en_route: "Mechanic is on the way",
  arrived: "Mechanic has arrived",
  completed: "Service completed",
  cancelled: "Request cancelled",
};

const RequestStatusDialog = ({
  request,
  onClose,
}: RequestStatusDialogProps) => {
  const [currentRequest, setCurrentRequest] = useState(request);

  useEffect(() => {
    const subscription = emergencyService.subscribeToRequestStatus(
      request.id,
      (updatedRequest) => {
        setCurrentRequest(updatedRequest);
        if (
          updatedRequest.status === "completed" ||
          updatedRequest.status === "cancelled"
        ) {
          setTimeout(onClose, 3000);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [request.id, onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Emergency Request Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Progress
            value={
              statusSteps[currentRequest.status as keyof typeof statusSteps] ??
              0
            }
            className="h-2"
          />

          <div className="flex items-center gap-3">
            {currentRequest.status === "cancelled" ? (
              <XCircle className="h-8 w-8 text-destructive" />
            ) : currentRequest.status === "completed" ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
            )}
            <div>
              <h3 className="font-semibold">
                {statusMessages[currentRequest.status]}
              </h3>
              <p className="text-sm text-muted-foreground">
                Request ID: {currentRequest.id}
              </p>
            </div>
          </div>

          {currentRequest.mechanic_id && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5" />
                <div>
                  <p className="font-medium">Mechanic Details</p>
                  <p className="text-sm text-muted-foreground">
                    John Smith • (555) 123-4567
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <p className="text-sm">Estimated arrival: 10-15 minutes</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={["pending", "matched", "en_route"].includes(
                currentRequest.status,
              )}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestStatusDialog;
