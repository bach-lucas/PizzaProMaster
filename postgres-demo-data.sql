-- Arquivo de exportação de dados do PizzaApp para PostgreSQL
-- Gerado em: 2025-04-16T14:31:39.083Z

BEGIN;

-- Desativar verificação de chaves estrangeiras temporariamente
SET CONSTRAINTS ALL DEFERRED;

-- Limpar tabelas existentes
TRUNCATE TABLE "users" CASCADE;
TRUNCATE TABLE "categories" CASCADE;
TRUNCATE TABLE "menu_items" CASCADE;
TRUNCATE TABLE "special_offers" CASCADE;
TRUNCATE TABLE "addresses" CASCADE;
TRUNCATE TABLE "orders" CASCADE;
TRUNCATE TABLE "system_settings" CASCADE;

-- Inserir dados na tabela users
INSERT INTO "users" ("id", "username", "password", "name", "email", "role", "created_at") VALUES (1, 'admin', '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', 'Administrador', 'admin@exemplo.com', 'admin_master', NOW());
INSERT INTO "users" ("id", "username", "password", "name", "email", "role", "created_at") VALUES (2, 'gerente', '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', 'Gerente', 'gerente@exemplo.com', 'admin', NOW());
INSERT INTO "users" ("id", "username", "password", "name", "email", "role", "created_at") VALUES (3, 'cliente', '2818e810fdced29a4166e8b572c3ccc9b1157447.6f943a7d', 'Cliente Exemplo', 'cliente@exemplo.com', 'customer', NOW());

-- Inserir dados na tabela categories
INSERT INTO "categories" ("id", "name", "slug") VALUES (1, 'Pizzas', 'pizzas');
INSERT INTO "categories" ("id", "name", "slug") VALUES (2, 'Bebidas', 'bebidas');
INSERT INTO "categories" ("id", "name", "slug") VALUES (3, 'Sobremesas', 'sobremesas');
INSERT INTO "categories" ("id", "name", "slug") VALUES (4, 'Acompanhamentos', 'acompanhamentos');

-- Inserir dados na tabela menu_items
INSERT INTO "menu_items" ("id", "name", "description", "price", "image_url", "category_id", "tags", "available", "featured") VALUES (1, 'Pizza Margherita', 'Molho de tomate, mussarela fresca e manjericão.', 45.9, '/images/margherita.jpg', 1, ARRAY['Vegetariana', 'Tradicional'], true, true);
INSERT INTO "menu_items" ("id", "name", "description", "price", "image_url", "category_id", "tags", "available", "featured") VALUES (2, 'Pizza Calabresa', 'Molho de tomate, mussarela e calabresa fatiada.', 48.9, '/images/calabresa.jpg', 1, ARRAY['Tradicional', 'Popular'], true, true);
INSERT INTO "menu_items" ("id", "name", "description", "price", "image_url", "category_id", "tags", "available", "featured") VALUES (3, 'Refrigerante Cola', 'Refrigerante de cola gelado (2L).', 12.9, '/images/cola.jpg', 2, ARRAY['Bebida', 'Refrigerante'], true, false);
INSERT INTO "menu_items" ("id", "name", "description", "price", "image_url", "category_id", "tags", "available", "featured") VALUES (4, 'Petit Gateau', 'Bolo quente de chocolate com sorvete de creme.', 18.9, '/images/petit-gateau.jpg', 3, ARRAY['Chocolate', 'Quente'], true, false);
INSERT INTO "menu_items" ("id", "name", "description", "price", "image_url", "category_id", "tags", "available", "featured") VALUES (5, 'Pão de Alho', 'Porção de pão de alho com queijo gratinado.', 15.9, '/images/pao-de-alho.jpg', 4, ARRAY['Quente', 'Aperitivo'], true, false);

