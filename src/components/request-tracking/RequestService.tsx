import React, { useState, useEffect } from "react";
import { EmergencyRequest } from "@/types/schema";
import { emergencyService } from "@/lib/emergency-service";
import RequestTracker from "./RequestTracker";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

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

  // Subscribe to request status updates with real-time updates and analytics tracking
  useEffect(() => {
    if (!request) return;

    // Track initial request status
    trackEvent({
      category: "Request",
      action: "Status Change",
      label: status,
      value: 1,
    });

    const subscription = emergencyService.subscribeToRequestStatus(
      request.id,
      (updatedRequest) => {
        setRequest(updatedRequest);

        // Track status change if it's different
        if (updatedRequest.status !== status) {
          trackEvent({
            category: "Request",
            action: "Status Change",
            label: `${status} → ${updatedRequest.status}`,
            value: 1,
          });
        }

        setStatus(updatedRequest.status);

        // Show toast notifications for status changes with enhanced UX
        if (updatedRequest.status !== status) {
          const statusMessages = {
            matched: "A mechanic has been assigned to your request",
            en_route: "Your mechanic is on the way",
            arrived: "Your mechanic has arrived at your location",
            completed: "Your service has been completed",
            cancelled: "Your request has been cancelled",
          };

          // Show browser notification if supported and page is not visible
          if (
            "Notification" in window &&
            Notification.permission === "granted" &&
            document.visibilityState !== "visible"
          ) {
            const statusTitle = {
              matched: "Mechanic Assigned",
              en_route: "Mechanic En Route",
              arrived: "Mechanic Arrived",
              completed: "Service Completed",
              cancelled: "Request Cancelled",
            };

            new Notification(
              `ResQ Auto: ${statusTitle[updatedRequest.status as keyof typeof statusTitle] || "Status Update"}`,
              {
                body:
                  statusMessages[
                    updatedRequest.status as keyof typeof statusMessages
                  ] || "Your request status has been updated",
                icon: "/path/to/icon.png",
              },
            );
          }

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
                  : updatedRequest.status === "completed"
                    ? "success"
                    : "default",
            });
          }
        }
      },
    );

    // Request notification permission if not already granted
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Simulate status changes for demo purposes with more realistic timing
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
        // Use different timing for different status changes to simulate real-world scenario
        const getStatusChangeTime = (
          currentStatus: string,
          nextStatus: string,
        ) => {
          const timings: Record<string, number> = {
            "pending-matched": 5000, // 5 seconds to find a mechanic
            "matched-en_route": 8000, // 8 seconds for mechanic to start moving
            "en_route-arrived": 15000, // 15 seconds for mechanic to arrive
            "arrived-completed": 20000, // 20 seconds to complete the service
          };
          return timings[`${currentStatus}-${nextStatus}`] || 10000;
        };

        const nextStatus = statusSequence[currentIndex + 1];
        const timer = setTimeout(
          () => {
            setStatus(nextStatus);
            setRequest((prev) =>
              prev
                ? {
                    ...prev,
                    status: nextStatus as any,
                    updated_at: new Date().toISOString(),
                  }
                : null,
            );
          },
          getStatusChangeTime(status, nextStatus),
        );

        return () => clearTimeout(timer);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [request, status, toast, trackEvent]);

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

      // Track cancellation for analytics
      trackEvent({
        category: "Emergency",
        action: "Request Cancelled",
        label: status,
        value: 1,
      });

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

    // Track review submission in analytics
    trackEvent({
      category: "Review",
      action: "Submitted",
      label: `Rating: ${rating}`,
      value: rating,
    });

    console.log("Review submitted:", { requestId: request.id, rating, review });
  };

  if (!request) return null;

  // Use the mechanic from the request if available, otherwise use the selected mechanic
  const mechanic =
    request.mechanic_id && selectedMechanic?.id === request.mechanic_id
      ? selectedMechanic
      : { name: "Assigned Mechanic", phone: "(555) 123-4567" };

  // Calculate estimated arrival based on status
  const getEstimatedArrival = () => {
    switch (status) {
      case "pending":
        return "10-15 minutes";
      case "matched":
        return "8-10 minutes";
      case "en_route":
        return "5-7 minutes";
      case "arrived":
        return "Mechanic has arrived";
      case "completed":
        return "Service completed";
      default:
        return "Calculating...";
    }
  };

  return (
    <RequestTracker
      requestId={request.id}
      status={status as any}
      mechanicName={mechanic.name}
      mechanicPhone={mechanic.phone}
      estimatedArrival={getEstimatedArrival()}
      location={request.location}
      onCancel={handleCancelRequest}
      onReviewSubmit={handleSubmitReview}
    />
  );
};

export default RequestService;
