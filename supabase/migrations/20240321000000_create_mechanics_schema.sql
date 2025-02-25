-- Enable PostGIS extension for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE emergency_request_status AS ENUM (
  'pending',
  'matched',
  'en_route',
  'arrived',
  'completed',
  'cancelled'
);

CREATE TYPE mechanic_status AS ENUM ('available', 'busy', 'offline');

CREATE TYPE service_type AS ENUM (
  'towing',
  'battery_service',
  'tire_change',
  'fuel_delivery',
  'lockout',
  'general_repair'
);

-- Create mechanics table
CREATE TABLE mechanics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  specialties service_type[] NOT NULL,
  status mechanic_status NOT NULL DEFAULT 'offline',
  current_location GEOGRAPHY(POINT) NOT NULL,
  service_radius_km INTEGER NOT NULL DEFAULT 10,
  vehicle_info JSONB NOT NULL,
  certification_ids UUID[] DEFAULT '{}',
  insurance_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mechanic certifications table
CREATE TABLE mechanic_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  certification_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  verification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service areas table
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
  coordinates GEOGRAPHY(POINT) NOT NULL,
  radius_km INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mechanic availability table
CREATE TABLE mechanic_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mechanic_id, day_of_week)
);

-- Update emergency_requests table to include new fields
ALTER TABLE emergency_requests
ADD COLUMN IF NOT EXISTS coordinates GEOGRAPHY(POINT),
ADD COLUMN IF NOT EXISTS service_type service_type,
ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_arrival_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS review TEXT;

-- Create function to find nearby mechanics
CREATE OR REPLACE FUNCTION get_nearby_mechanics(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  distance DOUBLE PRECISION,
  rating DECIMAL,
  specialties service_type[],
  status mechanic_status
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    ST_Distance(
      m.current_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000 as distance,
    m.rating,
    m.specialties,
    m.status
  FROM mechanics m
  WHERE
    m.status = 'available'
    AND ST_DWithin(
      m.current_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance ASC;
END;
$$;

-- Create indexes for better query performance
CREATE INDEX idx_mechanics_current_location ON mechanics USING GIST (current_location);
CREATE INDEX idx_mechanics_status ON mechanics (status);
CREATE INDEX idx_service_areas_coordinates ON service_areas USING GIST (coordinates);
CREATE INDEX idx_emergency_requests_coordinates ON emergency_requests USING GIST (coordinates);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_mechanics_updated_at
    BEFORE UPDATE ON mechanics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanic_certifications_updated_at
    BEFORE UPDATE ON mechanic_certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_areas_updated_at
    BEFORE UPDATE ON service_areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanic_availability_updated_at
    BEFORE UPDATE ON mechanic_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
