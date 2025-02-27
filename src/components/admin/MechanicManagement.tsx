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
import { Search, CheckCircle, XCircle, Edit, MapPin, Star } from "lucide-react";

interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  location: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  joinDate: string;
}

const MechanicManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mechanics, setMechanics] = useState<Mechanic[]>([
    {
      id: "m1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      specialties: ["Emergency Repair", "Towing"],
      location: "Downtown",
      rating: 4.8,
      status: "approved",
      joinDate: "2023-05-15",
    },
    {
      id: "m2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 987-6543",
      specialties: ["Electrical", "Diagnostics"],
      location: "Westside",
      rating: 4.9,
      status: "approved",
      joinDate: "2023-06-22",
    },
    {
      id: "m3",
      name: "Mike Wilson",
      email: "mike.w@example.com",
      phone: "(555) 456-7890",
      specialties: ["Tire Service", "Battery Jump"],
      location: "Northside",
      rating: 4.7,
      status: "pending",
      joinDate: "2023-08-10",
    },
    {
      id: "m4",
      name: "Lisa Chen",
      email: "lisa.chen@example.com",
      phone: "(555) 234-5678",
      specialties: ["Engine Repair", "AC Service"],
      location: "Eastside",
      rating: 4.5,
      status: "rejected",
      joinDate: "2023-07-05",
    },
  ]);

  const handleStatusChange = (
    id: string,
    newStatus: "approved" | "rejected" | "pending",
  ) => {
    setMechanics(
      mechanics.map((mechanic) =>
        mechanic.id === id ? { ...mechanic, status: newStatus } : mechanic,
      ),
    );
  };

  const filteredMechanics = mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mechanic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mechanic.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mechanic Management</h2>
        <div className="flex items-center gap-2 w-1/3">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search mechanics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Badge variant="outline" className="px-3 py-1">
          All: {mechanics.length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-blue-50">
          Approved: {mechanics.filter((m) => m.status === "approved").length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-yellow-50">
          Pending: {mechanics.filter((m) => m.status === "pending").length}
        </Badge>
        <Badge variant="outline" className="px-3 py-1 bg-red-50">
          Rejected: {mechanics.filter((m) => m.status === "rejected").length}
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMechanics.map((mechanic) => (
              <TableRow key={mechanic.id}>
                <TableCell className="font-medium">{mechanic.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{mechanic.email}</div>
                    <div>{mechanic.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {mechanic.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {mechanic.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    {mechanic.rating}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      mechanic.status === "approved"
                        ? "default"
                        : mechanic.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {mechanic.status.charAt(0).toUpperCase() +
                      mechanic.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {mechanic.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600"
                          onClick={() =>
                            handleStatusChange(mechanic.id, "approved")
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() =>
                            handleStatusChange(mechanic.id, "rejected")
                          }
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MechanicManagement;
