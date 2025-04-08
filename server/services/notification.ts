import { storage } from "../storage";
import { User, Order } from "@shared/schema";
import type { GeneralPreferences } from "@shared/schema";

/**
 * Serviço para gerenciar o envio de notificações automáticas para clientes
 */
export class NotificationService {
  /**
   * Verifica se as notificações automáticas estão ativadas nas configurações
   */
  private async isEnabled(): Promise<boolean> {
    try {
      const preferences = await storage.getGeneralPreferences();
      return preferences.sendCustomerNotifications;
    } catch (error) {
      console.error("Erro ao verificar configurações de notificação:", error);
      return false;
    }
  }

  /**
   * Envia uma notificação quando um pedido é criado
   * @param order O pedido criado
   * @param user O usuário que fez o pedido
   */
  async notifyOrderCreated(order: Order, user: User): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    if (!isEnabled) return false;

    try {
      console.log(`[NOTIFICAÇÃO] Pedido #${order.id} criado para ${user.name}`);
      // TODO: Implementar envio real de notificação
      this.logNotification({
        type: "order_created",
        recipientId: user.id,
        message: `Seu pedido #${order.id} foi recebido e está sendo processado. Valor total: R$ ${order.total.toFixed(2)}`,
        metadata: {
          orderId: order.id,
          orderTotal: order.total,
        }
      });
      return true;
    } catch (error) {
      console.error("Erro ao enviar notificação de pedido criado:", error);
      return false;
    }
  }

  /**
   * Envia uma notificação quando o status de um pedido é atualizado
   * @param order O pedido atualizado
   * @param user O usuário que fez o pedido
   */
  async notifyOrderStatusUpdated(order: Order, user: User): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    if (!isEnabled) return false;

    try {
      console.log(`[NOTIFICAÇÃO] Status do pedido #${order.id} atualizado para ${order.status}`);
      
      let message = "";
      switch (order.status) {
        case "processing":
          message = `Seu pedido #${order.id} está sendo preparado.`;
          break;
        case "ready":
          message = `Seu pedido #${order.id} está pronto para entrega ou retirada.`;
          break;
        case "out_for_delivery":
        case "in_transit":
          message = `Seu pedido #${order.id} saiu para entrega. Chegará em breve!`;
          break;
        case "delivered":
          message = `Seu pedido #${order.id} foi entregue. Aproveite sua refeição!`;
          break;
        case "completed":
          message = `Seu pedido #${order.id} foi concluído. Obrigado por escolher a DeliciaPizza!`;
          break;
        case "cancelled":
          message = `Seu pedido #${order.id} foi cancelado. Entre em contato para mais informações.`;
          break;
        default:
          message = `Seu pedido #${order.id} teve seu status atualizado para ${order.status}.`;
      }

      // TODO: Implementar envio real de notificação
      this.logNotification({
        type: "order_status_updated",
        recipientId: user.id,
        message,
        metadata: {
          orderId: order.id,
          orderStatus: order.status,
        }
      });
      return true;
    } catch (error) {
      console.error("Erro ao enviar notificação de status atualizado:", error);
      return false;
    }
  }

  /**
   * Registra a notificação no log para fins de demonstração
   */
  private logNotification(notification: {
    type: string;
    recipientId: number;
    message: string;
    metadata?: Record<string, any>;
  }) {
    // Em um sistema real, isto seria armazenado em um banco de dados
    console.log("[NOTIFICAÇÃO ENVIADA]", JSON.stringify(notification, null, 2));
  }
}

// Singleton para uso em toda a aplicação
export const notificationService = new NotificationService();