import { OrderItem } from '@shared/schema';
import { Request } from 'express';
import axios from 'axios';

// Verificar se a chave de acesso está configurada
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado no ambiente');
}

// API de Mercado Pago - usando axios em vez do SDK problemático
const MERCADO_PAGO_API = {
  preferences: 'https://api.mercadopago.com/checkout/preferences',
  payments: 'https://api.mercadopago.com/v1/payments',
};

// Headers de autenticação
const headers = {
  'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

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
    const response = await axios.post(MERCADO_PAGO_API.preferences, preference, { headers });
    
    return {
      initPoint: response.data.init_point,
      preferenceId: response.data.id,
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
    const response = await axios.get(`${MERCADO_PAGO_API.payments}/${paymentId}`, { headers });
    return response.data.status;
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
    const response = await axios.put(`${MERCADO_PAGO_API.payments}/${paymentId}`, 
      { status: 'cancelled' }, 
      { headers }
    );
    return response.data;
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