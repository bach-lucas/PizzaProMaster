import { useEffect, useState } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Home, Eye, ShoppingBag, Check, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { clearCart } = useCart();
  const [redirected, setRedirected] = useState(false);
  
  // Extrair status de pagamento da URL se existir
  const searchParams = new URLSearchParams(window.location.search);
  const paymentStatus = searchParams.get('status');
  
  // Clear cart on successful order - only once
  useEffect(() => {
    clearCart();
  }, []);
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });
  
  // If order not found, redirect to home - but only once to prevent infinite loop
  useEffect(() => {
    if (error && !redirected) {
      setRedirected(true);
      navigate("/");
    }
  }, [error]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className={`border-2 ${paymentStatus === 'failure' ? 'border-red-500' : 'border-green-500'}`}>
              <CardHeader className={`text-center ${paymentStatus === 'failure' ? 'bg-red-50 border-b border-red-100' : 'bg-green-50 border-b border-green-100'}`}>
                <div className={`mx-auto rounded-full p-3 w-16 h-16 flex items-center justify-center mb-2 ${
                  paymentStatus === 'failure' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {paymentStatus === 'failure' 
                    ? <AlertTriangle className="h-8 w-8" />
                    : <Check className="h-8 w-8" />
                  }
                </div>
                <CardTitle className={`text-2xl font-heading ${
                  paymentStatus === 'failure' ? 'text-red-700' : 'text-green-700'
                }`}>
                  {paymentStatus === 'failure' 
                    ? 'Pagamento Não Realizado' 
                    : 'Pedido Realizado com Sucesso!'
                  }
                </CardTitle>
                <CardDescription>
                  {paymentStatus === 'failure'
                    ? 'Seu pedido foi cancelado por falta de confirmação do pagamento.'
                    : 'Obrigado pelo seu pedido. Seu pedido foi recebido e está sendo processado.'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Status do pagamento */}
                {paymentStatus && order && order.paymentMethod === "mercadopago" && (
                  <div className="mb-6">
                    {paymentStatus === "approved" && (
                      <Alert className="bg-green-50 border-green-200">
                        <Check className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-700">Pagamento Aprovado</AlertTitle>
                        <AlertDescription className="text-green-600">
                          Seu pagamento foi aprovado com sucesso. Sua pizza já está em preparo!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {paymentStatus === "pending" && (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <Info className="h-4 w-4 text-yellow-500" />
                        <AlertTitle className="text-yellow-700">Pagamento Pendente</AlertTitle>
                        <AlertDescription className="text-yellow-600">
                          Seu pagamento está em processamento. Assim que for confirmado, iniciaremos o preparo do seu pedido.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {paymentStatus === "failure" && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-red-700">Pagamento não Realizado</AlertTitle>
                        <AlertDescription className="text-red-600">
                          Seu pagamento não foi realizado e o pedido foi cancelado. Por favor, faça um novo pedido.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando detalhes do pedido...</p>
                  </div>
                ) : order ? (
                  <>
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Número do Pedido:</span>
                        <span className="font-bold">#{order.id}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Data do Pedido:</span>
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Status:</span>
                        <span className="bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full text-xs font-medium">
                          {order.status === "pending" ? "Pendente" : 
                           order.status === "confirmed" ? "Confirmado" : 
                           order.status === "preparing" ? "Em Preparo" : 
                           order.status === "delivering" ? "Em Entrega" : 
                           order.status === "completed" ? "Entregue" : 
                           order.status === "cancelled" ? "Cancelado" : 
                           order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Método de Pagamento:</span>
                        <span>{order.paymentMethod === "credit_card" ? "Cartão de Crédito" : 
                              order.paymentMethod === "cash_on_delivery" ? "Dinheiro na Entrega" : 
                              order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-heading font-medium text-lg mb-3">Itens do Pedido</h3>
                    <div className="space-y-2 mb-4">
                      {(order.items as any[]).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between py-2 border-b last:border-0">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.description && (
                              <div className="text-xs text-gray-600">
                                {item.description}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              Qtd: {item.quantity}
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
                        <span>Taxa de Entrega</span>
                        <span>{formatCurrency(order.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                    
                    {order.address && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-md">
                        <h3 className="font-heading font-medium text-lg mb-2">Endereço de Entrega</h3>
                        <p className="text-gray-700 whitespace-pre-line">{order.address}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      <Link href="/">
                        <Button variant="outline" className="w-full">
                          <Home className="mr-2 h-4 w-4" />
                          Voltar para a Página Inicial
                        </Button>
                      </Link>
                      
                      {paymentStatus === 'failure' ? (
                        <Link href="/menu">
                          <Button className="w-full bg-primary hover:bg-red-700">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Fazer Novo Pedido
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/track-order/${order.id}`}>
                          <Button className="w-full bg-primary hover:bg-red-700">
                            <Eye className="mr-2 h-4 w-4" />
                            Acompanhar Pedido
                          </Button>
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Detalhes do pedido não encontrados.</p>
                    <Link href="/">
                      <Button className="mt-4">
                        Voltar para a Página Inicial
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
