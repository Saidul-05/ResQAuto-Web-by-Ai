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
import { MapPin, Phone, AlertCircle } from "lucide-react";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  phone: z.string().min(1, "Phone number is required"),
  description: z.string().optional(),
});

type EmergencyFormData = z.infer<typeof formSchema>;

interface EmergencyRequestFormProps {
  onSubmit?: (data: EmergencyFormData) => void;
  isLoading?: boolean;
}

const EmergencyRequestForm = ({
  onSubmit,
  isLoading: externalIsLoading = false,
}: EmergencyRequestFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
      const request = await emergencyService.createRequest(data);
      setActiveRequest(request);
      onSubmit?.(data);

      toast({
        title: "Emergency request sent",
        description: "Help is on the way. You can track the status here.",
        variant: "default",
      });

      // Reset form
      form.reset();
    } catch (error) {
      console.error("Failed to create emergency request:", error);
      toast({
        title: "Error",
        description: "Failed to send emergency request. Please try again.",
        variant: "destructive",
      });
    } finally {
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
            Fill out this quick form for immediate help
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe your emergency..."
                      className="resize-none"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                    Requesting Help...
                  </span>
                ) : (
                  "Request Emergency Assistance"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default EmergencyRequestForm;
