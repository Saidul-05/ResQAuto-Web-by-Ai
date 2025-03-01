import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  MessageSquare,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../auth/AuthProvider";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationCenter = ({
  onNotificationClick,
}: NotificationCenterProps) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Load notifications (in a real app, this would come from Firebase Cloud Messaging)
  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      // This would be an API call in a real implementation
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Request Assigned",
          message:
            "You have been assigned a new emergency request in your area.",
          type: "info",
          timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
          read: false,
          link: "/mechanic/requests",
        },
        {
          id: "2",
          title: "Payment Received",
          message:
            "You have received a payment of $45 for your recent service.",
          type: "success",
          timestamp: new Date(Date.now() - 3 * 3600000), // 3 hours ago
          read: false,
          link: "/mechanic/earnings",
        },
        {
          id: "3",
          title: "System Maintenance",
          message:
            "The system will be down for maintenance tonight from 2-4 AM EST.",
          type: "warning",
          timestamp: new Date(Date.now() - 12 * 3600000), // 12 hours ago
          read: true,
        },
        {
          id: "4",
          title: "New Review",
          message: "A customer has left a 5-star review for your service.",
          type: "success",
          timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
          read: true,
          link: "/mechanic/reviews",
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    };

    fetchNotifications();

    // In a real app, set up Firebase Cloud Messaging listener here
    const setupFCM = async () => {
      try {
        // This would be the actual FCM setup code
        console.log("Setting up FCM for user:", currentUser?.uid);

        // Mock receiving a new notification after 10 seconds
        const timer = setTimeout(() => {
          const newNotification: Notification = {
            id: Date.now().toString(),
            title: "New Emergency Request",
            message:
              "A customer needs assistance with a flat tire 2 miles away.",
            type: "info",
            timestamp: new Date(),
            read: false,
            link: "/mechanic/requests",
          };

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show browser notification if supported
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("ResQ Auto: New Emergency Request", {
              body: "A customer needs assistance with a flat tire 2 miles away.",
              icon: "/path/to/icon.png",
            });
          }
        }, 10000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error setting up FCM:", error);
      }
    };

    if (currentUser) {
      setupFCM();
    }

    // Request notification permission
    const requestNotificationPermission = async () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };

    requestNotificationPermission();
  }, [currentUser]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setOpen(false);
    onNotificationClick?.(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
