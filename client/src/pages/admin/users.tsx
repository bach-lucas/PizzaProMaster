import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User } from "@shared/schema";
import { Users as UsersIcon, ChevronDown, UserCheck, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAdminLogs } from "@/hooks/use-admin-logs";

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { logAction } = useAdminLogs();
  
  // Fetch all users
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });
  
  // Mutation para alterar a função do usuário
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, username }: { userId: number, newRole: string, username: string }) => {
      const res = await apiRequest("PUT", `/api/users/${userId}/role`, { role: newRole });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Registra a ação no log de administrador
      logAction(
        "update_role",
        "user",
        variables.userId,
        `Alterou função do usuário ${variables.username} para ${getRoleName(variables.newRole)}`
      );
      
      toast({
        title: "Função alterada",
        description: "A função do usuário foi alterada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar função",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Função auxiliar para obter o nome legível da função
  const getRoleName = (role: string): string => {
    switch (role) {
      case "admin_master":
        return "Administrador Master";
      case "admin":
        return "Administrador";
      case "customer":
        return "Cliente";
      default:
        return role;
    }
  };

  // User columns for the data table
  const userColumns = [
    {
      header: "ID",
      accessorKey: "id" as const,
    },
    {
      header: "Nome",
      accessorKey: "name" as const,
      cell: (row: any) => <span className="font-medium">{row.name}</span>,
    },
    {
      header: "Usuário",
      accessorKey: "username" as const,
    },
    {
      header: "E-mail",
      accessorKey: "email" as const,
    },
    {
      header: "Função",
      accessorKey: "role" as const,
      cell: (row: any) => {
        let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
        let text = "Cliente";
        
        if (row.role === "admin") {
          variant = "default";
          text = "Admin";
        } else if (row.role === "admin_master") {
          variant = "destructive";
          text = "Admin Master";
        }
        
        return (
          <Badge variant={variant}>
            {text}
          </Badge>
        );
      },
    },
    {
      header: "Data de Cadastro",
      accessorKey: "createdAt" as const,
      cell: (row: any) => new Date(row.createdAt || Date.now()).toLocaleDateString('pt-BR'),
    },
    {
      header: "Ações",
      id: "actions",
      cell: (row: any) => {
        // Verificar se o usuário atual é admin_master
        const isCurrentUserMaster = currentUser?.role === "admin_master";
        // Não permitir que o usuário atual altere sua própria função
        const isSelf = row.id === currentUser?.id;
        
        // Se não for admin_master ou se for o próprio usuário, não mostrar opções de alteração
        if (!isCurrentUserMaster || isSelf) {
          return <span className="text-gray-400 text-sm">Não disponível</span>;
        }
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                Alterar Função <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => changeRoleMutation.mutate({ 
                  userId: row.id, 
                  newRole: "customer",
                  username: row.username
                })}
                disabled={row.role === "customer"}
                className="flex items-center"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Cliente
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeRoleMutation.mutate({ 
                  userId: row.id, 
                  newRole: "admin",
                  username: row.username
                })}
                disabled={row.role === "admin"}
                className="flex items-center"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Administrador
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeRoleMutation.mutate({ 
                  userId: row.id, 
                  newRole: "admin_master",
                  username: row.username
                })}
                disabled={row.role === "admin_master"}
                className="flex items-center"
              >
                <UserCheck className="mr-2 h-4 w-4 text-red-500" />
                Administrador Master
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold flex items-center">
            <UsersIcon className="mr-2 h-7 w-7" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">Gerencie contas de usuários e permissões</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">Carregando usuários...</p>
              </div>
            ) : users && users.length > 0 ? (
              <DataTable
                data={users as any[]}
                columns={userColumns as any[]}
              />
            ) : (
              <div className="py-16 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-500">
                  Não há usuários cadastrados no sistema ainda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
