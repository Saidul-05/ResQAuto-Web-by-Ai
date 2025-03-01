import { EmergencyRequest } from "@/types/schema";

// Mock data for emergency requests
const mockRequests: EmergencyRequest[] = [
  {
    id: "req-001",
    location: "123 Main St, Anytown",
    coordinates: [-74.006, 40.7128],
    phone: "555-123-4567",
    description: "Car won't start, need jump start",
    status: "pending",
    service_type: "battery_service",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock mechanic data
const mockMechanics = [
  {
    id: "mech-001",
    name: "John Smith",
    current_location: [-74.005, 40.7125] as [number, number],
    status: "available",
  },
  {
    id: "mech-002",
    name: "Sarah Johnson",
    current_location: [-74.008, 40.713] as [number, number],
    status: "busy",
  },
];

// Type for subscription callbacks
type RequestStatusCallback = (request: EmergencyRequest) => void;
type MechanicLocationCallback = (mechanic: any) => void;

// Subscription interfaces
interface Subscription {
  unsubscribe: () => void;
}

// Emergency service implementation
export const emergencyService = {
  // Create a new emergency request
  createRequest: async (
    data: Partial<EmergencyRequest>,
  ): Promise<EmergencyRequest> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a new request
    const newRequest: EmergencyRequest = {
      id: `req-${Date.now().toString(36)}`,
      location: data.location || "",
      coordinates: data.coordinates,
      phone: data.phone || "",
      description: data.description,
      status: "pending",
      service_type: data.service_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      mechanic_id: data.mechanic_id,
    };

    // Add to mock data
    mockRequests.push(newRequest);

    // Log for debugging
    console.log("Created emergency request:", newRequest);

    return newRequest;
  },

  // Get a request by ID
  getRequest: async (id: string): Promise<EmergencyRequest | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const request = mockRequests.find((req) => req.id === id);
    return request || null;
  },

  // Subscribe to request status updates
  subscribeToRequestStatus: (
    requestId: string,
    callback: RequestStatusCallback,
  ): Subscription => {
    console.log(`Subscribing to updates for request ${requestId}`);

    // Find the request
    const request = mockRequests.find((req) => req.id === requestId);
    if (!request) {
      console.warn(`Request ${requestId} not found`);
      return { unsubscribe: () => {} };
    }

    // For demo purposes, simulate status changes
    let currentStatus = request.status;
    const statusSequence = [
      "pending",
      "matched",
      "en_route",
      "arrived",
      "completed",
    ];
    let currentIndex = statusSequence.indexOf(currentStatus);

    // Initial callback with current state
    callback({ ...request });

    // Set up interval to simulate status changes
    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++;
        currentStatus = statusSequence[currentIndex] as any;

        // Update the request
        request.status = currentStatus as any;
        request.updated_at = new Date().toISOString();

        // If status is matched, assign a mechanic
        if (currentStatus === "matched" && !request.mechanic_id) {
          request.mechanic_id = mockMechanics[0].id;
        }

        // Call the callback with updated request
        callback({ ...request });

        console.log(`Request ${requestId} status updated to ${currentStatus}`);
      } else {
        // Clear interval when we reach the end of the sequence
        clearInterval(interval);
      }
    }, 10000); // Update every 10 seconds

    // Return unsubscribe function
    return {
      unsubscribe: () => {
        clearInterval(interval);
        console.log(`Unsubscribed from updates for request ${requestId}`);
      },
    };
  },

  // Subscribe to mechanic location updates
  subscribeMechanicLocations: (
    mechanicIds: string[],
    callback: MechanicLocationCallback,
  ): Subscription => {
    console.log(
      `Subscribing to location updates for mechanics: ${mechanicIds.join(", ")}`,
    );

    // Set up interval to simulate location changes
    const interval = setInterval(() => {
      // Randomly select a mechanic to update
      const randomIndex = Math.floor(Math.random() * mockMechanics.length);
      const mechanic = mockMechanics[randomIndex];

      // Skip if not in the requested list
      if (!mechanicIds.includes(mechanic.id)) return;

      // Update location slightly (random movement)
      const latChange = (Math.random() - 0.5) * 0.001;
      const lngChange = (Math.random() - 0.5) * 0.001;
      mechanic.current_location = [
        mechanic.current_location[0] + lngChange,
        mechanic.current_location[1] + latChange,
      ];

      // Call the callback with updated mechanic
      callback({ ...mechanic });

      console.log(`Mechanic ${mechanic.id} location updated`);
    }, 5000); // Update every 5 seconds

    // Return unsubscribe function
    return {
      unsubscribe: () => {
        clearInterval(interval);
        console.log(`Unsubscribed from mechanic location updates`);
      },
    };
  },

  // Cancel a request
  cancelRequest: async (requestId: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const request = mockRequests.find((req) => req.id === requestId);
    if (!request) return false;

    request.status = "cancelled";
    request.updated_at = new Date().toISOString();

    console.log(`Request ${requestId} cancelled`);
    return true;
  },

  // Submit a review for a completed request
  submitReview: async (
    requestId: string,
    rating: number,
    review: string,
  ): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const request = mockRequests.find((req) => req.id === requestId);
    if (!request) return false;

    request.rating = rating;
    request.review = review;
    request.updated_at = new Date().toISOString();

    console.log(`Review submitted for request ${requestId}: ${rating} stars`);
    return true;
  },
};
