import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { 
  BarChart3, 
  Settings, 
  Coffee, 
  ShoppingBag, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  Home 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logoUrl from "@assets/LOGO PIZZARIA_1751983593505.jpg";

type AdminSidebarProps = {
  className?: string;
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const routes = [
    {
      title: "Principal",
      icon: Home,
      href: "/admin",
      variant: "default"
    },
    {
      title: "Dashboard",
      icon: BarChart3,
      href: "/admin",
      variant: "ghost"
    },
    {
      title: "Pedidos",
      icon: ShoppingBag,
      href: "/admin/orders",
      variant: "ghost"
    },
    {
      title: "Cardápio",
      icon: Coffee,
      href: "/admin/menu",
      variant: "ghost"
    },
    {
      title: "Usuários",
      icon: Users,
      href: "/admin/users",
      variant: "ghost"
    },
    {
      title: "Logs",
      icon: FileText,
      href: "/admin/logs",
      variant: "ghost"
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/admin/settings",
      variant: "ghost"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/admin" && location === "/admin") {
      return true;
    }
    
    if (path !== "/admin" && location.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  // Menu mobile como um sheet
  const MobileMenu = () => (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src={logoUrl} 
              alt="ZZA Logo" 
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <SheetTitle className="text-left text-[#1b120b]">ZZA</SheetTitle>
              <p className="text-sm text-[#69300a]">Painel Administrativo</p>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="flex flex-col gap-1 p-2">
            {routes.map((route, i) => (
              <Button
                key={i}
                asChild
                variant={isActive(route.href) ? "default" : "ghost"}
                size="sm"
                className="justify-start h-10"
                onClick={() => setOpen(false)}
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.title}
                </Link>
              </Button>
            ))}
            <Separator className="my-2" />
            <Button
              size="sm"
              variant="ghost"
              className="justify-start h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <MobileMenu />
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 hidden md:flex md:w-64 flex-col border-r bg-white shadow-lg",
        className
      )}>
        <div className="px-3 py-4 border-b">
          <div className="flex items-center space-x-3">
            <img 
              src={logoUrl} 
              alt="ZZA Logo" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold text-[#1b120b]">ZZA</h2>
              <p className="text-sm text-[#69300a]">Painel Administrativo</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {routes.map((route, i) => (
              <Button
                key={i}
                asChild
                variant={isActive(route.href) ? "default" : "ghost"}
                size="sm"
                className="justify-start h-10"
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.title}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
        
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
}