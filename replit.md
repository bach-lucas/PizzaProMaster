# Bella Pizza - Sistema de Pedidos Online

## Visão Geral

Uma aplicação web moderna de restaurante de pizza oferecendo um sistema abrangente de pedidos online com interface dupla: área do cliente e painel administrativo. A aplicação está completamente em português brasileiro e utiliza integração com Mercado Pago para processamento de pagamentos.

## Arquitetura do Projeto

- **Frontend**: React.js com TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js/Express com TypeScript
- **Banco de Dados**: PostgreSQL com Drizzle ORM (atualmente usando armazenamento em memória devido a problemas de conexão)
- **Autenticação**: Sessões com Passport.js
- **Pagamentos**: Mercado Pago integration
- **Estilo**: Sistema de design customizado com cores da marca

## Funcionalidades Principais

### Interface do Cliente
- **Página Inicial**: Hero section, menu em destaque, ofertas especiais
- **Cardápio**: Visualização de itens por categoria com sistema de carrinho
- **Autenticação**: Login/registro com validação
- **Perfil**: Gerenciamento de endereços (máx. 3), histórico de pedidos
- **Checkout**: Processo streamlined com opção de entrega/retirada
- **Rastreamento**: Acompanhamento de pedidos em tempo real

### Painel Administrativo
- **Dashboard**: Estatísticas de vendas e pedidos
- **Gerenciamento de Menu**: CRUD completo para itens e categorias
- **Gerenciamento de Pedidos**: Visualização e atualização de status
- **Gerenciamento de Usuários**: Controle de papéis (admin/admin_master)
- **Configurações**: Horários de funcionamento, configurações de entrega
- **Logs de Auditoria**: Rastreamento de ações administrativas

## Tecnologias Utilizadas

- React.js + TypeScript
- Node.js + Express
- PostgreSQL + Drizzle ORM
- TanStack Query para gerenciamento de estado
- Tailwind CSS + shadcn/ui
- Passport.js para autenticação
- Mercado Pago SDK para pagamentos
- Wouter para roteamento

## Esquema de Cores

- **Primário**: #D73C2C (vermelho pizza)
- **Secundário**: #2C5530 (verde oliva)
- **Destaque**: #FFA41B (amarelo quente)
- **Neutros**: #FFFFFF (branco), #333333 (cinza escuro)

## Usuários de Teste

### Administradores
- **admin** / admin123 (admin_master)
- **gerente** / admin123 (admin_master)
- **lucasunzer** / admin123 (admin)

### Cliente
- **cliente** / admin123

## Mudanças Recentes

### 08/01/2025 - Remoção Completa da Funcionalidade de Customização de Pizza
- ✅ Removido todos os schemas relacionados à pizza customization do `shared/schema.ts`
- ✅ Removido todas as rotas de API `/api/pizza/*` do servidor
- ✅ Removido interface e implementações de pizza customization do `storage.ts`
- ✅ Removido links "Monte Sua Pizza" do header principal e menu mobile
- ✅ Limpeza completa de código relacionado à customização de pizza

### Funcionalidades Removidas
- Sistema de personalização de pizza (bases, tamanhos, massas, molhos, coberturas)
- Página "Monte Sua Pizza"
- APIs de customização de pizza
- Interface de construção de pizza personalizada

### Arquitetura Atual
O sistema agora foca exclusivamente em:
- Cardápio fixo com itens pré-definidos
- Sistema de carrinho simples
- Checkout streamlined
- Gerenciamento administrativo completo

## Preferências do Usuário

- Manter funcionalidade de customização de pizza removida permanentemente
- Foco no sistema de cardápio tradicional com itens fixos
- Interface em português brasileiro
- Design responsivo mobile-first
- Integração com Mercado Pago para pagamentos

## Notas Técnicas

- Usando armazenamento em memória temporariamente devido a problemas de conexão PostgreSQL
- Sistema de logging administrativo implementado para auditoria
- Controle de papéis granular (admin vs admin_master)
- Validação completa de formulários com Zod
- Sistema de notificações com toast