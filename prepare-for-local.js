import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareForLocalDevelopment() {
  try {
    console.log('Preparando o projeto para execução local...');
    
    // 1. Modificar o arquivo de conexão com o banco de dados para usar SQLite
    const dbPath = path.join(__dirname, 'server', 'db.ts');
    const originalDbCode = await fs.readFile(dbPath, 'utf8');
    
    // Backup do arquivo original
    await fs.writeFile(`${dbPath}.original`, originalDbCode);
    console.log(`Backup do arquivo DB original criado: ${dbPath}.original`);
    
    // Substituir com configuração SQLite
    const sqliteDbCode = `
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Configuração para SQLite local (em vez de Neon Postgres)
const sqlite = new Database('local-database.db');
export const db = drizzle(sqlite, { schema });

// Exportar uma "pool" fictícia para compatibilidade
export const pool = {
  async end() {
    // Fechar a conexão SQLite
    sqlite.close();
  }
};
`;
    
    await fs.writeFile(dbPath, sqliteDbCode);
    console.log('Arquivo de configuração do banco de dados atualizado para SQLite');
    
    // 2. Modificar o schema.ts para usar SQLite em vez de Postgres
    const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
    const originalSchemaCode = await fs.readFile(schemaPath, 'utf8');
    
    // Backup do arquivo original
    await fs.writeFile(`${schemaPath}.original`, originalSchemaCode);
    console.log(`Backup do arquivo schema original criado: ${schemaPath}.original`);
    
    // Substituir referências Postgres com SQLite
    let sqliteSchemaCode = originalSchemaCode
      .replace(/import { pgTable/g, 'import { sqliteTable')
      .replace(/pgTable\(/g, 'sqliteTable(')
      .replace(/serial\(/g, 'integer(')
      .replace(/doublePrecision\(/g, 'real(')
      .replace(/jsonb\(/g, 'text(')
      .replace(/timestamp\([^)]*\)\.defaultNow/g, 'integer("$1").default(sql`CURRENT_TIMESTAMP`)')
      .replace(/\.array\(\)/g, '')
      .replace(/text\([^)]*\)\.array/g, 'text("$1")')
      .replace(/DEFAULT \('customer'\)::/g, 'DEFAULT "customer"');
    
    // Adicionar imports
    if (!sqliteSchemaCode.includes('import { sql }')) {
      sqliteSchemaCode = sqliteSchemaCode.replace(
        'import {', 
        'import { sql, '
      );
    }
    
    await fs.writeFile(schemaPath, sqliteSchemaCode);
    console.log('Arquivo de schema atualizado para SQLite');
    
    // 3. Adicionar script ao package.json para inicializar o banco de dados SQLite
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // Backup do arquivo original
    await fs.writeFile(`${packageJsonPath}.original`, JSON.stringify(packageJson, null, 2));
    console.log(`Backup do arquivo package.json original criado: ${packageJsonPath}.original`);
    
    // Adicionar scripts para inicialização do SQLite
    packageJson.scripts = {
      ...packageJson.scripts,
      "init-local-db": "npx drizzle-kit push:sqlite",
      "dev-local": "npm run init-local-db && npm run dev"
    };
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json atualizado com scripts para SQLite');
    
    // 4. Criar configuração do Drizzle para SQLite
    const drizzleConfigPath = path.join(__dirname, 'drizzle.config.ts');
    const drizzleConfig = await fs.readFile(drizzleConfigPath, 'utf8');
    
    // Backup do arquivo original
    await fs.writeFile(`${drizzleConfigPath}.original`, drizzleConfig);
    console.log(`Backup do arquivo drizzle.config.ts original criado: ${drizzleConfigPath}.original`);
    
    // Nova configuração para suportar SQLite
    const newDrizzleConfig = `
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

// Detectar ambiente: SQLite local vs PostgreSQL em produção
const isSQLite = !process.env.DATABASE_URL || process.env.USE_SQLITE === 'true';

// Configuração base
const baseConfig = {
  schema: "./shared/schema.ts",
  out: "./drizzle",
};

// Configuração específica para cada ambiente
const config: Config = isSQLite
  ? {
      ...baseConfig,
      driver: 'better-sqlite',
      dbCredentials: {
        url: 'local-database.db',
      },
    }
  : {
      ...baseConfig,
      driver: 'pg',
      dbCredentials: {
        connectionString: process.env.DATABASE_URL || '',
      },
    };

export default config;
`;
    
    await fs.writeFile(drizzleConfigPath, newDrizzleConfig);
    console.log('Configuração do Drizzle atualizada para suportar SQLite');
    
    // 5. Criar arquivo README com instruções para execução local
    const readmePath = path.join(__dirname, 'LOCAL-README.md');
    const readmeContent = `# Execução Local do Projeto PizzaApp

## Requisitos
- Node.js v16 ou superior
- npm v7 ou superior

## Instruções para Executar Localmente

1. **Instalar Dependências**
   \`\`\`bash
   npm install
   npm install better-sqlite3 drizzle-orm
   \`\`\`

2. **Inicializar Banco de Dados Local**
   \`\`\`bash
   npm run init-local-db
   \`\`\`

3. **Iniciar o Servidor de Desenvolvimento**
   \`\`\`bash
   npm run dev-local
   \`\`\`

4. **Acessar a Aplicação**
   - Abra um navegador e acesse: http://localhost:3000

## Arquivos Originais
Os arquivos originais foram preservados com a extensão '.original' caso precise restaurar a configuração para NeonDB.

## Conta de Administrador Padrão
- Usuário: admin
- Senha: admin123

## Suporte
Para problemas, dúvidas ou sugestões, entre em contato com o desenvolvedor.
`;
    
    await fs.writeFile(readmePath, readmeContent);
    console.log('Arquivo README com instruções criado: LOCAL-README.md');
    
    console.log('\nProjeto preparado para execução local com SQLite!');
    console.log('Para executar localmente:');
    console.log('1. Baixe o ZIP completo do projeto');
    console.log('2. Instale as dependências: npm install');
    console.log('3. Instale sqlite: npm install better-sqlite3 drizzle-orm');
    console.log('4. Inicialize o banco de dados local: npm run init-local-db');
    console.log('5. Inicie o servidor: npm run dev-local');
    
  } catch (error) {
    console.error('Erro ao preparar o projeto para execução local:', error);
  }
}

// Executar a função
prepareForLocalDevelopment();