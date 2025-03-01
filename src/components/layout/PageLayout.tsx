import React from "react";
import Navbar from "../navigation/Navbar";
import Footer from "./Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import SmoothScroll from "./SmoothScroll";
import ResponsiveLayout from "./ResponsiveLayout";

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
  className = "",
}) => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="resq-theme">
      <SmoothScroll>
        <ResponsiveLayout
          className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200 ${className}`}
        >
          {showNavbar && <Navbar />}
          <main className="flex-grow">{children}</main>
          {showFooter && <Footer />}
          <Toaster />
        </ResponsiveLayout>
      </SmoothScroll>
    </ThemeProvider>
  );
};

export default PageLayout;
