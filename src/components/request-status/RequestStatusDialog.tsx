import React, { useState, useEffect } from "react";
import { EmergencyRequest } from "@/types/schema";
import { emergencyService } from "@/lib/emergency-service";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RequestTracker from "../request-tracking/RequestTracker";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

interface RequestStatusDialogProps {
  request: EmergencyRequest;
  onClose: () => void;
}

const RequestStatusDialog: React.FC<RequestStatusDialogProps> = ({
  request,
  onClose,
}) => {
  const [currentRequest, setCurrentRequest] =
    useState<EmergencyRequest>(request);
  const [open, setOpen] = useState(true);
  const { toast } = useToast();

  // Subscribe to request status updates
  useEffect(() => {
    const subscription = emergencyService.subscribeToRequestStatus(
      request.id,
      (updatedRequest) => {
        setCurrentRequest(updatedRequest);

        // Show toast notifications for status changes
        if (updatedRequest.status !== currentRequest.status) {
          const statusMessages: Record<string, string> = {
            matched: "A mechanic has been assigned to your request",
            en_route: "Your mechanic is on the way",
            arrived: "Your mechanic has arrived at your location",
            completed: "Your service has been completed",
            cancelled: "Your request has been cancelled",
          };

          if (statusMessages[updatedRequest.status]) {
            toast({
              title: "Request Update",
              description: statusMessages[updatedRequest.status],
              variant:
                updatedRequest.status === "cancelled"
                  ? "destructive"
                  : "default",
            });
          }

          // Track status change
          trackEvent({
            category: "Request",
            action: "Status Change",
            label: updatedRequest.status,
            value: 1,
          });
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [request.id, currentRequest.status, toast]);

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  // Handle request cancellation
  const handleCancelRequest = async () => {
    try {
      // In a real app, this would call an API endpoint
      // await emergencyService.cancelRequest(request.id);

      // For demo, we'll just update the local state
      setCurrentRequest({
        ...currentRequest,
        status: "cancelled",
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Request Cancelled",
        description: "Your emergency request has been cancelled successfully.",
        variant: "destructive",
      });

      // Track cancellation
      trackEvent({
        category: "Request",
        action: "Cancel",
        label: currentRequest.status,
        value: 0,
      });
    } catch (error) {
      console.error("Failed to cancel request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle review submission
  const handleReviewSubmit = (rating: number, review: string) => {
    // In a real app, this would call an API endpoint
    // await emergencyService.submitReview(request.id, rating, review);

    // For demo, we'll just update the local state
    setCurrentRequest({
      ...currentRequest,
      rating,
      review,
      updated_at: new Date().toISOString(),
    });

    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });

    // Track review submission
    trackEvent({
      category: "Review",
      action: "Submit",
      label: `Rating: ${rating}`,
      value: rating,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[500px] p-0 dark:bg-gray-800"
        hideClose
      >
        <RequestTracker
          requestId={currentRequest.id}
          status={currentRequest.status as any}
          mechanicName={
            currentRequest.mechanic_id ? "John Smith" : "Assigned Mechanic"
          }
          mechanicPhone="(555) 123-4567"
          estimatedArrival={
            currentRequest.status === "completed"
              ? "Completed"
              : "10-15 minutes"
          }
          location={currentRequest.location}
          onCancel={handleCancelRequest}
          onReviewSubmit={handleReviewSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RequestStatusDialog;
