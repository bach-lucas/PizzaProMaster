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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="md:pl-64">
        <div className="p-4 sm:p-6">
          {/* Header area with back button and title */}
          <div className="flex flex-row items-center mb-6">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-4"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            
            {title && (
              <h1 className="text-2xl font-bold">{title}</h1>
            )}
          </div>

          {/* Main content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}