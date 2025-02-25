import { createClient } from "@supabase/supabase-js";

// Mock Supabase client for development
const mockSupabase = {
  from: () => ({
    insert: () =>
      Promise.resolve({
        data: {
          id: "mock-request-123",
          status: "pending",
          location: "123 Main St",
          phone: "555-0123",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      }),
    select: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
  }),
  channel: (name: string) => ({
    on: () => ({
      subscribe: () => ({
        unsubscribe: () => {},
      }),
    }),
  }),
  rpc: () => Promise.resolve({ data: [], error: null }),
};

// Use mock client in development
export const supabase = mockSupabase as any;
