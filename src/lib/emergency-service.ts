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
