import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLog, User } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Estende o tipo AdminLog para incluir informações do admin
interface AdminLogWithUserInfo extends AdminLog {
  admin: {
    id: number;
    name: string;
    username: string;
  };
}

export default function AdminLogs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  // Buscar logs de administrador
  const { data: logs, isLoading, error } = useQuery<AdminLogWithUserInfo[]>({
    queryKey: ["/api/admin/logs"],
  });
  
  // Buscar lista de usuários para mostrar nomes em vez de IDs
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!logs, // só executa se logs estiverem carregados
  });
  
  // Mostrar mensagem de erro se houver
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs. Verifique sua permissão.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filtrar logs
  const filteredLogs = logs
    ? logs.filter((log) => {
        const matchesSearch =
          searchTerm === "" ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
          log.admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.admin.username.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = actionFilter === "all" || log.action === actionFilter;

        return matchesSearch && matchesAction;
      })
    : [];

  // Obter a lista de ações únicas para o filtro
  const [uniqueActions, setUniqueActions] = useState<string[]>([]);
  
  // Atualizar ações únicas quando logs mudar
  useEffect(() => {
    if (logs && logs.length > 0) {
      const actionsSet = new Set<string>();
      logs.forEach(log => {
        if (log.action) {
          actionsSet.add(log.action);
        }
      });
      setUniqueActions(Array.from(actionsSet));
    }
  }, [logs]);

  // Mapear tipos de ação para cores de badge
  const actionColorMap: Record<string, string> = {
    update_role: "bg-blue-500",
    create: "bg-green-500",
    update: "bg-amber-500",
    delete: "bg-red-500",
    login: "bg-purple-500",
    logout: "bg-slate-500",
  };

  // Mapear tipos de entidade para rótulos em português
  const entityTypeLabels: Record<string, string> = {
    user: "Usuário",
    category: "Categoria",
    menu_item: "Item do Menu",
    order: "Pedido",
    special_offer: "Oferta Especial",
    admin: "Administrador",
  };

  // Mapear ações para rótulos em português
  const actionLabels: Record<string, string> = {
    update_role: "Alteração de Função",
    create: "Criação",
    update: "Atualização",
    delete: "Exclusão",
    login: "Login",
    logout: "Logout",
  };
  
  // Função para buscar nome do usuário com base no ID da entidade
  const getUserNameById = (id: number | null | undefined) => {
    if (!id || !users) return "-";
    const user = users.find((u: User) => u.id === id);
    return user ? `${user.name} (@${user.username})` : `ID: ${id}`;
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Logs de Administrador</h1>
        <Link href="/admin">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardDescription>
            Histórico de todas as ações realizadas pelos administradores no sistema
          </CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {actionLabels[action] || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log de administrador encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {log.createdAt ? format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.admin.name}</div>
                        <div className="text-sm text-muted-foreground">@{log.admin.username}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColorMap[log.action] || ""}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entityTypeLabels[log.entityType] || log.entityType}
                      </TableCell>
                      <TableCell>
                        {log.entityType === 'user' 
                          ? getUserNameById(log.entityId) 
                          : (log.entityId || "-")}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}