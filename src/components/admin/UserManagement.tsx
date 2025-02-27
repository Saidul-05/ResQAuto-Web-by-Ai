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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, UserPlus, Mail, Download, BarChart } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  lastActive: string;
  subscription: "free" | "premium" | "none";
  status: "active" | "inactive" | "blocked";
  requests: number;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed: string;
  status: "active" | "unsubscribed";
  source: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      id: "u1",
      name: "Alex Johnson",
      email: "alex@example.com",
      phone: "(555) 123-4567",
      joinDate: "2023-01-15",
      lastActive: "2023-05-20",
      subscription: "premium",
      status: "active",
      requests: 12,
    },
    {
      id: "u2",
      name: "Maria Garcia",
      email: "maria@example.com",
      phone: "(555) 987-6543",
      joinDate: "2023-02-10",
      lastActive: "2023-05-18",
      subscription: "free",
      status: "active",
      requests: 3,
    },
    {
      id: "u3",
      name: "James Wilson",
      email: "james@example.com",
      phone: "(555) 456-7890",
      joinDate: "2023-03-05",
      lastActive: "2023-04-30",
      subscription: "none",
      status: "inactive",
      requests: 0,
    },
    {
      id: "u4",
      name: "Sophia Lee",
      email: "sophia@example.com",
      phone: "(555) 234-5678",
      joinDate: "2023-01-20",
      lastActive: "2023-05-19",
      subscription: "premium",
      status: "active",
      requests: 8,
    },
  ]);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: "s1",
      email: "newsletter1@example.com",
      subscribed: "2023-01-10",
      status: "active",
      source: "Website",
    },
    {
      id: "s2",
      email: "newsletter2@example.com",
      subscribed: "2023-02-15",
      status: "active",
      source: "App",
    },
    {
      id: "s3",
      email: "newsletter3@example.com",
      subscribed: "2023-03-20",
      status: "unsubscribed",
      source: "Promotion",
    },
    {
      id: "s4",
      email: "newsletter4@example.com",
      subscribed: "2023-04-05",
      status: "active",
      source: "Website",
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscribers">Newsletter Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-64">
                <Search className="h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <Badge variant="outline" className="px-3 py-1">
              All: {users.length}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-blue-50">
              Active: {users.filter((u) => u.status === "active").length}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-yellow-50">
              Premium:{" "}
              {users.filter((u) => u.subscription === "premium").length}
            </Badge>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div>{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.subscription === "premium"
                            ? "default"
                            : user.subscription === "free"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {user.subscription === "none"
                          ? "No Plan"
                          : user.subscription.charAt(0).toUpperCase() +
                            user.subscription.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "inactive"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.requests}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-64">
                <Search className="h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      {subscriber.email}
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribed).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscriber.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {subscriber.status.charAt(0).toUpperCase() +
                          subscriber.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscriber.source}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">User Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
                <CardDescription>All registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users.length}</div>
                <p className="text-sm text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Premium Subscribers</CardTitle>
                <CardDescription>Paid memberships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {users.filter((u) => u.subscription === "premium").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Users</CardTitle>
                <CardDescription>Users active in last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {users.filter((u) => u.status === "active").length}
                </div>
                <p className="text-sm text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart className="h-5 w-5" />
                <span>Analytics charts would appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
