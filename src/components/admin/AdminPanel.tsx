import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MechanicManagement from "./MechanicManagement";
import FeatureToggle from "./FeatureToggle";
import AdManagement from "./AdManagement";
import UserManagement from "./UserManagement";
import AppDemo from "./AppDemo";

const AdminPanel = () => {
  return (
    <div className="container mx-auto py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">ResQ Auto Admin Panel</h1>

      <Tabs defaultValue="mechanics" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="demo">App Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="mechanics">
          <MechanicManagement />
        </TabsContent>

        <TabsContent value="features">
          <FeatureToggle />
        </TabsContent>

        <TabsContent value="ads">
          <AdManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="demo">
          <AppDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
