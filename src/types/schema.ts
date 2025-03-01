export type EmergencyRequestStatus =
  | "pending"
  | "matched"
  | "en_route"
  | "arrived"
  | "completed"
  | "cancelled";

export type MechanicStatus = "available" | "busy" | "offline";

export type ServiceType =
  | "towing"
  | "battery_service"
  | "tire_change"
  | "fuel_delivery"
  | "lockout"
  | "general_repair";

export interface EmergencyRequest {
  id: string;
  location: string;
  coordinates?: [number, number];
  phone: string;
  description?: string;
  status: EmergencyRequestStatus;
  service_type?: string;
  created_at: string;
  updated_at: string;
  mechanic_id?: string;
  completion_time?: string;
  rating?: number;
  review?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  status: MechanicStatus;
  current_location: [number, number];
  profile_image?: string;
  verified: boolean;
  active_since: string;
  completed_jobs: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "user" | "mechanic" | "admin";
  created_at: string;
  last_login?: string;
  profile_image?: string;
  saved_locations?: {
    name: string;
    coordinates: [number, number];
  }[];
  payment_methods?: {
    id: string;
    type: "credit_card" | "paypal";
    last_four?: string;
    expires?: string;
    default: boolean;
  }[];
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  mechanic_id?: string;
  service_type: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  location: [number, number];
  address: string;
  description?: string;
  created_at: string;
  updated_at: string;
  estimated_arrival?: string;
  completion_time?: string;
  price?: number;
  payment_status?: "pending" | "paid" | "refunded";
  rating?: number;
  review?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
  action_url?: string;
  related_id?: string;
  related_type?: "request" | "payment" | "account" | "system";
}
