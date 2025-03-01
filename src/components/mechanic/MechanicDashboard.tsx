import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Car,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Settings,
  User,
  CheckCircle,
  XCircle,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { EmergencyRequest } from "@/types/schema";

interface MechanicDashboardProps {
  mechanicId?: string;
}

const MechanicDashboard = ({
  mechanicId = "mech-123",
}: MechanicDashboardProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<
    EmergencyRequest[]
  >([]);
  const [earnings, setEarnings] = useState({
    today: 120,
    week: 850,
    month: 3200,
  });

  // Fetch mechanic data and requests
  useEffect(() => {
    // This would be an API call in a real implementation
    const fetchMechanicData = async () => {
      // Simulate API call
      setTimeout(() => {
        setActiveRequests([
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
          {
            id: "req-002",
            location: "456 Oak Ave, Somewhere",
            coordinates: [-74.01, 40.72],
            phone: "555-987-6543",
            description: "Flat tire, need replacement",
            status: "matched",
            service_type: "tire_change",
            created_at: new Date(Date.now() - 30 * 60000).toISOString(),
            updated_at: new Date().toISOString(),
            mechanic_id: mechanicId,
          },
        ] as EmergencyRequest[]);

        setCompletedRequests([
          {
            id: "req-003",
            location: "789 Pine St, Elsewhere",
            coordinates: [-74.02, 40.73],
            phone: "555-456-7890",
            description: "Out of fuel",
            status: "completed",
            service_type: "fuel_delivery",
            created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
            mechanic_id: mechanicId,
            completion_time: new Date(Date.now() - 2 * 3600000).toISOString(),
            rating: 5,
            review: "Great service, very prompt!",
          },
          {
            id: "req-004",
            location: "321 Elm St, Nowhere",
            coordinates: [-74.03, 40.74],
            phone: "555-321-6547",
            description: "Keys locked in car",
            status: "completed",
            service_type: "lockout",
            created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 3600000).toISOString(),
            mechanic_id: mechanicId,
            completion_time: new Date(Date.now() - 7 * 3600000).toISOString(),
            rating: 4,
            review: "Good service, but took a bit longer than expected.",
          },
        ] as EmergencyRequest[]);
      }, 1000);
    };

    fetchMechanicData();
  }, [mechanicId]);

  const handleStatusToggle = () => {
    setIsOnline(!isOnline);
    // This would update the mechanic's status in the database
    console.log(
      `Mechanic ${mechanicId} is now ${!isOnline ? "online" : "offline"}`,
    );
  };

  const handleAcceptRequest = (requestId: string) => {
    // This would accept the request in the database
    console.log(`Accepting request ${requestId}`);
    setActiveRequests(
      activeRequests.map((req) =>
        req.id === requestId
          ? { ...req, status: "en_route" as any, mechanic_id: mechanicId }
          : req,
      ),
    );
  };

  const handleRejectRequest = (requestId: string) => {
    // This would reject the request in the database
    console.log(`Rejecting request ${requestId}`);
    setActiveRequests(activeRequests.filter((req) => req.id !== requestId));
  };

  const handleCompleteRequest = (requestId: string) => {
    // This would mark the request as completed in the database
    console.log(`Completing request ${requestId}`);
    const completedRequest = activeRequests.find((req) => req.id === requestId);
    if (completedRequest) {
      const updatedRequest = {
        ...completedRequest,
        status: "completed" as any,
        completion_time: new Date().toISOString(),
      };
      setCompletedRequests([updatedRequest, ...completedRequests]);
      setActiveRequests(activeRequests.filter((req) => req.id !== requestId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getServiceTypeLabel = (type?: string) => {
    const serviceTypes: Record<string, string> = {
      towing: "Towing",
      battery_service: "Battery Service",
      tire_change: "Tire Change",
      fuel_delivery: "Fuel Delivery",
      lockout: "Lockout Assistance",
      general_repair: "General Repair",
    };
    return type ? serviceTypes[type] || type : "General Service";
  };

  return (
    <div className="container mx-auto py-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mechanic Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center gap-2">
              <Switch checked={isOnline} onCheckedChange={handleStatusToggle} />
              <span
                className={`text-sm ${isOnline ? "text-green-600" : "text-gray-500"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">${earnings.today}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">${earnings.week}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">${earnings.month}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active Requests
            {activeRequests.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed Requests</TabsTrigger>
          <TabsTrigger value="promotions">Promotions & Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No active requests at the moment.
                </p>
                <p className="text-sm text-muted-foreground">
                  New requests will appear here when customers need assistance.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {getServiceTypeLabel(request.service_type)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Request ID: {request.id}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "outline"
                              : request.status === "matched"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1).replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm">{request.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Contact</p>
                            <p className="text-sm">{request.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Requested</p>
                            <p className="text-sm">
                              {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Issue</p>
                            <p className="text-sm">
                              {request.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {request.status === "pending" ? (
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        </div>
                      ) : request.status === "matched" ||
                        request.status === "en_route" ? (
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            onClick={() => handleCompleteRequest(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No completed requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Completed Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.id}
                        </TableCell>
                        <TableCell>
                          {getServiceTypeLabel(request.service_type)}
                        </TableCell>
                        <TableCell>{request.location}</TableCell>
                        <TableCell>
                          {request.completion_time
                            ? formatDate(request.completion_time)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {request.rating ? (
                              <>
                                <span className="font-medium mr-1">
                                  {request.rating}
                                </span>
                                <span className="text-yellow-500">★</span>
                              </>
                            ) : (
                              "Not rated"
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promotions & Advertisements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop"
                    alt="Tool promotion"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      Special Discount on Premium Tools
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get 15% off on all premium tools and equipment through our
                      partner network. Limited time offer for verified
                      mechanics.
                    </p>
                    <Button variant="outline" size="sm">
                      View Offer
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border">
                  <img
                    src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop"
                    alt="Training program"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      Advanced Certification Program
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enhance your skills with our advanced certification
                      program. Earn more by becoming certified in specialized
                      repair services.
                    </p>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MechanicDashboard;
