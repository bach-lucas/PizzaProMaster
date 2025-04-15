import mercadopago from 'mercadopago';
import { OrderItem } from '@shared/schema';
import { Request } from 'express';

// Configurando o SDK do MercadoPago com o token de acesso
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado no ambiente');
}

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Interface para os dados necessários ao criar uma preferência de pagamento
interface CreatePreferenceData {
  items: OrderItem[];
  userId: number;
  userName: string;
  userEmail: string;
  orderId: number;
  total: number;
  paymentMethod?: string;
}

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * @param data Dados para criar a preferência
 * @param req Request para obter a URL base
 * @returns Objeto com URL para pagamento e ID da preferência
 */
export async function createPaymentPreference(
  data: CreatePreferenceData,
  req: Request
): Promise<{ initPoint: string; preferenceId: string }> {
  // Obter URL base para redirecionamentos
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;

  // Mapear itens para o formato esperado pelo Mercado Pago
  const items = data.items.map((item) => ({
    id: item.id.toString(),
    title: item.name,
    description: item.description || '',
    picture_url: item.imageUrl || '',
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: 'BRL', // Moeda brasileira (Real)
  }));

  // Criar preferência de pagamento
  const preference = {
    items,
    payer: {
      name: data.userName,
      email: data.userEmail,
    },
    payment_methods: {
      excluded_payment_types: [], // Não exclui nenhum método de pagamento
      installments: 3, // Parcelas máximas
    },
    external_reference: data.orderId.toString(), // Referência ao ID do pedido
    back_urls: {
      success: `${baseUrl}/order-success/${data.orderId}?status=approved`,
      failure: `${baseUrl}/order-success/${data.orderId}?status=failure`,
      pending: `${baseUrl}/order-success/${data.orderId}?status=pending`,
    },
    auto_return: 'approved', // Redireciona automaticamente após pagamento aprovado
    statement_descriptor: 'PIZZARIA APP', // Aparece na fatura do cartão
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    
    return {
      initPoint: response.body.init_point,
      preferenceId: response.body.id,
    };
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento no Mercado Pago:', error);
    throw new Error('Falha ao processar pagamento com Mercado Pago');
  }
}

/**
 * Verifica o status de um pagamento
 * @param paymentId ID do pagamento no Mercado Pago
 * @returns Status do pagamento
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await mercadopago.payment.get(paymentId);
    return response.body.status;
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    throw error;
  }
}

/**
 * Cancela um pagamento
 * @param paymentId ID do pagamento no Mercado Pago
 * @returns Resultado da operação
 */
export async function cancelPayment(paymentId: string) {
  try {
    const response = await mercadopago.payment.cancel(paymentId);
    return response.body;
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    throw error;
  }
}

// Exporta o serviço
export const mercadoPagoService = {
  createPaymentPreference,
  getPaymentStatus,
  cancelPayment
};