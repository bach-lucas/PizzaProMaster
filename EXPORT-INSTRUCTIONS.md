# Instruções para Exportação do Projeto

Este guia detalha o passo a passo para exportar o projeto PizzaApp para execução em ambiente local.

## Arquivos de Exportação

Os seguintes arquivos foram criados para facilitar a exportação:

1. **prepare-for-local.js** - Script que modifica a configuração do projeto para usar SQLite
2. **export-schema.js** - Script que extrai o esquema do banco de dados
3. **export-db.js** - Script que gera dados de exemplo para o banco local
4. **create-database.sql** - Script SQL para criar todas as tabelas no banco de dados
5. **demo-data.sql** - Script SQL com dados de exemplo para popular o banco
6. **LOCAL-README.md** - Instruções detalhadas para executar o projeto localmente

## Passos para Exportar o Projeto

1. **Exportar o Código Base**
   - Faça o download completo de todos os arquivos do projeto a partir do Replit
   - Certifique-se de incluir o diretório `.git` se desejar manter o histórico de alterações

2. **Executar o Script de Preparação**
   - Execute `node prepare-for-local.js` para modificar a configuração para uso com SQLite
   - Este script faz backup dos arquivos originais e cria versões adaptadas para SQLite

3. **Instalar Dependências SQLite**
   - Execute `npm install better-sqlite3 drizzle-orm` para instalar as dependências necessárias

4. **Inicializar o Banco de Dados**
   - Execute `npm run init-local-db` para criar as tabelas no banco de dados SQLite

5. **Importar Dados de Exemplo**
   - Execute o SQLite: `sqlite3 local-database.db`
   - Importe os dados de exemplo: `.read demo-data.sql`
   - Saia do SQLite: `.exit`

6. **Preparar Imagens**
   - Crie o diretório de imagens: `mkdir -p client/public/images`
   - Adicione as imagens mencionadas no README ou substitua os caminhos no banco de dados

7. **Iniciar o Servidor**
   - Execute `npm run dev-local` para iniciar o servidor com a configuração local

## Integração com Mercado Pago

Para habilitar pagamentos com Mercado Pago, crie um arquivo `.env` na raiz do projeto com as credenciais:

```
MERCADOPAGO_ACCESS_TOKEN=seu_token_de_acesso
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica
```

## Restaurar Configuração Original

Se precisar restaurar a configuração para NeonDB (para uso em produção):

1. Restaure os arquivos originais:
   ```bash
   cp server/db.ts.original server/db.ts
   cp shared/schema.ts.original shared/schema.ts
   cp package.json.original package.json
   cp drizzle.config.ts.original drizzle.config.ts
   ```

2. Execute `npm install` para garantir que todas as dependências estejam instaladas

## Suporte

Para problemas, dúvidas ou sugestões sobre o processo de exportação, consulte a documentação ou entre em contato com o desenvolvedor.