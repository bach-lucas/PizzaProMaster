import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para extrair o esquema do arquivo schema.ts
async function extractSchema() {
  try {
    // Ler o arquivo schema.ts
    const schemaPath = path.join(__dirname, 'shared', 'schema.ts');
    console.log(`Lendo arquivo de esquema: ${schemaPath}`);
    
    const schemaContent = await readFile(schemaPath, 'utf8');
    console.log('Arquivo de esquema lido com sucesso.');
    
    // Extrair definições de tabelas
    const tableDefinitions = [];
    const tableRegex = /export const (\w+) = (\w+)\((.*?)\);/gs;
    let match;
    
    while ((match = tableRegex.exec(schemaContent)) !== null) {
      const tableName = match[1];
      const tableType = match[2]; // pgTable, sqliteTable, etc.
      const tableDefinition = match[0];
      
      tableDefinitions.push({
        name: tableName,
        type: tableType,
        definition: tableDefinition
      });
    }
    
    console.log(`Encontradas ${tableDefinitions.length} definições de tabelas.`);
    
    // Extrair definições de relações
    const relationDefinitions = [];
    const relationRegex = /export const (\w+)Relations = relations\((\w+), \(.*?\) => \({(.*?)}\)\);/gs;
    
    while ((match = relationRegex.exec(schemaContent)) !== null) {
      const relationName = match[1];
      const tableName = match[2];
      const relationDefinition = match[0];
      
      relationDefinitions.push({
        name: relationName,
        tableName: tableName,
        definition: relationDefinition
      });
    }
    
    console.log(`Encontradas ${relationDefinitions.length} definições de relações.`);
    
    // Gerar o script SQL (com base nas tabelas e relações)
    let sqlScript = '-- Script SQL para criar o esquema do banco de dados\n\n';
    
    // Adicionar tabelas
    for (const table of tableDefinitions) {
      sqlScript += `-- Tabela: ${table.name}\n`;
      sqlScript += `-- Definição original: ${table.definition}\n`;
      sqlScript += `-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.\n\n`;
    }
    
    // Salvar o resultado
    const exportPath = path.join(__dirname, 'schema-export.sql');
    fs.writeFileSync(exportPath, sqlScript);
    console.log(`Script SQL básico gerado: ${exportPath}`);
    
    // Salvar esquema completo para referência
    const schemaExport = {
      tables: tableDefinitions,
      relations: relationDefinitions,
      originalSchema: schemaContent
    };
    
    const schemaExportPath = path.join(__dirname, 'schema-export.json');
    fs.writeFileSync(schemaExportPath, JSON.stringify(schemaExport, null, 2));
    console.log(`Esquema exportado para: ${schemaExportPath}`);
    
  } catch (error) {
    console.error('Erro ao extrair esquema:', error);
  }
}

// Função principal - exporta o schema
extractSchema();