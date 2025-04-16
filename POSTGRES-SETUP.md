# Configuração do Projeto com PostgreSQL Local

Este guia explica como configurar o projeto PizzaApp para execução local usando PostgreSQL.

## Requisitos

- Node.js v16 ou superior
- npm v7 ou superior
- PostgreSQL 14+ instalado localmente

## Passos para Configuração

### 1. Clonar e Preparar o Projeto

1. Faça o download do projeto completo
2. Instale as dependências:
   ```bash
   npm install
   ```

### 2. Configurar o Banco de Dados PostgreSQL

1. Crie um banco de dados para o projeto:
   ```bash
   createdb pizzaapp
   ```

2. Crie as tabelas usando o esquema exportado:
   ```bash
   psql -d pizzaapp -f create-database.sql
   ```

3. Popule o banco com os dados de demonstração:
   ```bash
   psql -d pizzaapp -f postgres-demo-data.sql
   ```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL=postgres://seu_usuario:sua_senha@localhost:5432/pizzaapp
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGPORT=5432
PGDATABASE=pizzaapp
PGHOST=localhost
```

Se quiser habilitar pagamentos via Mercado Pago, adicione:
```
MERCADOPAGO_ACCESS_TOKEN=seu_token_de_acesso
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica
```

### 4. Criar a Pasta de Imagens

```bash
mkdir -p client/public/images
```

### 5. Adicionar Imagens de Exemplo

Adicione as seguintes imagens na pasta `client/public/images`:
- margherita.jpg - Pizza Margherita
- calabresa.jpg - Pizza Calabresa
- cola.jpg - Refrigerante
- petit-gateau.jpg - Sobremesa
- pao-de-alho.jpg - Pão de alho
- combo-familia.jpg - Combo família
- pizza-do-dia.jpg - Pizza do dia

### 6. Iniciar o Servidor

```bash
npm run dev
```

Acesse o projeto em http://localhost:5000 (ou a porta configurada)

## Contas de Acesso

### Administrador Master
- Usuário: admin
- Senha: admin123

### Gerente
- Usuário: gerente
- Senha: admin123

### Cliente
- Usuário: cliente
- Senha: admin123

## Solução de Problemas

### Erro de Conexão com o Banco de Dados

- Verifique se o PostgreSQL está em execução
- Confirme se as credenciais no arquivo `.env` estão corretas
- Teste a conexão com: `psql -d pizzaapp -U seu_usuario`

### Erros de Importação de Dados

Se ocorrerem erros durante a importação dos dados:

1. Limpe as tabelas existentes:
   ```sql
   TRUNCATE users, categories, menu_items, special_offers, addresses, orders, system_settings CASCADE;
   ```

2. Tente importar novamente:
   ```bash
   psql -d pizzaapp -f postgres-demo-data.sql
   ```

### Problemas com o Mercado Pago

Certifique-se de que as chaves do Mercado Pago estão configuradas corretamente no arquivo `.env`.

## Suporte

Para problemas, dúvidas ou sugestões, consulte a documentação ou entre em contato com o desenvolvedor.