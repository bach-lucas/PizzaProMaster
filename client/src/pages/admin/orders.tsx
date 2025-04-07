import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
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
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Search, Package, RefreshCw } from "lucide-react";

export default function Orders() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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
        title: "Order status updated",
        description: "The order status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
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
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Order columns for the data table
  const orderColumns = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (row: Order) => <span className="font-medium">#{row.id}</span>,
    },
    {
      header: "Customer",
      accessorKey: (row: Order) => row.userId ? `User #${row.userId}` : "Guest",
    },
    {
      header: "Items",
      accessorKey: (row: Order) => {
        const items = row.items as any[];
        const itemText = items.map(item => `${item.quantity}x ${item.name}`).join(", ");
        return itemText.length > 40 ? `${itemText.substring(0, 40)}...` : itemText;
      },
    },
    {
      header: "Total",
      accessorKey: (row: Order) => formatCurrency(row.total),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Order) => {
        const statusMap: Record<string, { color: string; label: string }> = {
          pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
          preparing: { color: "bg-blue-100 text-blue-800", label: "Preparing" },
          in_transit: { color: "bg-indigo-100 text-indigo-800", label: "In Transit" },
          delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
          cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
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
      header: "Date",
      accessorKey: (row: Order) => formatDate(row.createdAt),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: Order) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => viewOrderDetails(row)}
          >
            View
          </Button>
          <Select
            defaultValue={row.status}
            onValueChange={(value) => handleStatusChange(row.id, value)}
            disabled={updateOrderStatusMutation.isPending}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold flex items-center">
            <ClipboardList className="mr-2 h-7 w-7" />
            Orders Management
          </h1>
          <p className="text-gray-600">View and manage customer orders</p>
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
                  All Orders
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-sm text-yellow-700">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="preparing" className="text-sm text-blue-700">
                  Preparing
                </TabsTrigger>
                <TabsTrigger value="in_transit" className="text-sm text-indigo-700">
                  In Transit
                </TabsTrigger>
                <TabsTrigger value="delivered" className="text-sm text-green-700">
                  Delivered
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="text-sm text-red-700">
                  Cancelled
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Orders</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {statusFilter === "all" 
                    ? "There are no orders in the system yet." 
                    : `There are no orders with status "${statusFilter}".`}
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

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <Package className="mr-2 h-5 w-5" /> 
                  Order #{selectedOrder.id}
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(selectedOrder.createdAt)}
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
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('_', ' ')}
                    </Badge>
                    <div className="ml-4">
                      <Select
                        defaultValue={selectedOrder.status}
                        onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-gray-500">Customer</h3>
                  <p>User ID: {selectedOrder.userId || "Guest"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-gray-500">Delivery Address</h3>
                  <p className="whitespace-pre-line">{selectedOrder.address || "No address provided"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-gray-500">Payment Method</h3>
                  <p>{selectedOrder.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
              </div>

              <Separator />

              <div className="py-4">
                <h3 className="font-medium mb-4">Order Items</h3>
                <div className="space-y-3">
                  {(selectedOrder.items as any[]).map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                          {item.specialInstructions && (
                            <div className="italic mt-1">"{item.specialInstructions}"</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{formatCurrency(item.price * item.quantity)}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.price)} each
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
                    <span>Delivery Fee</span>
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
      </div>
    </div>
  );
}
