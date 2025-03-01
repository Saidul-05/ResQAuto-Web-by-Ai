import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { trackEvent } from "@/components/analytics/AnalyticsTracker";

type RequestStatus =
  | "pending"
  | "matched"
  | "en_route"
  | "arrived"
  | "completed"
  | "cancelled";

interface RequestTrackerProps {
  requestId: string;
  status: RequestStatus;
  mechanicName: string;
  mechanicPhone: string;
  estimatedArrival: string;
  location: string;
  onCancel: () => void;
  onReviewSubmit: (rating: number, review: string) => void;
}

const RequestTracker: React.FC<RequestTrackerProps> = ({
  requestId,
  status,
  mechanicName,
  mechanicPhone,
  estimatedArrival,
  location,
  onCancel,
  onReviewSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Calculate progress percentage based on status
  const getProgressPercentage = () => {
    const statusMap: Record<RequestStatus, number> = {
      pending: 10,
      matched: 30,
      en_route: 50,
      arrived: 75,
      completed: 100,
      cancelled: 0,
    };
    return statusMap[status] || 0;
  };

  // Get status display text
  const getStatusText = () => {
    const statusMap: Record<RequestStatus, string> = {
      pending: "Finding a mechanic",
      matched: "Mechanic assigned",
      en_route: "Mechanic en route",
      arrived: "Mechanic arrived",
      completed: "Service completed",
      cancelled: "Request cancelled",
    };
    return statusMap[status] || "Unknown status";
  };

  // Get status badge variant
  const getStatusVariant = () => {
    const variantMap: Record<
      RequestStatus,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      pending: "secondary",
      matched: "secondary",
      en_route: "default",
      arrived: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return variantMap[status] || "secondary";
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <X className="h-5 w-5 text-red-500" />;
      case "arrived":
        return <MapPin className="h-5 w-5 text-blue-500" />;
      case "en_route":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  // Handle review submission
  const handleReviewSubmit = () => {
    onReviewSubmit(rating, review);
    setShowReviewDialog(false);

    // Track review submission
    trackEvent({
      category: "Review",
      action: "Submit",
      label: `Rating: ${rating}`,
      value: rating,
    });
  };

  // Handle cancel request
  const handleCancelRequest = () => {
    setShowCancelDialog(false);
    onCancel();

    // Track cancellation
    trackEvent({
      category: "Request",
      action: "Cancel",
      label: status,
      value: 0,
    });
  };

  // Handle phone call
  const handlePhoneCall = () => {
    // Track phone call
    trackEvent({
      category: "Contact",
      action: "Call Mechanic",
      label: mechanicName,
      value: 1,
    });

    window.location.href = `tel:${mechanicPhone.replace(/[^0-9]/g, "")}`;
  };

  return (
    <Card className="w-full max-w-[480px] p-6 bg-white shadow-lg dark:bg-gray-800 dark:text-white">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Request Tracking
          </h2>
          <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        </div>
        <p className="text-gray-600 text-sm dark:text-gray-300">
          Request ID: {requestId}
        </p>
      </div>

      {/* Progress tracker */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Request Sent</span>
          <span>Completed</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{estimatedArrival}</span>
          </div>
          {getStatusIcon() && (
            <div className="flex items-center gap-1 text-sm">
              {getStatusIcon()}
              <span>
                {status === "completed"
                  ? "Completed"
                  : status === "cancelled"
                    ? "Cancelled"
                    : "In Progress"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Mechanic info */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Mechanic Details</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="font-medium text-blue-600 dark:text-blue-300">
                {mechanicName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <p className="font-medium">{mechanicName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status === "pending"
                  ? "Assigning mechanic..."
                  : "Assigned to your request"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 dark:text-blue-400"
              onClick={handlePhoneCall}
            >
              {mechanicPhone}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {status === "completed" ? (
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">Leave a Review</Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:text-white">
              <DialogHeader>
                <DialogTitle>Rate Your Experience</DialogTitle>
                <DialogDescription className="dark:text-gray-300">
                  How was your experience with {mechanicName}?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Share your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit}>Submit Review</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : status !== "cancelled" ? (
          <AlertDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Cancel Request
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Emergency Request?</AlertDialogTitle>
                <AlertDialogDescription className="dark:text-gray-300">
                  Are you sure you want to cancel your emergency request? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  No, Keep Request
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelRequest}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Yes, Cancel Request
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <div className="flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600 dark:text-red-400">
              This request has been cancelled
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full dark:border-gray-700"
          onClick={handlePhoneCall}
        >
          <Phone className="h-4 w-4 mr-2" />
          Call Mechanic
        </Button>
      </div>

      {/* Real-time updates notice */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
        Updates will appear in real-time as your request progresses
      </p>
    </Card>
  );
};

export default RequestTracker;
