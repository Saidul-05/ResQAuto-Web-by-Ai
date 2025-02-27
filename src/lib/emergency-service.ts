import { supabase } from "./supabase";
import {
  EmergencyRequest,
  EmergencyRequestStatus,
  Mechanic,
} from "@/types/schema";

export const emergencyService = {
  async createRequest(
    data: Pick<EmergencyRequest, "location" | "phone" | "description">,
  ): Promise<EmergencyRequest> {
    const { data: request, error } = await supabase
      .from("emergency_requests")
      .insert([
        {
          ...data,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  subscribeToRequestStatus(
    requestId: string,
    callback: (request: EmergencyRequest) => void,
  ) {
    return supabase
      .channel(`request-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => callback(payload.new as EmergencyRequest),
      )
      .subscribe();
  },

  subscribeMechanicLocations(
    mechanicIds: string[],
    callback: (mechanic: Mechanic) => void,
  ) {
    // Create a channel for each mechanic to track their location updates
    const channel = supabase.channel(`mechanics-location-${Date.now()}`);

    // Subscribe to location updates for each mechanic
    mechanicIds.forEach((id) => {
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mechanics",
          filter: `id=eq.${id}`,
        },
        (payload) => callback(payload.new as Mechanic),
      );
    });

    // Start the subscription
    const subscription = channel.subscribe();

    // Return an object with unsubscribe method for cleanup
    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      },
    };
  },

  async getNearbyMechanics(location: [number, number]): Promise<Mechanic[]> {
    const { data: mechanics, error } = await supabase.rpc(
      "get_nearby_mechanics",
      {
        user_lat: location[0],
        user_lng: location[1],
        radius_km: 10,
      },
    );

    if (error) throw error;
    return mechanics;
  },
};
