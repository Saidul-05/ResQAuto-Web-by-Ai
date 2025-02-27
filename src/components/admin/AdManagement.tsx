import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Edit, Eye } from "lucide-react";

interface AdConfig {
  platform: string;
  enabled: boolean;
  appId?: string;
  publisherId?: string;
  slots?: {
    name: string;
    id: string;
    location: string;
    active: boolean;
  }[];
}

interface CustomAd {
  id: string;
  name: string;
  type: "banner" | "popup" | "sidebar";
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "ended";
  location: string;
}

const AdManagement = () => {
  const [adConfigs, setAdConfigs] = useState<AdConfig[]>([
    {
      platform: "Google AdMob",
      enabled: true,
      appId: "ca-app-pub-3940256099942544~1458002511",
      publisherId: "pub-3940256099942544",
      slots: [
        {
          name: "Banner - Homepage",
          id: "ca-app-pub-3940256099942544/6300978111",
          location: "Homepage Bottom",
          active: true,
        },
        {
          name: "Interstitial - Map",
          id: "ca-app-pub-3940256099942544/1033173712",
          location: "After Map Interaction",
          active: false,
        },
      ],
    },
    {
      platform: "Facebook Audience Network",
      enabled: false,
      appId: "",
      publisherId: "",
    },
  ]);

  const [customAds, setCustomAds] = useState<CustomAd[]>([
    {
      id: "ad1",
      name: "Summer Promo",
      type: "banner",
      imageUrl:
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop",
      linkUrl: "https://example.com/promo",
      startDate: "2023-06-01",
      endDate: "2023-08-31",
      status: "active",
      location: "Homepage",
    },
    {
      id: "ad2",
      name: "Winter Service",
      type: "sidebar",
      imageUrl:
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop",
      linkUrl: "https://example.com/winter",
      startDate: "2023-11-01",
      endDate: "2024-02-28",
      status: "scheduled",
      location: "Service Page",
    },
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ad Management</h2>

      <Tabs defaultValue="platforms">
        <TabsList className="mb-4">
          <TabsTrigger value="platforms">Ad Platforms</TabsTrigger>
          <TabsTrigger value="custom">Custom Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          {adConfigs.map((config, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{config.platform}</CardTitle>
                  <Switch checked={config.enabled} />
                </div>
                <CardDescription>
                  Configure your {config.platform} integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">App ID</label>
                    <Input value={config.appId} placeholder="Enter App ID" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publisher ID</label>
                    <Input
                      value={config.publisherId}
                      placeholder="Enter Publisher ID"
                    />
                  </div>
                </div>

                {config.slots && config.slots.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Ad Units</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {config.slots.map((slot, slotIndex) => (
                          <TableRow key={slotIndex}>
                            <TableCell>{slot.name}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {slot.id}
                            </TableCell>
                            <TableCell>{slot.location}</TableCell>
                            <TableCell>
                              <Switch checked={slot.active} size="sm" />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button variant="outline" size="sm" className="mt-2">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Ad Unit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Custom Advertisements</h3>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Ad
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell className="capitalize">{ad.type}</TableCell>
                  <TableCell>{ad.location}</TableCell>
                  <TableCell>
                    {new Date(ad.startDate).toLocaleDateString()} -{" "}
                    {new Date(ad.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${ad.status === "active" ? "bg-green-100 text-green-800" : ad.status === "scheduled" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdManagement;
