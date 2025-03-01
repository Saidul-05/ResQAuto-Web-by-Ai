import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, XCircle, Eye, FileText, Star } from "lucide-react";

interface MechanicApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  specialties: string[];
  certifications: string[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
}

const MechanicApproval = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<MechanicApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [applications, setApplications] = useState<MechanicApplication[]>([
    {
      id: "app-001",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "(555) 123-4567",
      experience: 5,
      specialties: ["Engine Repair", "Electrical Systems", "Towing"],
      certifications: ["ASE Master Technician", "Automotive HVAC"],
      status: "pending",
      submittedAt: "2023-06-15T14:30:00Z",
      documents: [
        {
          name: "Driver's License",
          url: "#",
          type: "identification",
        },
        {
          name: "ASE Certification",
          url: "#",
          type: "certification",
        },
        {
          name: "Insurance Document",
          url: "#",
          type: "insurance",
        },
      ],
    },
    {
      id: "app-002",
      name: "Maria Garcia",
      email: "maria.g@example.com",
      phone: "(555) 987-6543",
      experience: 3,
      specialties: ["Tire Service", "Battery Replacement", "Lockout Assistance"],
      certifications: ["Tire Service Technician"],
      status: "pending",
      submittedAt: "2023-06-18T09:15:00Z",
      documents: [
        {
          name: "Driver's License",
          url: "#",
          type: "identification",
        },
        {
          name: "Tire Service Certification",
          url: "#",
          type: "certification",
        },
        {
          name: "Background Check",
          url: "#",
          type: "background",
        },
      ],
    },
    {
      id: "app-003",
      name: "David Chen",
      email: "david.c@example.com",
      phone: "(555) 456-7890",
      experience: 7,
      specialties: ["Engine Diagnostics", "Transmission Repair", "Fuel Systems"],
      certifications: ["ASE Master Technician", "Hybrid Vehicle Specialist"],
      status: "approved",
      submittedAt: "2023-06-10T11:45:00Z",
      documents: [
        {
          name: "Driver's License",
          url: "#",
          type: "identification",
        },
        {
          name: "ASE Certification",
          url: "#",
          type: "certification",
        },
        {
          name: "Insurance Document",
          url: "#",
          type: "insurance",
        },
      ],
    },
    {
      id: "app-004",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      phone: "(555) 789-0123",
      experience: 2,
      specialties: ["Battery Service", "Tire Change", "Lockout"],
      certifications: ["Basic Roadside Assistance"],
      status: "rejected",
      submittedAt: "2023-06-05T16:20:00Z",
      documents: [
        {
          name: "Driver's License",
          url: "#",
          type: "identification",
        },
        {
          name: "Training Certificate",
          url: "#",
          type: "certification",
        },
      ],
    },
  ]);

  const handleStatusChange = (id: string, newStatus: "approved" | "rejected") => {
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
    if (selectedApplication?.id === id) {
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingApplications = filteredApplications.filter(
    (app) => app.status === "pending"
  );
  const approvedApplications = filteredApplications.filter(
    (app) => app.status === "approved"
  );
  const rejectedApplications = filteredApplications.filter(
    (app) => app.status === "rejected"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mechanic Applications</h2>
        <div className="flex items-center gap-2 w-1/3">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Badge variant="outline" className="px-3 py-1">
          All: {filteredApplications.length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-yellow-50">
          Pending: {pendingApplications.length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-green-50">
          Approved: {approvedApplications.length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-red-50">
          Rejected: {rejectedApplications.length}
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending
            {pendingApplications.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {pendingApplications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ApplicationsTable
            applications={pendingApplications}
            onView={(app) => {
              setSelectedApplication(app);
              setIsViewDialogOpen(true);
            }}
            onApprove={(id) => handleStatusChange(id, "approved")}
            onReject={(id) => handleStatusChange(id, "rejected")}
            showActions={true}
          />
        </TabsContent>

        <TabsContent value="approved">
          <ApplicationsTable
            applications={approvedApplications}
            onView={(app) => {
              setSelectedApplication(app);
              setIsViewDialogOpen(true);
            }}
            showActions={false}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <ApplicationsTable
            applications={rejectedApplications}
            onView={(app) => {
              setSelectedApplication(app);
              setIsViewDialogOpen(true);
            }}
            showActions={false}
          />
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the mechanic application details and documents.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{selectedApplication.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p>{selectedApplication.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                    <p>{formatDate(selectedApplication.submittedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        selectedApplication.status === "approved"
                          ? "default"
                          : selectedApplication.status === "pending"
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {selectedApplication.status.charAt(0).toUpperCase() +
                        selectedApplication.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="space-y-3">
                  {selectedApplication.documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {doc.type}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Background Check</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="font-medium">Background Check Passed</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Verified on {formatDate(selectedApplication.submittedAt)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedApplication?.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusChange(selectedApplication.id, "rejected")
                  }
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(selectedApplication.id, "approved")
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ApplicationsTableProps {
  applications: MechanicApplication[];
  onView: (application: MechanicApplication) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions: boolean;
}

const ApplicationsTable = ({
  applications,
  onView,
  onApprove,
  onReject,
  showActions,
}: ApplicationsTableProps) => {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No applications found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{app.email}</div>
                  <div>{app.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  {app.experience} years
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {app.specialties.slice(0, 2).map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {app.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{app.specialties.length - 2} more
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    app.status === "approved"
                      ? "default"
                      : app.status === "pending"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onView(app)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {showActions && app.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-green-600"
                        onClick={() => onApprove?.(app.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => onReject?.(app.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
