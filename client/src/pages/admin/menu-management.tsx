import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { MenuItem, Category, SpecialOffer } from "@shared/schema";
import { PlusCircle, Edit, Trash, Tag, Pizza, Tag as TagIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function MenuManagement() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<"menuItem" | "offer" | "category">("menuItem");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch menu items
  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch special offers
  const { data: specialOffers, isLoading: isLoadingOffers } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/offers"],
  });

  // Delete mutations
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/offer/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Special offer deleted",
        description: "The special offer has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete special offer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/category/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete confirmation
  const handleDelete = () => {
    if (!deleteItemId) return;

    if (deleteItemType === "menuItem") {
      deleteMenuItemMutation.mutate(deleteItemId);
    } else if (deleteItemType === "offer") {
      deleteOfferMutation.mutate(deleteItemId);
    } else if (deleteItemType === "category") {
      deleteCategoryMutation.mutate(deleteItemId);
    }

    setShowDeleteDialog(false);
    setDeleteItemId(null);
  };

  // Show delete confirmation dialog
  const confirmDelete = (id: number, type: "menuItem" | "offer" | "category") => {
    setDeleteItemId(id);
    setDeleteItemType(type);
    setShowDeleteDialog(true);
  };

  // Menu item columns
  const menuItemColumns = [
    {
      header: "Image",
      accessorKey: "imageUrl",
      cell: (row: MenuItem) => (
        <img 
          src={row.imageUrl} 
          alt={row.name} 
          className="h-10 w-10 object-cover rounded" 
        />
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row: MenuItem) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Category",
      accessorKey: (row: MenuItem) => {
        const category = categories?.find(c => c.id === row.categoryId);
        return category?.name || "Unknown";
      },
    },
    {
      header: "Price",
      accessorKey: (row: MenuItem) => formatCurrency(row.price),
    },
    {
      header: "Status",
      accessorKey: "available",
      cell: (row: MenuItem) => (
        <Badge variant={row.available ? "default" : "secondary"}>
          {row.available ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      header: "Tags",
      accessorKey: "tags",
      cell: (row: MenuItem) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: MenuItem) => (
        <div className="flex space-x-2">
          <Link href={`/admin/menu/edit/${row.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-900">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-900"
            onClick={() => confirmDelete(row.id, "menuItem")}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  // Special offer columns
  const offerColumns = [
    {
      header: "Image",
      accessorKey: "imageUrl",
      cell: (row: SpecialOffer) => (
        <img 
          src={row.imageUrl} 
          alt={row.name} 
          className="h-10 w-10 object-cover rounded" 
        />
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (row: SpecialOffer) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Price",
      accessorKey: (row: SpecialOffer) => (
        <div>
          <span className="font-medium">{formatCurrency(row.price)}</span>
          <span className="ml-2 line-through text-sm text-gray-500">{formatCurrency(row.originalPrice)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "active",
      cell: (row: SpecialOffer) => (
        <Badge variant={row.active ? "default" : "secondary"}>
          {row.active ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: SpecialOffer) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-900"
            onClick={() => confirmDelete(row.id, "offer")}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  // Category columns
  const categoryColumns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row: Category) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Slug",
      accessorKey: "slug",
    },
    {
      header: "Items Count",
      accessorKey: (row: Category) => {
        const count = menuItems?.filter(item => item.categoryId === row.id).length || 0;
        return count;
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: Category) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-900"
            onClick={() => confirmDelete(row.id, "category")}
            disabled={menuItems?.some(item => item.categoryId === row.id)}
            title={menuItems?.some(item => item.categoryId === row.id) ? "Cannot delete category with menu items" : ""}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  // Filter menu items by category for tab view
  const getFilteredMenuItems = () => {
    if (!menuItems) return [];
    if (activeTab === "all") return menuItems;
    
    const categoryId = parseInt(activeTab);
    if (isNaN(categoryId)) return menuItems;
    
    return menuItems.filter(item => item.categoryId === categoryId);
  };

  return (
    <AdminLayout title="Gerenciamento de Cardápio">
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600">Adicione, edite e gerencie os itens do cardápio</p>
          </div>
          <Link href="/admin/menu/create">
            <Button className="bg-primary hover:bg-red-700">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Item
            </Button>
          </Link>
        </div>
        
        {/* Menu Categories Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex overflow-x-auto">
              <TabsTrigger value="all">Todos os Itens</TabsTrigger>
              {!isLoadingCategories && categories?.map(category => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
              <TabsTrigger value="offers">Ofertas Especiais</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Table Content */}
        <Card>
          <CardContent className="p-0">
            {activeTab === "offers" ? (
              <div className="py-6 px-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-semibold flex items-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Ofertas Especiais
                  </h2>
                </div>
                {isLoadingOffers ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando ofertas especiais...</p>
                  </div>
                ) : (
                  <DataTable
                    data={specialOffers || []}
                    columns={offerColumns as any[]}
                  />
                )}
              </div>
            ) : activeTab === "categories" ? (
              <div className="py-6 px-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-semibold flex items-center">
                    <TagIcon className="mr-2 h-5 w-5" />
                    Categorias
                  </h2>
                </div>
                {isLoadingCategories ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando categorias...</p>
                  </div>
                ) : (
                  <DataTable
                    data={categories || []}
                    columns={categoryColumns as any[]}
                  />
                )}
              </div>
            ) : (
              <div className="py-6 px-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-semibold flex items-center">
                    <Pizza className="mr-2 h-5 w-5" />
                    Itens do Cardápio
                  </h2>
                </div>
                {isLoadingMenuItems ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando itens do cardápio...</p>
                  </div>
                ) : (
                  <DataTable
                    data={getFilteredMenuItems()}
                    columns={menuItemColumns as any[]}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o {deleteItemType === "menuItem" 
                ? "item do cardápio" 
                : deleteItemType === "offer" 
                  ? "oferta especial" 
                  : "categoria"}
              {deleteItemType === "menuItem" && " e o removerá do menu"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMenuItemMutation.isPending || deleteOfferMutation.isPending || deleteCategoryMutation.isPending 
                ? "Excluindo..." 
                : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
