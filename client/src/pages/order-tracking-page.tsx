import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    refetchInterval: 30000, // Refetch every 30 seconds to get status updates
  });
  
  // Helper function to determine the current step based on status
  const getCurrentStep = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "preparing":
        return 1;
      case "in_transit":
        return 2;
      case "delivered":
        return 3;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };
  
  // Get tracking step information
  const getTrackingSteps = () => {
    const steps = [
      { 
        status: "pending", 
        label: "Pedido Recebido", 
        description: "Recebemos seu pedido e estamos processando.",
        icon: <Clock className="h-8 w-8" />,
      },
      { 
        status: "preparing", 
        label: "Em Preparo", 
        description: "Nossos chefs estão preparando sua deliciosa pizza.",
        icon: <ChefHat className="h-8 w-8" />,
      },
      { 
        status: "in_transit", 
        label: "A Caminho", 
        description: "Seu pedido está a caminho!",
        icon: <Truck className="h-8 w-8" />,
      },
      { 
        status: "delivered", 
        label: "Entregue", 
        description: "Seu pedido foi entregue. Bom apetite!",
        icon: <CheckCircle className="h-8 w-8" />,
      },
    ];
    
    return steps;
  };
  
  const trackingSteps = getTrackingSteps();
  const currentStep = order ? getCurrentStep(order.status) : -1;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <h1 className="font-heading text-3xl font-bold">Acompanhamento do Pedido</h1>
              {order && (
                <p className="text-gray-600">
                  Pedido #{order.id} • Realizado em {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : 'N/A'}
                </p>
              )}
            </div>
            
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-500">Carregando detalhes do pedido...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Pedido Não Encontrado</h2>
                  <p className="text-gray-600 mb-6">
                    Não conseguimos encontrar o pedido que você está procurando. Por favor, verifique o número do pedido e tente novamente.
                  </p>
                  <Button onClick={() => window.history.back()}>
                    Voltar
                  </Button>
                </CardContent>
              </Card>
            ) : order ? (
              <>
                {order.status === "cancelled" ? (
                  <Card className="border-2 border-red-400 mb-8">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-4 mt-1" />
                        <div>
                          <h2 className="text-xl font-heading font-bold mb-2">Pedido Cancelado</h2>
                          <p className="text-gray-600">
                            Este pedido foi cancelado devido à falta de confirmação do pagamento. Por favor, faça um novo pedido.
                          </p>
                          <div className="mt-4">
                            <Link href="/menu">
                              <Button className="bg-primary hover:bg-red-700">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Fazer Novo Pedido
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Status do Pedido</CardTitle>
                      <CardDescription>
                        Acompanhe a jornada do seu pedido da nossa cozinha até a sua porta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Progress line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        
                        {/* Steps */}
                        {trackingSteps.map((step, index) => {
                          const isActive = currentStep >= index;
                          const isCurrent = currentStep === index;
                          
                          return (
                            <div key={index} className="relative mb-8 last:mb-0 pl-12">
                              {/* Step indicator */}
                              <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                isActive 
                                  ? `${isCurrent ? "bg-primary ring-4 ring-red-100" : "bg-green-500"} text-white` 
                                  : "bg-gray-200 text-gray-400"
                              }`}>
                                {step.icon}
                              </div>
                              
                              {/* Step content */}
                              <div>
                                <h3 className={`text-lg font-semibold ${
                                  isActive ? (isCurrent ? "text-primary" : "text-green-500") : "text-gray-400"
                                }`}>
                                  {step.label}
                                </h3>
                                <p className={`${isActive ? "text-gray-600" : "text-gray-400"}`}>
                                  {step.description}
                                </p>
                                
                                {isCurrent && (
                                  <p className="text-sm text-primary font-medium mt-1">
                                    Status Atual
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {currentStep === 2 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
                          <h3 className="font-semibold flex items-center text-yellow-800">
                            <Truck className="h-5 w-5 mr-2" />
                            Tempo Estimado de Entrega
                          </h3>
                          <p className="mt-1 text-yellow-700">
                            Seu pedido deve chegar em aproximadamente 15-20 minutos.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Order Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Detalhes do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Items */}
                      <div>
                        <h3 className="font-medium mb-3">Itens</h3>
                        <div className="space-y-2">
                          {(order.items as any[]).map((item: any, index: number) => (
                            <div key={index} className="flex justify-between py-2 border-b last:border-0">
                              <div className="flex items-start">
                                <div>
                                  <span className="font-medium">{item.name}</span>
                                  {item.description && (
                                    <div className="text-xs text-gray-600">
                                      {item.description}
                                    </div>
                                  )}
                                  <div className="text-sm text-gray-500">
                                    Quantidade: {item.quantity}
                                    {item.specialInstructions && (
                                      <div className="text-xs italic mt-1">
                                        Observação: {item.specialInstructions}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Price summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de Entrega</span>
                          <span>{formatCurrency(order.deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Delivery details */}
                      <div>
                        <h3 className="font-medium mb-2">Detalhes da Entrega</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Endereço de Entrega</p>
                            <p className="whitespace-pre-line">{order.address}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Método de Pagamento</p>
                            <p>{order.paymentMethod === "credit_card" ? "Cartão de Crédito" : 
                               order.paymentMethod === "debit_card" ? "Cartão de Débito" : 
                               order.paymentMethod === "cash" ? "Dinheiro" : 
                               order.paymentMethod === "pix" ? "PIX" : 
                               order.paymentMethod.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
