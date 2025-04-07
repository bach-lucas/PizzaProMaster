import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Home, Eye, ShoppingBag, Check } from "lucide-react";
import { Link } from "wouter";

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { clearCart } = useCart();
  
  // Clear cart on successful order
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });
  
  // If order not found, redirect to home
  if (error) {
    navigate("/");
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-green-500">
              <CardHeader className="text-center bg-green-50 border-b border-green-100">
                <div className="mx-auto bg-green-100 text-green-700 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-2">
                  <Check className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-heading text-green-700">Order Successful!</CardTitle>
                <CardDescription>
                  Thank you for your order. Your order has been placed and is being processed.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading order details...</p>
                  </div>
                ) : order ? (
                  <>
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Order Number:</span>
                        <span className="font-bold">#{order.id}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Order Date:</span>
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Status:</span>
                        <span className="bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full text-xs font-medium">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Method:</span>
                        <span>{order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-heading font-medium text-lg mb-3">Order Items</h3>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between py-2 border-b last:border-0">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <div className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </div>
                          </div>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{formatCurrency(order.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                    
                    {order.address && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-md">
                        <h3 className="font-heading font-medium text-lg mb-2">Delivery Address</h3>
                        <p className="text-gray-700 whitespace-pre-line">{order.address}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      <Link href="/">
                        <Button variant="outline" className="w-full">
                          <Home className="mr-2 h-4 w-4" />
                          Return to Home
                        </Button>
                      </Link>
                      <Link href={`/track-order/${order.id}`}>
                        <Button className="w-full bg-primary hover:bg-red-700">
                          <Eye className="mr-2 h-4 w-4" />
                          Track Order
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Order details not found.</p>
                    <Link href="/">
                      <Button className="mt-4">
                        Return to Home
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
