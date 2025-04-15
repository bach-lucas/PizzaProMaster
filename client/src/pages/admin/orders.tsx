import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAdminLogs } from "@/hooks/use-admin-logs";
import { ClipboardList, Search, Package, RefreshCw, Trash2 } from "lucide-react";

export default function Orders() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { logAction } = useAdminLogs();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Refetch every 30 seconds to get status updates
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status do pedido atualizado",
        description: "O status do pedido foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar status do pedido: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Pedido excluído",
        description: "O pedido foi excluído com sucesso.",
      });
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      
      // Log admin action
      logAction({
        action: "delete",
        entityType: "order",
        entityId: orderToDelete?.id || 0,
        details: `Excluiu o pedido #${orderToDelete?.id}`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao excluir o pedido: ${error.message}`,
        variant: "destructive",
      });
      setDeleteModalOpen(false);
    },
  });

  // Filter orders by status
  const filteredOrders = orders 
    ? statusFilter === "all" 
      ? orders 
      : orders.filter(order => order.status === statusFilter)
    : [];

  // Handle status change
  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
    
    // If the current order details dialog is open for this order, update its status locally too
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Open order details dialog
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Format date for display
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Order columns for the data table
  const orderColumns = [
    {
      header: "ID do Pedido",
      accessorKey: "id",
      cell: (row: Order) => <span className="font-medium">#{row.id}</span>,
    },
    {
      header: "Cliente",
      accessorKey: "userId",
      cell: (row: Order) => <span>{row.userId ? `Usuário #${row.userId}` : "Visitante"}</span>,
    },
    {
      header: "Itens",
      accessorKey: "items",
      cell: (row: Order) => {
        const items = row.items as any[];
        const itemText = items.map(item => `${item.quantity}x ${item.name}`).join(", ");
        return <span>{itemText.length > 40 ? `${itemText.substring(0, 40)}...` : itemText}</span>;
      },
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: (row: Order) => <span>{formatCurrency(row.total)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Order) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          pending: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" },
          preparing: { color: "bg-blue-100 text-blue-800", label: "Em Preparo" },
          in_transit: { color: "bg-indigo-100 text-indigo-800", label: "Em Trânsito" },
          delivered: { color: "bg-green-100 text-green-800", label: "Entregue" },
          cancelled: { color: "bg-red-100 text-red-800", label: "Cancelado" },
        };
        
        const status = statusMap[row.status] || { color: "bg-gray-100 text-gray-800", label: row.status };
        
        return (
          <Badge className={status.color}>
            {status.label}
          </Badge>
        );
      },
    },
    {
      header: "Data",
      accessorKey: "createdAt",
      cell: (row: Order) => <span>{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Ações",
      accessorKey: "id",
      cell: (row: Order) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => viewOrderDetails(row)}
          >
            Ver
          </Button>
          <Select
            defaultValue={row.status}
            onValueChange={(value) => handleStatusChange(row.id, value)}
            disabled={updateOrderStatusMutation.isPending}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Alterar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="preparing">Em Preparo</SelectItem>
              <SelectItem value="in_transit">Em Trânsito</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Somente admin_master pode excluir pedidos */}
          {currentUser?.role === 'admin_master' && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                setOrderToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Gerenciamento de Pedidos">
      <div className="mb-6">
        <p className="text-gray-600">Visualize e gerencie os pedidos dos clientes</p>
      </div>

      {/* Status filter tabs */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Tabs 
            defaultValue="all" 
            value={statusFilter} 
            onValueChange={setStatusFilter}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <TabsTrigger value="all" className="text-sm">
                Todos os Pedidos
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-sm text-yellow-700">
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="preparing" className="text-sm text-blue-700">
                Em Preparo
              </TabsTrigger>
              <TabsTrigger value="in_transit" className="text-sm text-indigo-700">
                Em Trânsito
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-sm text-green-700">
                Entregues
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-sm text-red-700">
                Cancelados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pedidos</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
          <CardDescription>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500">
                {statusFilter === "all" 
                  ? "Não há pedidos no sistema ainda." 
                  : `Não há pedidos com o status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <DataTable
              data={filteredOrders}
              columns={orderColumns}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Order Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido #{orderToDelete?.id}?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => orderToDelete && deleteOrderMutation.mutate(orderToDelete.id)}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>Excluir</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center text-xl">
                <Package className="mr-2 h-5 w-5" /> 
                Pedido #{selectedOrder.id}
              </DialogTitle>
              <DialogDescription>
                Realizado em {formatDate(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-medium mb-2 text-sm text-gray-500">Status</h3>
                <div className="flex items-center">
                  <Badge className={
                    selectedOrder.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    selectedOrder.status === "preparing" ? "bg-blue-100 text-blue-800" :
                    selectedOrder.status === "in_transit" ? "bg-indigo-100 text-indigo-800" :
                    selectedOrder.status === "delivered" ? "bg-green-100 text-green-800" :
                    selectedOrder.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }>
                    {selectedOrder.status === "pending" ? "Pendente" :
                     selectedOrder.status === "preparing" ? "Em Preparo" :
                     selectedOrder.status === "in_transit" ? "Em Trânsito" :
                     selectedOrder.status === "delivered" ? "Entregue" :
                     selectedOrder.status === "cancelled" ? "Cancelado" :
                     selectedOrder.status}
                  </Badge>
                  <div className="ml-4">
                    <Select
                      defaultValue={selectedOrder.status}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Alterar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="preparing">Em Preparo</SelectItem>
                        <SelectItem value="in_transit">Em Trânsito</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-sm text-gray-500">Cliente</h3>
                <p>ID do Usuário: {selectedOrder.userId || "Visitante"}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-sm text-gray-500">Endereço de Entrega</h3>
                <p className="whitespace-pre-line">{selectedOrder.address || "Nenhum endereço fornecido"}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-sm text-gray-500">Método de Pagamento</h3>
                <p>{selectedOrder.paymentMethod === "credit_card" ? "Cartão de Crédito" :
                    selectedOrder.paymentMethod === "debit_card" ? "Cartão de Débito" :
                    selectedOrder.paymentMethod === "cash" ? "Dinheiro" :
                    selectedOrder.paymentMethod === "pix" ? "PIX" :
                    selectedOrder.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
            </div>

            <Separator />

            <div className="py-4">
              <h3 className="font-medium mb-4">Itens do Pedido</h3>
              <div className="space-y-3">
                {(selectedOrder.items as any[]).map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Quantidade: {item.quantity}
                        {item.specialInstructions && (
                          <div className="italic mt-1">"{item.specialInstructions}"</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(item.price * item.quantity)}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.price)} cada
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
