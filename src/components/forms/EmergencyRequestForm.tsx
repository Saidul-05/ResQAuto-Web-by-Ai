import React, { useState } from "react";
import { emergencyService } from "@/lib/emergency-service";
import RequestStatusDialog from "@/components/request-status/RequestStatusDialog";
import { EmergencyRequest } from "@/types/schema";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  location: z.string().min(1, "Location is required"),
  phone: z.string().min(1, "Phone number is required"),
  description: z.string().optional(),
});

type EmergencyFormData = z.infer<typeof formSchema>;

interface EmergencyRequestFormProps {
  onSubmit?: (data: EmergencyFormData) => void;
  isLoading?: boolean;
  onRequestSubmit?: (request: EmergencyRequest) => void;
}

const EmergencyRequestForm = ({
  onSubmit,
  isLoading: externalIsLoading = false,
  onRequestSubmit,
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
      setIsLoading(true);

      // Simulate network delay for demo purposes with loading state messages
      setLoadingMessage("Requesting Help...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLoadingMessage("Locating nearby mechanics...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLoadingMessage("Sending request...");

      const request = await emergencyService.createRequest(data);
      setActiveRequest(request);
      onSubmit?.(data);
      onRequestSubmit?.(request);

      toast({
        title: "Emergency request sent",
        description: "Help is on the way. You can track the status here.",
        variant: "default",
      });

      // Reset form
      form.reset();

      // Analytics tracking (if implemented)
      try {
        console.log("Tracking emergency request", {
          location: data.location,
          hasDescription: !!data.description,
          timestamp: new Date().toISOString(),
        });
      } catch (analyticsError) {
        console.error("Analytics error:", analyticsError);
      }

      return request;
    } catch (error) {
      console.error("Failed to create emergency request:", error);
      toast({
        title: "Error",
        description: "Failed to send emergency request. Please try again.",
        variant: "destructive",
      });
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
      // Enhanced form validation

      // Validate phone number format (comprehensive validation)
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(data.phone)) {
        setFormError("Please enter a valid phone number (e.g., 555-123-4567)");
        return;
      }

      // Validate location isn't just whitespace and has minimum length
      if (data.location.trim().length < 5) {
        setFormError(
          "Please enter a more specific location (at least 5 characters)",
        );
        return;
      }

      // Validate description if provided (no profanity, reasonable length)
      if (data.description) {
        if (data.description.length > 500) {
          setFormError(
            "Description is too long. Please keep it under 500 characters.",
          );
          return;
        }

        // Simple profanity check (would be more comprehensive in production)
        const profanityList = ["badword1", "badword2"];
        if (
          profanityList.some((word) =>
            data.description?.toLowerCase().includes(word),
          )
        ) {
          setFormError("Please keep your description appropriate.");
          return;
        }
      }

      await handleSubmit(data);
    } catch (error) {
      // Check for specific error types
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("connection")
        ) {
          setFormError(
            "Network error. Please check your internet connection and try again.",
          );
        } else if (error.message.includes("timeout")) {
          setFormError("Request timed out. Please try again.");
        } else {
          setFormError("An unexpected error occurred. Please try again.");
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }

      // Log detailed error for debugging
      console.error("Form submission error:", error);
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
            Fill out this quick form for immediate help
          </p>
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
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 555-123-4567
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
              </p>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default EmergencyRequestForm;
