import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { User } from "@shared/schema";
import { Users as UsersIcon, ChevronDown, UserCheck, UserMinus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAdminLogs } from "@/hooks/use-admin-logs";

import { AdminLayout } from "@/components/layout/admin-layout";

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { logAction } = useAdminLogs();
  
  // Fetch all users
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  // State para o modal de confirmação de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number, name: string, username: string } | null>(null);
  
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
        `Administrador alterou função de usuário
${variables.username} → ${getRoleName(variables.newRole)}`
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
  
  // Mutation para excluir usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao excluir usuário");
      }
      return true;
    },
    onSuccess: (_, userId) => {
      // Registra a ação no log do administrador
      if (userToDelete) {
        logAction(
          "delete",
          "user",
          userId,
          `Administrador excluiu usuário
${userToDelete.username} (${userToDelete.name})`
        );
      }
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteModalOpen(false);
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
      setDeleteModalOpen(false);
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

  // Adicionar coluna de exclusão de usuário somente para admin_master
  if (currentUser?.role === "admin_master") {
    userColumns.push({
      header: "Excluir",
      id: "delete",
      cell: (row: any) => {
        // Não permitir exclusão do próprio usuário ou do admin_master
        const isSelf = row.id === currentUser?.id;
        const isAdminMaster = row.role === "admin_master";
        
        if (isSelf || isAdminMaster || row.id === 1) {
          return null;
        }
        
        return (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              setUserToDelete({
                id: row.id,
                name: row.name,
                username: row.username
              });
              setDeleteModalOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      }
    });
  }

  return (
    <AdminLayout title="Gerenciamento de Usuários" showBackButton>
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerencie contas de usuários e permissões</CardDescription>
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
      
      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <span className="font-bold">{userToDelete?.name}</span> ({userToDelete?.username})?
              <br />
              <br />
              <span className="text-red-600 font-semibold">Atenção:</span> Esta ação não pode ser desfeita.
              Todos os dados associados a este usuário também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90" 
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
