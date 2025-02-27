import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Share2 } from "lucide-react";

const AppDemo = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">App Features Demo</h2>
      <p className="text-muted-foreground">
        Watch and share demonstrations of the ResQ Auto app features
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>ResQ Auto - How It Works</CardTitle>
            <CardDescription>
              A complete walkthrough of the emergency roadside assistance
              process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop"
                alt="Car repair video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 flex items-center justify-center"
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Last updated: May 15, 2023
                </p>
                <p className="text-sm text-muted-foreground">Duration: 2:45</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Videos</CardTitle>
              <CardDescription>
                Short demonstrations of specific features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="emergency">
                <TabsList className="w-full">
                  <TabsTrigger value="emergency">Emergency</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
                  <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
                </TabsList>

                <TabsContent value="emergency" className="mt-4 space-y-4">
                  <div className="relative rounded-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=500&auto=format&fit=crop"
                      alt="Emergency assistance"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full h-10 w-10 flex items-center justify-center p-0"
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                      <p className="text-white text-sm">
                        Emergency Request (0:45)
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-4 space-y-4">
                  <div className="relative rounded-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?w=500&auto=format&fit=crop"
                      alt="Map feature"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full h-10 w-10 flex items-center justify-center p-0"
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                      <p className="text-white text-sm">
                        Interactive Map (1:20)
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mechanics" className="mt-4 space-y-4">
                  <div className="relative rounded-md overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1530046339915-78cc17530b14?w=500&auto=format&fit=crop"
                      alt="Mechanic feature"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full h-10 w-10 flex items-center justify-center p-0"
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                      <p className="text-white text-sm">
                        Mechanic Selection (0:55)
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Tutorials</CardTitle>
              <CardDescription>Step-by-step guides for users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Getting Started</p>
                  <p className="text-sm text-muted-foreground">3:10</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-8 w-8 flex items-center justify-center p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Creating an Account</p>
                  <p className="text-sm text-muted-foreground">2:25</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-8 w-8 flex items-center justify-center p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Premium Features</p>
                  <p className="text-sm text-muted-foreground">4:15</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-8 w-8 flex items-center justify-center p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppDemo;
