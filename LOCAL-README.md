# Execução Local do Projeto PizzaApp

## Requisitos
- Node.js v16 ou superior
- npm v7 ou superior

## Instruções para Executar Localmente

1. **Instalar Dependências**
   ```bash
   npm install
   npm install better-sqlite3 drizzle-orm
   ```

2. **Inicializar Banco de Dados Local**
   ```bash
   npm run init-local-db
   ```

3. **Importar Dados Iniciais (Opcional)**
   ```bash
   # SQLite
   sqlite3 local-database.db < demo-data.sql

   # Ou usando a interface CLI do SQLite
   sqlite3 local-database.db
   .read demo-data.sql
   .exit
   ```

4. **Criar Diretório de Imagens**
   ```bash
   mkdir -p client/public/images
   ```

5. **Adicionar Imagens de Exemplo**
   Coloque as imagens dos produtos na pasta `client/public/images` com os nomes:
   - `margherita.jpg` - Pizza Margherita
   - `calabresa.jpg` - Pizza Calabresa
   - `cola.jpg` - Refrigerante
   - `petit-gateau.jpg` - Sobremesa
   - `pao-de-alho.jpg` - Pão de alho
   - `combo-familia.jpg` - Combo família
   - `pizza-do-dia.jpg` - Pizza do dia

6. **Iniciar o Servidor de Desenvolvimento**
   ```bash
   npm run dev-local
   ```

7. **Acessar a Aplicação**
   - Abra um navegador e acesse: http://localhost:3000

## Arquivos Originais
Os arquivos originais foram preservados com a extensão '.original' caso precise restaurar a configuração para NeonDB.

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

## Configuração do Mercado Pago (Opcional)
Para habilitar pagamentos via Mercado Pago, crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
MERCADOPAGO_ACCESS_TOKEN=seu_token_de_acesso
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica
```

## Suporte
Para problemas, dúvidas ou sugestões, entre em contato com o desenvolvedor.
