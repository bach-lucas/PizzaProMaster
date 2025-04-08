import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAdminLogs } from "@/hooks/use-admin-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Save,
  Clock,
  Truck,
  ShoppingBag,
  Bell,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  BusinessHours,
  DeliverySettings,
  OrderSettings,
  GeneralPreferences,
  businessHoursSchema,
  deliverySettingsSchema,
  orderSettingsSchema,
  generalPreferencesSchema
} from "@shared/schema";
import { z } from "zod";

// Types para a interface da página de configurações
interface DaySchedule {
  open: string;
  close: string;
  isClosed: boolean;
}

interface SystemSettings {
  businessHours: BusinessHours;
  deliverySettings: DeliverySettings;
  orderSettings: OrderSettings;
  preferences: GeneralPreferences;
}

// Componente principal da página de configurações
export default function SettingsPage() {
  const { toast } = useToast();
  const { logAction } = useAdminLogs();
  const [activeTab, setActiveTab] = useState("business-hours");
  
  // Buscar todas as configurações do sistema
  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/settings"],
  });

  // Função para exibir mensagem de erro
  const handleError = (error: Error, message: string) => {
    console.error(`Erro: ${message}`, error);
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações do Sistema</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="business-hours" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>Horário de Funcionamento</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center">
            <Truck className="mr-2 h-4 w-4" />
            <span>Entrega</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Preferências</span>
          </TabsTrigger>
        </TabsList>
        
        {settings && (
          <>
            <TabsContent value="business-hours">
              <BusinessHoursSettings 
                initialData={settings.businessHours} 
                onError={handleError} 
              />
            </TabsContent>
            
            <TabsContent value="delivery">
              <DeliverySettingsComponent 
                initialData={settings.deliverySettings} 
                onError={handleError} 
              />
            </TabsContent>
            
            <TabsContent value="orders">
              <OrderSettingsComponent 
                initialData={settings.orderSettings} 
                onError={handleError} 
              />
            </TabsContent>
            
            <TabsContent value="preferences">
              <PreferencesSettings 
                initialData={settings.preferences} 
                onError={handleError} 
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// Componente para configurações de horário de funcionamento
function BusinessHoursSettings({ 
  initialData, 
  onError 
}: { 
  initialData: BusinessHours; 
  onError: (error: Error, message: string) => void;
}) {
  const { toast } = useToast();
  const { logAction } = useAdminLogs();
  
  const form = useForm<z.infer<typeof businessHoursSchema>>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: initialData,
  });
  
  const mutation = useMutation({
    mutationFn: async (data: BusinessHours) => {
      const response = await fetch("/api/settings/business-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar horários de funcionamento");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Horários de funcionamento atualizados com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      onError(error, "Falha ao atualizar horários de funcionamento");
    },
  });
  
  const onSubmit = async (data: z.infer<typeof businessHoursSchema>) => {
    mutation.mutate(data);
  };
  
  const days = [
    { id: "monday", label: "Segunda-feira" },
    { id: "tuesday", label: "Terça-feira" },
    { id: "wednesday", label: "Quarta-feira" },
    { id: "thursday", label: "Quinta-feira" },
    { id: "friday", label: "Sexta-feira" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário de Funcionamento</CardTitle>
        <CardDescription>
          Configure os horários de abertura e fechamento do estabelecimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isManualClosed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Fechamento Manual</FormLabel>
                      <FormDescription>
                        Ative para fechar temporariamente o restaurante independente dos horários.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Separator className="my-4" />
              
              {days.map((day) => (
                <div key={day.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{day.label}</h3>
                    <FormField
                      control={form.control}
                      name={`${day.id}.isClosed` as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Fechado</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`${day.id}.open` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Abre às</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              value={field.value || ""}
                              disabled={form.watch(`${day.id}.isClosed` as any)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`${day.id}.close` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha às</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              value={field.value || ""}
                              disabled={form.watch(`${day.id}.isClosed` as any)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Componente para configurações de entrega
function DeliverySettingsComponent({ 
  initialData, 
  onError 
}: { 
  initialData: DeliverySettings; 
  onError: (error: Error, message: string) => void;
}) {
  const { toast } = useToast();
  const [newNeighborhood, setNewNeighborhood] = useState("");
  
  const form = useForm<z.infer<typeof deliverySettingsSchema>>({
    resolver: zodResolver(deliverySettingsSchema),
    defaultValues: initialData,
  });
  
  const mutation = useMutation({
    mutationFn: async (data: DeliverySettings) => {
      const response = await fetch("/api/settings/delivery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar configurações de entrega");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configurações de entrega atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      onError(error, "Falha ao atualizar configurações de entrega");
    },
  });
  
  const onSubmit = async (data: z.infer<typeof deliverySettingsSchema>) => {
    mutation.mutate(data);
  };
  
  const addNeighborhood = () => {
    if (newNeighborhood.trim() === "") return;
    
    const currentNeighborhoods = form.getValues("supportedNeighborhoods") || [];
    if (!currentNeighborhoods.includes(newNeighborhood)) {
      form.setValue("supportedNeighborhoods", [...currentNeighborhoods, newNeighborhood]);
      setNewNeighborhood("");
    }
  };
  
  const removeNeighborhood = (neighborhood: string) => {
    const currentNeighborhoods = form.getValues("supportedNeighborhoods") || [];
    form.setValue(
      "supportedNeighborhoods",
      currentNeighborhoods.filter(n => n !== neighborhood)
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Entrega</CardTitle>
        <CardDescription>
          Configure os parâmetros para entrega de pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Entrega (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Taxa base para entregas (pode ser 0 para entregas gratuitas)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minimumOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Mínimo do Pedido (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor mínimo para aceitar pedidos de entrega
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Estimado de Entrega (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Tempo médio para entrega dos pedidos
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Bairros Atendidos</FormLabel>
              <div className="flex space-x-2">
                <Input
                  value={newNeighborhood}
                  onChange={(e) => setNewNeighborhood(e.target.value)}
                  placeholder="Nome do bairro"
                  className="flex-1"
                />
                <Button type="button" onClick={addNeighborhood} variant="outline">
                  Adicionar
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                {form.watch("supportedNeighborhoods")?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {form.watch("supportedNeighborhoods").map((neighborhood) => (
                      <div
                        key={neighborhood}
                        className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {neighborhood}
                        <button
                          type="button"
                          onClick={() => removeNeighborhood(neighborhood)}
                          className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum bairro adicionado. Adicione bairros para definir as áreas de entrega.
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Componente para configurações de pedidos
function OrderSettingsComponent({ 
  initialData, 
  onError 
}: { 
  initialData: OrderSettings; 
  onError: (error: Error, message: string) => void;
}) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof orderSettingsSchema>>({
    resolver: zodResolver(orderSettingsSchema),
    defaultValues: initialData,
  });
  
  const mutation = useMutation({
    mutationFn: async (data: OrderSettings) => {
      const response = await fetch("/api/settings/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar configurações de pedidos");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configurações de pedidos atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      onError(error, "Falha ao atualizar configurações de pedidos");
    },
  });
  
  const onSubmit = async (data: z.infer<typeof orderSettingsSchema>) => {
    mutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Pedidos</CardTitle>
        <CardDescription>
          Configure os parâmetros para realização de pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="allowDelivery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Permitir Entrega</FormLabel>
                      <FormDescription>
                        Ative para permitir pedidos com entrega
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowPickup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Permitir Retirada</FormLabel>
                      <FormDescription>
                        Ative para permitir pedidos com retirada no local
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedPickupTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado para Retirada (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={!form.watch("allowPickup")}
                      />
                    </FormControl>
                    <FormDescription>
                      Tempo médio para preparação dos pedidos para retirada
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Componente para preferências gerais
function PreferencesSettings({ 
  initialData, 
  onError 
}: { 
  initialData: GeneralPreferences; 
  onError: (error: Error, message: string) => void;
}) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof generalPreferencesSchema>>({
    resolver: zodResolver(generalPreferencesSchema),
    defaultValues: initialData,
  });
  
  const mutation = useMutation({
    mutationFn: async (data: GeneralPreferences) => {
      const response = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar preferências gerais");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Preferências gerais atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: Error) => {
      onError(error, "Falha ao atualizar preferências gerais");
    },
  });
  
  const onSubmit = async (data: z.infer<typeof generalPreferencesSchema>) => {
    mutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências Gerais</CardTitle>
        <CardDescription>
          Configure preferências gerais do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newOrderSound"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Som de Novos Pedidos</FormLabel>
                      <FormDescription>
                        Ative para tocar um som quando novos pedidos chegarem
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="showAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Mostrar Alertas</FormLabel>
                      <FormDescription>
                        Ative para mostrar alertas importantes no painel
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendCustomerNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notificação ao Cliente</FormLabel>
                      <FormDescription>
                        Ative para enviar notificações automáticas aos clientes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("sendCustomerNotifications") && (
                <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Configuração de Email Necessária
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Para enviar notificações aos clientes, é necessário configurar o serviço de email nas configurações do sistema. Consulte a documentação para mais informações.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}