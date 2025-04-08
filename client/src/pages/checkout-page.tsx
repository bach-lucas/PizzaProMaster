import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

// Checkout form schema
const checkoutSchema = z.object({
  address: z.string().min(1, "Delivery address is required"),
  paymentMethod: z.enum(["credit_card", "cash_on_delivery", "paypal"], {
    required_error: "Please select a payment method",
  }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  orderNotes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();
  const [paymentStep, setPaymentStep] = useState(1);

  // Create form
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      orderNotes: "",
    },
  });

  // Watch payment method to conditionally show fields
  const paymentMethod = form.watch("paymentMethod");

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders/create", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to success page with order ID
      navigate(`/order-success/${data.id}`);
    },
  });

  const onSubmit = (values: CheckoutValues) => {
    // Create order data
    const orderData = {
      items: items,
      subtotal,
      deliveryFee,
      total,
      address: values.address,
      paymentMethod: values.paymentMethod,
      status: "pending",
    };

    createOrderMutation.mutate(orderData);
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate("/menu");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-bold mb-8 text-center">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Order Summary</CardTitle>
                  <CardDescription>
                    {items.length} {items.length === 1 ? "item" : "items"} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                      <div className="flex items-start">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-gray-600">{item.description}</span>
                          )}
                          <div className="flex items-center mt-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <span className="text-xs">-</span>
                            </Button>
                            <span className="mx-2 text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full bg-primary text-white border-primary"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="sr-only">Increase quantity</span>
                              <span className="text-xs">+</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2 text-gray-400 hover:text-primary"
                              onClick={() => removeItem(item.id)}
                            >
                              <span className="sr-only">Remove item</span>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.specialInstructions && (
                            <span className="text-xs text-gray-500 mt-1">
                              Note: {item.specialInstructions}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-xl text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">
                    {paymentStep === 1 ? "Delivery Details" : "Payment Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {paymentStep === 1 ? (
                        <>
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Address</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter your full delivery address with postal code"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="orderNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any special instructions for delivery"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="button"
                            className="w-full bg-primary hover:bg-red-700"
                            onClick={() => setPaymentStep(2)}
                          >
                            Continue to Payment
                          </Button>
                        </>
                      ) : (
                        <>
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Payment Method</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                      <RadioGroupItem value="credit_card" id="credit_card" />
                                      <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                                        Credit Card
                                      </Label>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card text-gray-500"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                      <RadioGroupItem value="paypal" id="paypal" />
                                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                                        PayPal
                                      </Label>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paypal text-gray-500"><path d="M7 11c.7-3.37 3.4-6 7-6 3.31 0 6 2.69 6 6 0 0 0 6-6 6H5"/><path d="M19.5 11c.75-3.37 2.67-6 3.5-6 1.5 0 2.5 1 2.5 3 0 3.67-1 6.5-5 6.5h-3"/></svg>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                      <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                                      <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                                        Cash on Delivery
                                      </Label>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-banknote text-gray-500"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {paymentMethod === "credit_card" && (
                            <div className="space-y-4 pt-2">
                              <FormField
                                control={form.control}
                                name="cardNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Card Number</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="1234 5678 9012 3456"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="cardExpiry"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Expiry Date</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="MM/YY"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="cardCvc"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CVC</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="123"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setPaymentStep(1)}
                              className="flex-1"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="bg-primary hover:bg-red-700 flex-1"
                              disabled={createOrderMutation.isPending}
                            >
                              {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                            </Button>
                          </div>
                        </>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
