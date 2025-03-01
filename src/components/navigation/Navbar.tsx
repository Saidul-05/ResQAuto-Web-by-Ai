import React from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Phone, Menu, Settings, LogOut, User, Moon, Sun } from "lucide-react";
import NotificationCenter from "../notifications/NotificationCenter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/auth";

interface NavbarProps {
  logo?: string;
  isEmergency?: boolean;
}

const Navbar = ({ logo = "ResQ Auto", isEmergency = false }: NavbarProps) => {
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };
  const menuItems = [
    { label: "Home", href: "#hero" },
    { label: "Map", href: "#map" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <nav className="w-full h-20 bg-white border-b border-gray-200 fixed top-0 left-0 z-50 px-4 md:px-6 lg:px-8">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">
            {logo}
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors scroll-smooth"
                    onClick={(e) => {
                      if (item.href.startsWith("#")) {
                        e.preventDefault();
                        const element = document.getElementById(
                          item.href.substring(1),
                        );
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }
                    }}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <ThemeToggle />
              {isAdmin && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => navigate("/admin")}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Button>
              )}
              {!isAdmin && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => navigate("/mechanic")}
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
              )}
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                variant={isEmergency ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {isEmergency ? "Emergency Assistance" : "Call Now"}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {menuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors block w-full"
                    onClick={(e) => {
                      if (item.href.startsWith("#")) {
                        e.preventDefault();
                        const element = document.getElementById(
                          item.href.substring(1),
                        );
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                          // Close the sheet after clicking a navigation item
                          const closeButton = document.querySelector(
                            "[data-radix-collection-item]",
                          );
                          if (closeButton instanceof HTMLElement) {
                            closeButton.click();
                          }
                        }
                      }
                    }}
                  >
                    {item.label}
                  </a>
                ))}
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 mt-4 w-full"
                        onClick={() => navigate("/admin")}
                      >
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 mt-4 w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <NotificationCenter />
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 mt-4 w-full"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 mt-4 w-full"
                      onClick={() => navigate("/register")}
                    >
                      Register
                    </Button>
                    <Button
                      variant={isEmergency ? "destructive" : "default"}
                      className="flex items-center gap-2 mt-4 w-full"
                    >
                      <Phone className="h-4 w-4" />
                      {isEmergency ? "Emergency Assistance" : "Call Now"}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
