import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure o método WebSocket para o ambiente Node.js
neonConfig.webSocketConstructor = ws;

// Verifique se a variável de ambiente DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Crie uma conexão SQL usando a abordagem serverless
export const sql = neon(process.env.DATABASE_URL);

// Configure o Drizzle ORM para usar a conexão serverless
export const db = drizzle(sql, { schema });
