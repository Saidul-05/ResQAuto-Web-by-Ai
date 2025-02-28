import React, { useState, useEffect } from "react";
import { EmergencyRequest } from "@/types/schema";
import { emergencyService } from "@/lib/emergency-service";
import RequestTracker from "./RequestTracker";
import { useToast } from "@/components/ui/use-toast";

interface RequestServiceProps {
  initialRequest?: EmergencyRequest;
  selectedMechanic?: any;
}

const RequestService = ({
  initialRequest,
  selectedMechanic,
}: RequestServiceProps) => {
  const [request, setRequest] = useState<EmergencyRequest | null>(
    initialRequest || null,
  );
  const [status, setStatus] = useState<string>(
    initialRequest?.status || "pending",
  );
  const { toast } = useToast();

  // Subscribe to request status updates
  useEffect(() => {
    if (!request) return;

    const subscription = emergencyService.subscribeToRequestStatus(
      request.id,
      (updatedRequest) => {
        setRequest(updatedRequest);
        setStatus(updatedRequest.status);

        // Show toast notifications for status changes
        if (updatedRequest.status !== status) {
          const statusMessages = {
            matched: "A mechanic has been assigned to your request",
            en_route: "Your mechanic is on the way",
            arrived: "Your mechanic has arrived at your location",
            completed: "Your service has been completed",
            cancelled: "Your request has been cancelled",
          };

          if (
            statusMessages[updatedRequest.status as keyof typeof statusMessages]
          ) {
            toast({
              title: "Request Update",
              description:
                statusMessages[
                  updatedRequest.status as keyof typeof statusMessages
                ],
              variant:
                updatedRequest.status === "cancelled"
                  ? "destructive"
                  : "default",
            });
          }
        }
      },
    );

    // Simulate status changes for demo purposes
    if (process.env.NODE_ENV === "development") {
      const statusSequence = [
        "pending",
        "matched",
        "en_route",
        "arrived",
        "completed",
      ];
      const currentIndex = statusSequence.indexOf(status);

      if (currentIndex < statusSequence.length - 1) {
        const timer = setTimeout(() => {
          const nextStatus = statusSequence[currentIndex + 1];
          setStatus(nextStatus);
          setRequest((prev) =>
            prev ? { ...prev, status: nextStatus as any } : null,
          );
        }, 10000); // Change status every 10 seconds for demo

        return () => clearTimeout(timer);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [request, status, toast]);

  // Handle request cancellation with enhanced error handling
  const handleCancelRequest = async () => {
    if (!request) return;

    // Don't allow cancellation for certain statuses
    if (status === "completed" || status === "cancelled") {
      toast({
        title: "Cannot Cancel",
        description: `This request is already ${status}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Show loading state
      toast({
        title: "Cancelling Request",
        description: "Please wait while we process your cancellation...",
      });

      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would call an API endpoint
      // const response = await emergencyService.cancelRequest(request.id);

      // Success notification
      toast({
        title: "Request Cancelled",
        description: "Your emergency request has been cancelled successfully.",
        variant: "destructive",
      });

      // Update local state
      setStatus("cancelled");
      setRequest((prev) => (prev ? { ...prev, status: "cancelled" } : null));

      // Log cancellation for analytics
      console.log("Request cancelled:", {
        requestId: request.id,
        previousStatus: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to cancel request:", error);
      toast({
        title: "Error",
        description:
          "Failed to cancel your request. Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  };

  // Handle review submission
  const handleSubmitReview = (rating: number, review: string) => {
    if (!request) return;

    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });

    console.log("Review submitted:", { requestId: request.id, rating, review });
  };

  if (!request) return null;

  return (
    <RequestTracker
      requestId={request.id}
      status={status as any}
      mechanicName={selectedMechanic?.name || "Assigned Mechanic"}
      mechanicPhone={selectedMechanic?.phone || "(555) 123-4567"}
      estimatedArrival={"10-15 minutes"}
      location={request.location}
      onCancel={handleCancelRequest}
      onReviewSubmit={handleSubmitReview}
    />
  );
};

export default RequestService;
