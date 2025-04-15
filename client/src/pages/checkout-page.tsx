import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle } from "lucide-react";
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
  address: z.string().min(1, "Endereço de entrega é obrigatório"),
  paymentMethod: z.enum(["mercadopago", "cash_on_delivery"], {
    required_error: "Por favor, selecione um método de pagamento",
  }),
  orderNotes: z.string().optional(),
  isPickup: z.boolean().default(false),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();
  const [paymentStep, setPaymentStep] = useState(1);

  // State para gerenciar o redirecionamento ao Mercado Pago
  const [mercadoPagoUrl, setMercadoPagoUrl] = useState<string | null>(null);
  
  // State para gerenciar tipo de entrega
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  
  // Buscar endereços do usuário
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['/api/addresses'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user,
  });
  
  // Selecionar o endereço favorito ou o primeiro disponível
  const primaryAddress = addresses?.find((address: any) => address.isDefault) || addresses?.[0];

  // Create form
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      paymentMethod: "mercadopago",
      orderNotes: "",
      isPickup: false,
    },
  });

  // Watch fields to conditionally show other form elements
  const paymentMethod = form.watch("paymentMethod");
  const isPickup = form.watch("isPickup");
  
  // Formatar o endereço principal quando disponível
  useEffect(() => {
    if (primaryAddress) {
      const formattedAddress = `${primaryAddress.street}, ${primaryAddress.number} - ${primaryAddress.neighborhood}
${primaryAddress.complement ? primaryAddress.complement + '\n' : ''}${primaryAddress.city} - ${primaryAddress.state}, CEP: ${primaryAddress.zipCode}`;
      
      form.setValue("address", formattedAddress);
    }
  }, [primaryAddress, form]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders/create", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Se o método de pagamento for Mercado Pago, criar preferência
      if (paymentMethod === "mercadopago") {
        createMercadoPagoPreference(data);
      } else {
        // Para pagamento na entrega, redirecionar para a página de sucesso
        navigate(`/order-success/${data.id}`);
      }
    },
  });
  
  // Mutation para criar preferência de pagamento no Mercado Pago
  const createMercadoPagoPreferenceMutation = useMutation({
    mutationFn: async (data: { orderId: number; items: any[]; total: number }) => {
      const res = await apiRequest("POST", "/api/payment/mercadopago/preference", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirecionar para a página de pagamento do Mercado Pago
      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    },
    onError: (error: any, variables: any) => {
      console.error("Erro ao criar preferência de pagamento:", error);
      // Mostrar mensagem de erro e redirecionar para a página de sucesso com status de erro
      navigate(`/order-success/${variables.orderId}?status=failure`);
    }
  });
  
  // Função para criar preferência de pagamento no Mercado Pago
  const createMercadoPagoPreference = (orderData: any) => {
    createMercadoPagoPreferenceMutation.mutate({
      orderId: orderData.id,
      items: items,
      total: total
    });
  };

  const onSubmit = (values: CheckoutValues) => {
    // Se for retirada no local, o pagamento é sempre na entrega
    const finalPaymentMethod = values.isPickup ? "cash_on_delivery" : values.paymentMethod;
    
    // Create order data
    const orderData = {
      items: items,
      subtotal,
      deliveryFee: values.isPickup ? 0 : deliveryFee, // Sem taxa de entrega para retirada no local
      total: values.isPickup ? subtotal : total,
      address: values.isPickup ? "Retirada no local" : values.address,
      paymentMethod: finalPaymentMethod,
      orderNotes: values.orderNotes,
      isPickup: values.isPickup,
      status: "pending",
    };

    createOrderMutation.mutate(orderData);
  };

  // Redirect if cart is empty using useEffect instead of during render
  useEffect(() => {
    if (items.length === 0) {
      navigate("/menu");
    }
  }, [items.length, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Resumo do Pedido</CardTitle>
                  <CardDescription>
                    {items.length} {items.length === 1 ? "item" : "itens"} no seu carrinho
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
                              <span className="sr-only">Diminuir quantidade</span>
                              <span className="text-xs">-</span>
                            </Button>
                            <span className="mx-2 text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full bg-primary text-white border-primary"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="sr-only">Aumentar quantidade</span>
                              <span className="text-xs">+</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2 text-gray-400 hover:text-primary"
                              onClick={() => removeItem(item.id)}
                            >
                              <span className="sr-only">Remover item</span>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.specialInstructions && (
                            <span className="text-xs text-gray-500 mt-1">
                              Obs: {item.specialInstructions}
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
                      <span>Taxa de Entrega</span>
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
                    {paymentStep === 1 ? "Detalhes da Entrega" : "Informações de Pagamento"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {paymentStep === 1 ? (
                        <>
                          <FormField
                            control={form.control}
                            name="isPickup"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <FormLabel>Você deseja retirar a pizza no local?</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    defaultValue={field.value ? "true" : "false"}
                                    className="flex space-x-6"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="true" id="pickup-yes" />
                                      <Label htmlFor="pickup-yes">Sim</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="false" id="pickup-no" />
                                      <Label htmlFor="pickup-no">Não</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {isPickup && (
                            <Alert className="bg-blue-50 border-blue-200">
                              <InfoIcon className="h-4 w-4 text-blue-500" />
                              <AlertTitle className="text-blue-700">Retirada no local</AlertTitle>
                              <AlertDescription className="text-blue-600">
                                Ao optar por retirada no local, o pagamento deverá ser realizado no momento da retirada.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {!isPickup && (
                            <>
                              {addresses && addresses.length === 0 ? (
                                <Alert className="bg-amber-50 border-amber-200">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  <AlertTitle className="text-amber-700">Nenhum endereço cadastrado</AlertTitle>
                                  <AlertDescription className="text-amber-600">
                                    Cadastre um endereço em "Meu Perfil &gt; Meus Endereços" para continuar com o pedido.
                                    <div className="mt-2">
                                      <Button 
                                        variant="outline" 
                                        className="text-amber-600 border-amber-300"
                                        onClick={() => navigate("/profile")}
                                      >
                                        Ir para Meu Perfil
                                      </Button>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                <FormField
                                  control={form.control}
                                  name="address"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Endereço para entrega:</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          className="resize-none"
                                          {...field}
                                          readOnly={!!primaryAddress}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </>
                          )}

                          <FormField
                            control={form.control}
                            name="orderNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Observações do Pedido (Opcional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={isPickup 
                                      ? "Ex: Hora aproximada de retirada, nome de quem vai retirar, etc."
                                      : "Ex: Instruções especiais para entrega, sem cebola, entregar no portão lateral, etc."
                                    }
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
                            disabled={!isPickup && (!addresses || addresses.length === 0)}
                          >
                            Continuar para Pagamento
                          </Button>
                        </>
                      ) : (
                        <>
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Método de Pagamento</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                      <RadioGroupItem value="mercadopago" id="mercadopago" />
                                      <Label htmlFor="mercadopago" className="flex-1 cursor-pointer">
                                        Cartão de Crédito / Pix / Boleto (Mercado Pago)
                                      </Label>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card text-gray-500"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                                      <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                                      <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                                        Pagamento na Entrega (Dinheiro)
                                      </Label>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-banknote text-gray-500"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {paymentMethod === "mercadopago" && (
                            <div className="space-y-4 pt-2">
                              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <p className="text-sm mb-2">
                                  Ao finalizar o pedido, você será redirecionado para a página de pagamento do Mercado Pago, onde poderá escolher entre:
                                </p>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Cartão de crédito (parcelamento em até 12x)</li>
                                  <li>Cartão de débito</li>
                                  <li>PIX (pagamento instantâneo)</li>
                                  <li>Boleto bancário</li>
                                </ul>
                                <p className="text-sm mt-2">
                                  Após confirmar o pagamento, você será redirecionado de volta ao site.
                                </p>
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
                              Voltar
                            </Button>
                            <Button
                              type="submit"
                              className="bg-primary hover:bg-red-700 flex-1"
                              disabled={createOrderMutation.isPending}
                            >
                              {createOrderMutation.isPending ? "Processando..." : "Finalizar Pedido"}
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
