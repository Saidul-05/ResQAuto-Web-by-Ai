import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Car, Phone, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  onCancel?: () => void;
  onReviewSubmit?: (rating: number, review: string) => void;
}

const RequestTracker = ({
  requestId = "REQ-12345",
  status = "en_route",
  mechanicName = "John Smith",
  mechanicPhone = "(555) 123-4567",
  estimatedArrival = "10-15 minutes",
  location = "Current Location",
  onCancel,
  onReviewSubmit,
}: RequestTrackerProps) => {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

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

  const handleCancelRequest = () => {
    setIsCancelDialogOpen(false);
    onCancel?.();
  };

  const handleSubmitReview = () => {
    // Validate review before submission
    if (review.trim().length < 10 && rating < 5) {
      // Only require detailed feedback for ratings below 5 stars
      alert(
        "Please provide more details about your experience to help us improve.",
      );
      return;
    }

    setIsReviewDialogOpen(false);
    onReviewSubmit?.(rating, review);
  };

  return (
    <>
      <Card className="w-full max-w-md p-6 bg-white shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Emergency Request</h3>
            <Badge variant={status === "cancelled" ? "destructive" : "default"}>
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace("_", " ")}
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
                <div>
                  <p className="text-sm">
                    Estimated arrival: {estimatedArrival}
                  </p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() =>
                    (window.location.href = `tel:${mechanicPhone.replace(/[^0-9]/g, "")}`)
                  }
                >
                  Call Mechanic
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2">
            {status === "completed" ? (
              <Button
                variant="default"
                className="w-full"
                onClick={() => setIsReviewDialogOpen(true)}
              >
                Submit Review
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                disabled={["pending", "matched", "en_route"].includes(status)}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <DialogDescription>
              Please rate your experience with {mechanicName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Share your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your emergency request?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              No, Keep Request
            </Button>
            <Button variant="destructive" onClick={handleCancelRequest}>
              Yes, Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestTracker;
