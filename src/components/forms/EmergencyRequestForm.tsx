import React, { useState } from "react";
import { emergencyService } from "@/lib/emergency-service";
import RequestStatusDialog from "@/components/request-status/RequestStatusDialog";
import { EmergencyRequest } from "@/types/schema";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  trackEvent,
  trackEmergencyRequest,
} from "@/components/analytics/AnalyticsTracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Phone, AlertCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  location: z
    .string()
    .min(5, "Location must be at least 5 characters")
    .max(100, "Location must be less than 100 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
      "Please enter a valid phone number format (e.g., 555-123-4567)",
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

type EmergencyFormData = z.infer<typeof formSchema>;

interface EmergencyRequestFormProps {
  onSubmit?: (data: EmergencyFormData) => void;
  isLoading?: boolean;
  onRequestSubmit?: (request: EmergencyRequest) => void;
  selectedMechanic?: any;
}

const EmergencyRequestForm = ({
  onSubmit,
  isLoading: externalIsLoading = false,
  onRequestSubmit,
  selectedMechanic,
}: EmergencyRequestFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Requesting Help...");
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(
    null,
  );

  const form = useForm<EmergencyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      phone: "",
      description: "",
    },
  });

  const handleSubmit = async (data: EmergencyFormData) => {
    try {
      // Already in loading state from onSubmitForm

      // Simulate network delay for demo purposes with loading state messages
      setLoadingMessage("Requesting Help...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLoadingMessage("Locating nearby mechanics...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLoadingMessage("Sending request...");

      // Validate data one more time before sending
      if (!data.location || !data.phone) {
        throw new Error("validation: All required fields must be filled");
      }

      // If a mechanic is selected, include their ID in the request
      const requestData = selectedMechanic
        ? { ...data, mechanic_id: selectedMechanic.id }
        : data;

      // Add location coordinates if available
      if (navigator.geolocation) {
        try {
          setLoadingMessage("Detecting your location...");
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: true,
              });
            },
          );

          requestData.coordinates = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setLoadingMessage("Location detected!");
        } catch (geoError) {
          console.warn("Could not get precise location:", geoError);
          setLoadingMessage("Using provided location...");
          // Continue without coordinates - not a blocking error
        }
      }

      setLoadingMessage("Connecting to service...");
      const request = await emergencyService.createRequest(requestData);
      setActiveRequest(request);
      onSubmit?.(data);
      onRequestSubmit?.(request);

      toast({
        title: "Emergency request sent",
        description: selectedMechanic
          ? `Your request has been sent to ${selectedMechanic.name}. Help is on the way.`
          : "Help is on the way. You can track the status here.",
        variant: "default",
      });

      // Reset form
      form.reset();

      // Track emergency request in analytics with enhanced data
      try {
        // Track the emergency request with detailed information
        trackEmergencyRequest({
          requestId: request.id,
          location: data.location,
          serviceType: data.description ? "custom" : "general",
          mechanicId: request.mechanic_id,
          timestamp: new Date().toISOString(),
          deviceType: window.innerWidth <= 768 ? "mobile" : "desktop",
          browser: navigator.userAgent,
        });

        // Track the form submission event
        trackEvent({
          category: "Emergency",
          action: "Form Submission",
          label: selectedMechanic
            ? `Selected Mechanic: ${selectedMechanic.name}`
            : "Auto-assign",
          value: 1,
        });

        // Track the specific service type if available
        if (data.description) {
          const keywords = [
            { term: "tire", category: "Tire Service" },
            { term: "battery", category: "Battery Service" },
            { term: "fuel", category: "Fuel Delivery" },
            { term: "gas", category: "Fuel Delivery" },
            { term: "lock", category: "Lockout Service" },
            { term: "key", category: "Lockout Service" },
            { term: "tow", category: "Towing" },
            { term: "engine", category: "Engine Problem" },
            { term: "brake", category: "Brake Problem" },
          ];

          const description = data.description.toLowerCase();
          for (const { term, category } of keywords) {
            if (description.includes(term)) {
              trackEvent({
                category: "Emergency",
                action: "Service Type",
                label: category,
                value: 1,
              });
              break;
            }
          }
        }
      } catch (analyticsError) {
        console.error("Analytics error:", analyticsError);
      }

      return request;
    } catch (error) {
      console.error("Failed to create emergency request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error && error.message.includes("validation")
            ? error.message.replace("validation: ", "")
            : "Failed to send emergency request. Please try again.",
        variant: "destructive",
      });

      // Track the error in analytics
      try {
        trackEvent({
          category: "Emergency",
          action: "Form Error",
          label: error instanceof Error ? error.message : "Unknown error",
          value: 0,
        });
      } catch (analyticsError) {
        console.error("Analytics error:", analyticsError);
      }

      throw error; // Re-throw to allow the calling function to handle it
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitting = isLoading || externalIsLoading;
  const [formError, setFormError] = useState<string>("");

  const onSubmitForm = async (data: EmergencyFormData) => {
    setFormError("");
    try {
      // Track form submission attempt
      trackEvent({
        category: "Form",
        action: "Submission Attempt",
        label: "Emergency Request",
        value: 1,
      });

      // Simple profanity check (would be more comprehensive in production)
      if (data.description) {
        const profanityList = ["badword1", "badword2"];
        if (
          profanityList.some((word) =>
            data.description?.toLowerCase().includes(word),
          )
        ) {
          setFormError("Please keep your description appropriate.");

          // Track validation error
          trackEvent({
            category: "Form",
            action: "Validation Error",
            label: "Inappropriate Content",
            value: 0,
          });
          return;
        }
      }

      // Format phone number consistently
      data.phone = data.phone
        .replace(/[^0-9]/g, "")
        .replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");

      // Track successful validation
      trackEvent({
        category: "Form",
        action: "Validation Success",
        label: "Emergency Request",
        value: 1,
      });

      // Show loading state
      setIsLoading(true);

      // Submit the form
      await handleSubmit(data);
    } catch (error) {
      // Check for specific error types
      let errorLabel = "Unknown Error";

      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("connection")
        ) {
          setFormError(
            "Network error. Please check your internet connection and try again.",
          );
          errorLabel = "Network Error";
        } else if (error.message.includes("timeout")) {
          setFormError("Request timed out. Please try again.");
          errorLabel = "Timeout Error";
        } else if (error.message.includes("validation")) {
          setFormError(error.message);
          errorLabel = "Validation Error";
        } else {
          setFormError("An unexpected error occurred. Please try again.");
          errorLabel = error.message;
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }

      // Track form submission error
      trackEvent({
        category: "Form",
        action: "Submission Error",
        label: errorLabel,
        value: 0,
      });

      // Log detailed error for debugging
      console.error("Form submission error:", error);

      // Ensure loading state is reset
      setIsLoading(false);
    }
  };

  return (
    <>
      {activeRequest && (
        <RequestStatusDialog
          request={activeRequest}
          onClose={() => setActiveRequest(null)}
        />
      )}
      <Card className="w-full max-w-[480px] p-6 bg-white shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Emergency Assistance
          </h2>
          <p className="text-gray-600">
            {selectedMechanic
              ? `Request help from ${selectedMechanic.name}`
              : "Fill out this quick form for immediate help"}
          </p>
          {selectedMechanic && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium">{selectedMechanic.name}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Rating: {selectedMechanic.rating} ⭐ •{" "}
                {selectedMechanic.distance} away
              </p>
              <p className="text-xs text-gray-500">
                Specialties: {selectedMechanic.specialties.join(", ")}
              </p>
            </div>
          )}
        </div>

        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Enter your current location"
                        className="pl-10"
                        disabled={isSubmitting}
                        autoComplete="street-address"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        disabled={isSubmitting}
                        autoComplete="tel"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        onBlur={(e) => {
                          // Format phone number on blur
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length === 10) {
                            const formatted = value.replace(
                              /^(\d{3})(\d{3})(\d{4})$/,
                              "$1-$2-$3",
                            );
                            field.onChange(formatted);
                          } else {
                            field.onChange(e.target.value);
                          }
                          field.onBlur();
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 555-123-4567 (will be formatted automatically)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe your emergency..."
                      className="resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {loadingMessage}
                  </span>
                ) : (
                  "Request Emergency Assistance"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                By submitting this form, you agree to our{" "}
                <a href="#" className="underline hover:text-blue-600">
                  Terms of Service
                </a>
                {selectedMechanic && (
                  <span className="block mt-1">
                    You've selected <strong>{selectedMechanic.name}</strong> as
                    your mechanic
                  </span>
                )}
              </p>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default EmergencyRequestForm;
