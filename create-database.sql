-- Script SQL para criar o esquema do banco de dados PizzaApp

-- Desativar restrições de chave estrangeira durante a criação das tabelas
SET CONSTRAINTS ALL DEFERRED;

-- Tabela: users
DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'customer',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: categories
DROP TABLE IF EXISTS "categories" CASCADE;
CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE
);

-- Tabela: menu_items
DROP TABLE IF EXISTS "menu_items" CASCADE;
CREATE TABLE "menu_items" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "image_url" TEXT NOT NULL,
  "category_id" INTEGER NOT NULL,
  "tags" TEXT[],
  "available" BOOLEAN NOT NULL DEFAULT TRUE,
  "featured" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
);

-- Tabela: special_offers
DROP TABLE IF EXISTS "special_offers" CASCADE;
CREATE TABLE "special_offers" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "original_price" DOUBLE PRECISION NOT NULL,
  "image_url" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela: addresses
DROP TABLE IF EXISTS "addresses" CASCADE;
CREATE TABLE "addresses" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "street" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "complement" TEXT,
  "neighborhood" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip_code" TEXT NOT NULL,
  "is_favorite" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

-- Tabela: orders
DROP TABLE IF EXISTS "orders" CASCADE;
CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "items" JSONB NOT NULL,
  "subtotal" DOUBLE PRECISION NOT NULL,
  "delivery_fee" DOUBLE PRECISION NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payment_method" TEXT NOT NULL,
  "address" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

-- Tabela: admin_logs
DROP TABLE IF EXISTS "admin_logs" CASCADE;
CREATE TABLE "admin_logs" (
  "id" SERIAL PRIMARY KEY,
  "admin_id" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" INTEGER,
  "details" TEXT,
  "ip_address" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("admin_id") REFERENCES "users" ("id")
);

-- Tabela: system_settings
DROP TABLE IF EXISTS "system_settings" CASCADE;
CREATE TABLE "system_settings" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_by" INTEGER,
  FOREIGN KEY ("updated_by") REFERENCES "users" ("id")
);

-- Dados iniciais: Inserir usuário administrador
INSERT INTO "users" ("username", "password", "name", "email", "role") 
VALUES ('admin', '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', 'Administrador', 'admin@example.com', 'admin_master');

-- Dados iniciais: Inserir categorias padrão
INSERT INTO "categories" ("name", "slug") VALUES 
('Pizzas', 'pizzas'),
('Bebidas', 'bebidas'),
('Sobremesas', 'sobremesas'),
('Acompanhamentos', 'acompanhamentos');

-- Habilitar as restrições de chave estrangeira
SET CONSTRAINTS ALL IMMEDIATE;

-- Índices para melhorar o desempenho
CREATE INDEX idx_menu_items_category ON "menu_items" ("category_id");
CREATE INDEX idx_orders_user ON "orders" ("user_id");
CREATE INDEX idx_addresses_user ON "addresses" ("user_id");
CREATE INDEX idx_admin_logs_admin ON "admin_logs" ("admin_id");