-- Inserir dados na tabela special_offers
INSERT INTO "special_offers" ("id", "name", "description", "price", "original_price", "image_url", "active") VALUES (1, 'Combo Família', 'Pizza grande de até 2 sabores + 1 refrigerante 2L + 1 sobremesa', 89.9, 110.9, '/images/combo-familia.jpg', true);
INSERT INTO "special_offers" ("id", "name", "description", "price", "original_price", "image_url", "active") VALUES (2, 'Pizza do Dia', 'Pizza média de calabresa com borda recheada de catupiry', 39.9, 54.9, '/images/pizza-do-dia.jpg', true);

-- Inserir dados na tabela addresses
INSERT INTO "addresses" ("id", "user_id", "street", "number", "complement", "neighborhood", "city", "state", "zip_code", "is_favorite", "created_at") VALUES (1, 3, 'Rua das Flores', '123', 'Apto 101', 'Centro', 'São Paulo', 'SP', '01234-567', true, NOW());

-- Inserir dados na tabela orders
INSERT INTO "orders" ("id", "user_id", "items", "subtotal", "delivery_fee", "total", "status", "payment_method", "address", "created_at", "updated_at") VALUES (1, 3, '[{"id":1,"name":"Pizza Margherita","price":45.9,"quantity":1,"imageUrl":"/images/margherita.jpg"},{"id":3,"name":"Refrigerante Cola","price":12.9,"quantity":1,"imageUrl":"/images/cola.jpg"}]'::jsonb, 58.8, 10, 68.8, 'delivered', 'card', '{"street":"Rua das Flores","number":"123","complement":"Apto 101","neighborhood":"Centro","city":"São Paulo","state":"SP","zip_code":"01234-567"}'::jsonb, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours');

-- Inserir dados na tabela system_settings
INSERT INTO "system_settings" ("id", "key", "value", "updated_at", "updated_by") VALUES (1, 'business_hours', '{"monday":{"open":"11:00","close":"22:00","isClosed":false},"tuesday":{"open":"11:00","close":"22:00","isClosed":false},"wednesday":{"open":"11:00","close":"22:00","isClosed":false},"thursday":{"open":"11:00","close":"22:00","isClosed":false},"friday":{"open":"11:00","close":"23:00","isClosed":false},"saturday":{"open":"11:00","close":"23:00","isClosed":false},"sunday":{"open":"11:00","close":"22:00","isClosed":false},"isManualClosed":false}'::jsonb, NOW(), 1);
INSERT INTO "system_settings" ("id", "key", "value", "updated_at", "updated_by") VALUES (2, 'delivery_settings', '{"fee":10,"estimatedTime":45,"minimumOrderValue":30,"supportedNeighborhoods":["Centro","Jardins","Pinheiros","Vila Mariana","Moema"]}'::jsonb, NOW(), 1);
INSERT INTO "system_settings" ("id", "key", "value", "updated_at", "updated_by") VALUES (3, 'order_settings', '{"allowDelivery":true,"allowPickup":true,"estimatedPickupTime":25}'::jsonb, NOW(), 1);
INSERT INTO "system_settings" ("id", "key", "value", "updated_at", "updated_by") VALUES (4, 'general_preferences', '{"newOrderSound":true,"showAlerts":true,"sendCustomerNotifications":false}'::jsonb, NOW(), 1);

-- Atualizar sequências dos IDs
-- Atualizar sequência para a tabela users
SELECT setval('users_id_seq', 3, true);
-- Atualizar sequência para a tabela categories
SELECT setval('categories_id_seq', 4, true);
-- Atualizar sequência para a tabela menu_items
SELECT setval('menu_items_id_seq', 5, true);
-- Atualizar sequência para a tabela special_offers
SELECT setval('special_offers_id_seq', 2, true);
-- Atualizar sequência para a tabela addresses
SELECT setval('addresses_id_seq', 1, true);
-- Atualizar sequência para a tabela orders
SELECT setval('orders_id_seq', 1, true);
-- Atualizar sequência para a tabela system_settings
SELECT setval('system_settings_id_seq', 4, true);

-- Reativar verificação de chaves estrangeiras
SET CONSTRAINTS ALL IMMEDIATE;

COMMIT;
