import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, Home, MapPin, Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Address } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const addressSchema = z.object({
  street: z.string().min(3, { message: "O endereço deve ter pelo menos 3 caracteres" }),
  number: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, { message: "Bairro é obrigatório" }),
  city: z.string().min(2, { message: "Cidade é obrigatória" }),
  state: z.string().length(2, { message: "Use a sigla do estado com 2 letras" }),
  zipCode: z.string().min(8, { message: "CEP é obrigatório" }),
  isFavorite: z.boolean().default(false)
});

type AddressFormValues = z.infer<typeof addressSchema>;

function AddressItem({ address, onEdit, onDelete, onSetFavorite }: { 
  address: Address,
  onEdit: (address: Address) => void,
  onDelete: (id: number) => void, 
  onSetFavorite: (id: number) => void
}) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{address.street}, {address.number}</CardTitle>
            {address.isFavorite && (
              <Badge variant="outline" className="ml-2 text-green-500 border-green-500">
                <CheckCircle className="h-3 w-3 mr-1" /> Principal
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          {address.complement && <p>{address.complement}</p>}
          <p>{address.neighborhood}</p>
          <p>{address.city}, {address.state}</p>
          <p>CEP: {address.zipCode}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        {!address.isFavorite && (
          <Button variant="ghost" size="sm" onClick={() => onSetFavorite(address.id)}>
            Definir como Principal
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          <Edit className="h-4 w-4 mr-1" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(address.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddressForm({ 
  defaultValues, 
  onSubmit, 
  isSubmitting, 
  mode = "new"
}: {
  defaultValues?: AddressFormValues,
  onSubmit: (data: AddressFormValues) => void,
  isSubmitting: boolean,
  mode?: "new" | "edit"
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      isFavorite: false
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua/Avenida</FormLabel>
                <FormControl>
                  <Input placeholder="Rua das Flores" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="complement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Apto 101, Bloco B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Centro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado (UF)</FormLabel>
                <FormControl>
                  <Input placeholder="SP" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input placeholder="00000-000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isFavorite"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Definir como endereço principal
                </FormLabel>
                <FormDescription>
                  Este endereço será usado como padrão na hora do checkout
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "new" ? "Adicionar Endereço" : "Atualizar Endereço"}
        </Button>
      </form>
    </Form>
  );
}

function AddressesTab() {
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);

  // Buscar os endereços do usuário
  const { 
    data: addresses = [] as Address[], 
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses
  } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
    retry: false
  });
  
  // Adicionar endereço
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormValues) => {
      const res = await apiRequest('POST', '/api/addresses', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setIsAddressFormOpen(false);
      toast({
        title: "Endereço adicionado",
        description: "Seu endereço foi adicionado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar endereço",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Atualizar endereço
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: AddressFormValues }) => {
      const res = await apiRequest('PUT', `/api/addresses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setEditingAddress(null);
      toast({
        title: "Endereço atualizado",
        description: "Seu endereço foi atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar endereço",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Excluir endereço
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/addresses/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      setDeleteAddressId(null);
      toast({
        title: "Endereço excluído",
        description: "Seu endereço foi excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir endereço",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Definir endereço como favorito
  const setFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('PUT', `/api/addresses/${id}/favorite`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      toast({
        title: "Endereço principal atualizado",
        description: "Seu endereço principal foi atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao definir endereço principal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Funções de manipulação
  const handleAddAddress = (data: AddressFormValues) => {
    addAddressMutation.mutate(data);
  };

  const handleUpdateAddress = (data: AddressFormValues) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data });
    }
  };

  const handleDeleteAddress = () => {
    if (deleteAddressId !== null) {
      deleteAddressMutation.mutate(deleteAddressId);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
  };

  const handleSetFavorite = (id: number) => {
    setFavoriteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Meus Endereços</h3>
        <Button 
          onClick={() => setIsAddressFormOpen(true)} 
          disabled={addresses.length >= 3}
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Endereço
        </Button>
      </div>
      
      {addresses.length >= 3 && (
        <p className="text-sm text-muted-foreground">
          Você atingiu o limite máximo de 3 endereços.
        </p>
      )}
      
      {isLoadingAddresses ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum endereço cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione um endereço para facilitar suas compras futuras
          </p>
          <Button 
            onClick={() => setIsAddressFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Endereço
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressItem 
              key={address.id} 
              address={address} 
              onEdit={handleEditAddress}
              onDelete={(id) => setDeleteAddressId(id)}
              onSetFavorite={handleSetFavorite}
            />
          ))}
        </div>
      )}
      
      {/* Modal para adicionar endereço */}
      <Sheet open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Adicionar Endereço</SheetTitle>
            <SheetDescription>
              Preencha os campos para adicionar um novo endereço de entrega
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <AddressForm 
              onSubmit={handleAddAddress} 
              isSubmitting={addAddressMutation.isPending}
              mode="new"
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Modal para editar endereço */}
      <Sheet open={!!editingAddress} onOpenChange={(open) => !open && setEditingAddress(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Editar Endereço</SheetTitle>
            <SheetDescription>
              Atualize as informações do seu endereço
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {editingAddress && (
              <AddressForm 
                defaultValues={{
                  street: editingAddress.street,
                  number: editingAddress.number,
                  complement: editingAddress.complement || "",
                  neighborhood: editingAddress.neighborhood,
                  city: editingAddress.city,
                  state: editingAddress.state,
                  zipCode: editingAddress.zipCode,
                  isFavorite: editingAddress.isFavorite || false
                }}
                onSubmit={handleUpdateAddress} 
                isSubmitting={updateAddressMutation.isPending}
                mode="edit"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Modal de confirmação para excluir */}
      <Dialog open={deleteAddressId !== null} onOpenChange={(open) => !open && setDeleteAddressId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Endereço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAddressId(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAddress}
              disabled={deleteAddressMutation.isPending}
            >
              {deleteAddressMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileDataTab() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Dados Pessoais</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Nome</h4>
                <p>{user?.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Nome de Usuário</h4>
                <p>{user?.username}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">E-mail</h4>
                <p>{user?.email}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="ml-auto" disabled>
              <Edit className="h-4 w-4 mr-2" /> Editar Dados (Em breve)
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Senha</h3>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Aqui você pode alterar sua senha para manter sua conta segura.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="ml-auto" disabled>
              <Edit className="h-4 w-4 mr-2" /> Alterar Senha (Em breve)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="text-center p-8">
      <h3 className="text-lg font-medium mb-2">Histórico de Pedidos</h3>
      <p className="text-muted-foreground">
        Funcionalidade em desenvolvimento. Em breve você poderá ver todo o seu histórico de pedidos aqui.
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirecionar para a página de login se não estiver autenticado
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Redireciona no useEffect
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/")}
          className="mr-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </Button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie seus dados pessoais, endereços e veja seu histórico de pedidos
        </p>
      </div>
      
      <Tabs defaultValue="addresses">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="addresses">Endereços</TabsTrigger>
          <TabsTrigger value="profile">Meus Dados</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="addresses" className="mt-6">
          <AddressesTab />
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <ProfileDataTab />
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}