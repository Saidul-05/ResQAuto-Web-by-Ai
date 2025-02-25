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
  coordinates: [number, number];
  phone: string;
  description?: string;
  status: EmergencyRequestStatus;
  service_type?: ServiceType;
  created_at: string;
  updated_at: string;
  mechanic_id?: string;
  user_id?: string;
  estimated_arrival_time?: string;
  actual_arrival_time?: string;
  completion_time?: string;
  rating?: number;
  review?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  total_reviews: number;
  specialties: ServiceType[];
  status: MechanicStatus;
  current_location: [number, number];
  service_radius_km: number;
  vehicle_info: {
    make: string;
    model: string;
    year: string;
    plate_number: string;
  };
  certification_ids: string[];
  insurance_expiry: string;
  created_at: string;
  updated_at: string;
}

export interface MechanicCertification {
  id: string;
  mechanic_id: string;
  certification_type: string;
  issuing_authority: string;
  certification_number: string;
  issue_date: string;
  expiry_date: string;
  verification_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceArea {
  id: string;
  mechanic_id: string;
  coordinates: [number, number];
  radius_km: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MechanicAvailability {
  id: string;
  mechanic_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
