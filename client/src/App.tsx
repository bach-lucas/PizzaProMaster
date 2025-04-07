import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import MenuPage from "@/pages/menu-page";
import AuthPage from "@/pages/auth-page";
import CheckoutPage from "@/pages/checkout-page";
import OrderSuccessPage from "@/pages/order-success-page";
import OrderTrackingPage from "@/pages/order-tracking-page";

// Admin pages
import Dashboard from "@/pages/admin/dashboard";
import MenuManagement from "@/pages/admin/menu-management";
import Orders from "@/pages/admin/orders";
import Users from "@/pages/admin/users";
import CreateEditItem from "@/pages/admin/create-edit-item";

import { ProtectedRoute } from "./lib/protected-route";
import { AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./hooks/use-cart";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected customer routes */}
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/order-success/:id" component={OrderSuccessPage} />
      <ProtectedRoute path="/track-order/:id" component={OrderTrackingPage} />
      
      {/* Admin routes */}
      <AdminRoute path="/admin" component={Dashboard} />
      <AdminRoute path="/admin/menu" component={MenuManagement} />
      <AdminRoute path="/admin/orders" component={Orders} />
      <AdminRoute path="/admin/users" component={Users} />
      <AdminRoute path="/admin/menu/create" component={CreateEditItem} />
      <AdminRoute path="/admin/menu/edit/:id" component={CreateEditItem} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
