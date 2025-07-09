import { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backButtonDestination?: string;
}

export function AdminLayout({
  children,
  title,
  showBackButton = true,
  backButtonDestination = "/admin"
}: AdminLayoutProps) {
  const [_, navigate] = useLocation();

  const handleBack = () => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      navigate(backButtonDestination);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3e9c6] dark:bg-gray-900">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="md:pl-64">
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Header area with back button and title */}
          <div className="flex flex-row items-center mb-4 sm:mb-6">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 sm:mr-4"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            )}
            
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#1b120b] truncate">{title}</h1>
            )}
          </div>

          {/* Main content */}
          <main className="max-w-full overflow-x-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}