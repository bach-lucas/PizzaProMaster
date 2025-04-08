import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface AdminLogData {
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: string | null;
}

/**
 * Hook para registrar ações administrativas no sistema de logs
 */
export function useAdminLogs() {
  const { toast } = useToast();

  const logAdminAction = useMutation({
    mutationFn: async (logData: AdminLogData) => {
      const res = await apiRequest("POST", "/api/admin/logs", logData);
      return await res.json();
    },
    onError: (error: Error) => {
      console.error("Erro ao registrar ação administrativa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a ação no log de administrador.",
        variant: "destructive",
      });
    },
  });

  return {
    logAction: (
      action: string,
      entityType: string,
      entityId?: number | null,
      details?: string | null
    ) => {
      logAdminAction.mutate({
        action,
        entityType,
        entityId,
        details,
      });
    },
  };
}