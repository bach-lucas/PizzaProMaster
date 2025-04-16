import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportDatabase() {
  console.log('Iniciando exportação do banco de dados...');
  
  try {
    // Obter a lista de tabelas
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Tabelas encontradas: ${tables.join(', ')}`);
    
    // Objeto para armazenar o esquema e dados
    const databaseExport = {
      schema: {},
      data: {}
    };
    
    // Exportar esquema de cada tabela
    for (const table of tables) {
      // Obter informações das colunas
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, 
               is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      // Obter constraints da tabela
      const constraintsResult = await pool.query(`
        SELECT con.conname as constraint_name,
               con.contype as constraint_type,
               pg_get_constraintdef(con.oid) as constraint_definition,
               con.confrelid::regclass as referenced_table
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = $1
          AND nsp.nspname = 'public'
      `, [table]);
      
      // Obter índices da tabela
      const indexesResult = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
          AND schemaname = 'public'
      `, [table]);
      
      // Salvar informações do esquema
      databaseExport.schema[table] = {
        columns: columnsResult.rows,
        constraints: constraintsResult.rows,
        indexes: indexesResult.rows
      };
      
      // Exportar dados da tabela
      const dataResult = await pool.query(`SELECT * FROM "${table}"`);
      databaseExport.data[table] = dataResult.rows;
      
      console.log(`Exportada tabela: ${table} (${dataResult.rows.length} registros)`);
    }
    
    // Salvar tudo em um arquivo JSON
    const exportPath = path.join(__dirname, 'database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(databaseExport, null, 2));
    
    console.log(`Exportação concluída. Arquivo salvo em: ${exportPath}`);
    
    // Gerar script SQL para recriar o banco localmente
    const sqlScriptPath = path.join(__dirname, 'recreate-database.sql');
    let sqlScript = '-- Script para recriar o banco de dados localmente\n\n';
    
    // Criar tabelas
    for (const table of tables) {
      sqlScript += `-- Tabela: ${table}\n`;
      sqlScript += `DROP TABLE IF EXISTS "${table}" CASCADE;\n`;
      sqlScript += `CREATE TABLE "${table}" (\n`;
      
      const columns = databaseExport.schema[table].columns;
      const columnDefinitions = columns.map(col => {
        let def = `  "${col.column_name}" ${col.data_type}`;
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        return def;
      });
      
      sqlScript += columnDefinitions.join(',\n');
      sqlScript += '\n);\n\n';
    }
    
    // Adicionar constraints
    for (const table of tables) {
      const constraints = databaseExport.schema[table].constraints;
      
      for (const constraint of constraints) {
        if (constraint.constraint_type === 'p') { // Primary key
          sqlScript += `ALTER TABLE "${table}" ADD ${constraint.constraint_definition};\n`;
        }
      }
      
      sqlScript += '\n';
    }
    
    for (const table of tables) {
      const constraints = databaseExport.schema[table].constraints;
      
      for (const constraint of constraints) {
        if (constraint.constraint_type === 'f') { // Foreign key
          sqlScript += `ALTER TABLE "${table}" ADD ${constraint.constraint_definition};\n`;
        }
      }
      
      sqlScript += '\n';
    }
    
    // Adicionar índices
    for (const table of tables) {
      const indexes = databaseExport.schema[table].indexes;
      
      for (const index of indexes) {
        // Pular índices de chave primária que já foram adicionados
        if (!index.indexname.endsWith('_pkey')) {
          sqlScript += `${index.indexdef};\n`;
        }
      }
      
      sqlScript += '\n';
    }
    
    // Adicionar inserção de dados
    for (const table of tables) {
      const data = databaseExport.data[table];
      
      if (data.length > 0) {
        sqlScript += `-- Inserir dados na tabela: ${table}\n`;
        
        for (const row of data) {
          const columns = Object.keys(row).filter(key => row[key] !== null);
          const values = columns.map(key => {
            const value = row[key];
            if (typeof value === 'string') {
              // Escapar aspas simples
              return `'${value.replace(/'/g, "''")}'`;
            } else if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            } else if (Array.isArray(value)) {
              const arrayStr = JSON.stringify(value)
                .replace('[', '{')
                .replace(']', '}');
              return `'${arrayStr}'`;
            } else if (typeof value === 'object') {
              return `'${JSON.stringify(value)}'`;
            }
            return value;
          });
          
          sqlScript += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        sqlScript += '\n';
      }
    }
    
    fs.writeFileSync(sqlScriptPath, sqlScript);
    console.log(`Script SQL gerado: ${sqlScriptPath}`);
    
  } catch (error) {
    console.error('Erro ao exportar banco de dados:', error);
  } finally {
    await pool.end();
  }
}

// Executar a exportação
exportDatabase();