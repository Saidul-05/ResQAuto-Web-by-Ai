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
import { Phone, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavbarProps {
  logo?: string;
  isEmergency?: boolean;
}

const Navbar = ({ logo = "ResQ Auto", isEmergency = false }: NavbarProps) => {
  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
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
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button
            variant={isEmergency ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            {isEmergency ? "Emergency Assistance" : "Call Now"}
          </Button>
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  variant={isEmergency ? "destructive" : "default"}
                  className="flex items-center gap-2 mt-4"
                >
                  <Phone className="h-4 w-4" />
                  {isEmergency ? "Emergency Assistance" : "Call Now"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
