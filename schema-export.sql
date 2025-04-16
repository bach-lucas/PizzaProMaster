-- Script SQL para criar o esquema do banco de dados

-- Tabela: users
-- Definição original: export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("customer"), // "admin_master", "admin", or "customer"
  createdAt: timestamp("created_at").defaultNow(),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertUserSchema
-- Definição original: export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: categories
-- Definição original: export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertCategorySchema
-- Definição original: export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: menuItems
-- Definição original: export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  tags: text("tags").array(),
  available: boolean("available").notNull().default(true),
  featured: boolean("featured").default(false),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertMenuItemSchema
-- Definição original: export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: specialOffers
-- Definição original: export const specialOffers = pgTable("special_offers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  originalPrice: doublePrecision("original_price").notNull(),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").notNull().default(true),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertSpecialOfferSchema
-- Definição original: export const insertSpecialOfferSchema = createInsertSchema(specialOffers).omit({
  id: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: orders
-- Definição original: export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  items: jsonb("items").notNull(), // Array of items with quantity
  subtotal: doublePrecision("subtotal").notNull(),
  deliveryFee: doublePrecision("delivery_fee").notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertOrderSchema
-- Definição original: export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: addresses
-- Definição original: export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users table
  street: text("street").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertAddressSchema
-- Definição original: export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: adminLogs
-- Definição original: export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertAdminLogSchema
-- Definição original: export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: systemSettings
-- Definição original: export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

-- Tabela: insertSystemSettingsSchema
-- Definição original: export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});
-- NOTA: Este é um esboço. Você precisará completar as definições de colunas a partir do código fonte.

