import { pgTable, text, serial, integer, boolean, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("customer"), // "admin_master", "admin", or "customer"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Menu categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Menu items
export const menuItems = pgTable("menu_items", {
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

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

// Special offers
export const specialOffers = pgTable("special_offers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  originalPrice: doublePrecision("original_price").notNull(),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertSpecialOfferSchema = createInsertSchema(specialOffers).omit({
  id: true,
});

// Order status: "pending", "preparing", "in_transit", "delivered", "cancelled"
export const orders = pgTable("orders", {
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

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Order item type to be stored in the order's items field
export const orderItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Export all types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type SpecialOffer = typeof specialOffers.$inferSelect;
export type InsertSpecialOffer = z.infer<typeof insertSpecialOfferSchema>;



// Delivery addresses
export const addresses = pgTable("addresses", {
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

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Audit log para ações de administradores
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;

// System settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingsSchema>;

// Business hours schema
export const businessHoursSchema = z.object({
  monday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  tuesday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  wednesday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  thursday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  friday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  saturday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  sunday: z.object({ open: z.string().optional(), close: z.string().optional(), isClosed: z.boolean().default(false) }),
  isManualClosed: z.boolean().default(false),
});

// Delivery settings schema
export const deliverySettingsSchema = z.object({
  fee: z.number().min(0).default(0),
  estimatedTime: z.number().min(0).default(0),
  minimumOrderValue: z.number().min(0).default(0),
  supportedNeighborhoods: z.array(z.string()).default([]),
});

// Order settings schema
export const orderSettingsSchema = z.object({
  allowDelivery: z.boolean().default(true),
  allowPickup: z.boolean().default(true),
  estimatedPickupTime: z.number().min(0).default(0),
});

// General preferences schema
export const generalPreferencesSchema = z.object({
  newOrderSound: z.boolean().default(true),
  showAlerts: z.boolean().default(true),
  sendCustomerNotifications: z.boolean().default(false),
});

export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type DeliverySettings = z.infer<typeof deliverySettingsSchema>;
export type OrderSettings = z.infer<typeof orderSettingsSchema>;
export type GeneralPreferences = z.infer<typeof generalPreferencesSchema>;
