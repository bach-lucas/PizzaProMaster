import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { z } from "zod";
import { 
  insertMenuItemSchema, 
  insertCategorySchema, 
  insertSpecialOfferSchema,
  insertOrderSchema,
  orderItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Menu Item Routes
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu items" });
    }
  });

  app.get("/api/menu/featured", async (req, res) => {
    try {
      const featuredItems = await storage.getFeaturedMenuItems();
      res.json(featuredItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured menu items" });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      
      const menuItem = await storage.getMenuItem(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu item" });
    }
  });

  app.post("/api/menu/create", async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const newMenuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(newMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating menu item" });
    }
  });

  app.put("/api/menu/update/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      
      const menuItemData = insertMenuItemSchema.partial().parse(req.body);
      const updatedMenuItem = await storage.updateMenuItem(id, menuItemData);
      
      if (!updatedMenuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error updating menu item" });
    }
  });

  app.delete("/api/menu/delete/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      
      const success = await storage.deleteMenuItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting menu item" });
    }
  });

  // Category Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/category/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const menuItems = await storage.getMenuItemsByCategory(id);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu items for category" });
    }
  });

  app.post("/api/category/create", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating category" });
    }
  });

  app.put("/api/category/update/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error updating category" });
    }
  });

  app.delete("/api/category/delete/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  // Special Offers Routes
  app.get("/api/offers", async (req, res) => {
    try {
      const offers = await storage.getAllSpecialOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching special offers" });
    }
  });

  app.get("/api/offers/active", async (req, res) => {
    try {
      const activeOffers = await storage.getActiveSpecialOffers();
      res.json(activeOffers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active special offers" });
    }
  });

  app.post("/api/offer/create", async (req, res) => {
    try {
      const offerData = insertSpecialOfferSchema.parse(req.body);
      const newOffer = await storage.createSpecialOffer(offerData);
      res.status(201).json(newOffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating special offer" });
    }
  });

  app.put("/api/offer/update/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid offer ID" });
      }
      
      const offerData = insertSpecialOfferSchema.partial().parse(req.body);
      const updatedOffer = await storage.updateSpecialOffer(id, offerData);
      
      if (!updatedOffer) {
        return res.status(404).json({ message: "Special offer not found" });
      }
      
      res.json(updatedOffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error updating special offer" });
    }
  });

  app.delete("/api/offer/delete/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid offer ID" });
      }
      
      const success = await storage.deleteSpecialOffer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Special offer not found" });
      }
      
      res.json({ message: "Special offer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting special offer" });
    }
  });

  // Order Routes
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view orders" });
      }

      let orders;
      if (req.user.role === "admin") {
        // Admins can see all orders
        orders = await storage.getAllOrders();
      } else {
        // Customers can only see their own orders
        orders = await storage.getUserOrders(req.user.id);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view an order" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has permission to view this order
      if (req.user.role !== "admin" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.post("/api/orders/create", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create an order" });
      }

      // Validate order items
      const itemsSchema = z.array(orderItemSchema);
      const validItems = itemsSchema.parse(req.body.items);
      
      // Calculate totals
      const subtotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 3.99;
      const total = subtotal + deliveryFee;
      
      const orderData = {
        ...req.body,
        userId: req.user.id,
        items: validItems,
        subtotal,
        deliveryFee,
        total,
        status: "pending"
      };
      
      const orderValidated = insertOrderSchema.parse(orderData);
      const newOrder = await storage.createOrder(orderValidated);
      
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update order status" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const { status } = req.body;
      if (!status || !["pending", "preparing", "in_transit", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // User management (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from the response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      const users = await storage.getAllUsers();
      const menuItems = await storage.getAllMenuItems();
      
      // Calculate statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const activeOrders = orders.filter(order => 
        ["pending", "preparing", "in_transit"].includes(order.status)
      ).length;
      const totalCustomers = users.filter(user => user.role === "customer").length;
      
      // Top selling items calculation
      const itemSales = new Map();
      orders.forEach(order => {
        const items = order.items as any[];
        items.forEach(item => {
          const currentCount = itemSales.get(item.id) || 0;
          itemSales.set(item.id, currentCount + item.quantity);
        });
      });
      
      const topSellingItems = Array.from(itemSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, quantity]) => {
          const menuItem = menuItems.find(item => item.id === id);
          return {
            id,
            name: menuItem?.name || "Unknown Item",
            quantity
          };
        });
      
      // Sales by month (mocked for demo)
      const monthlyStats = [
        { month: "Jan", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Feb", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Mar", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Apr", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "May", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Jun", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Jul", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Aug", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Sep", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Oct", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Nov", sales: Math.floor(Math.random() * 5000) + 3000 },
        { month: "Dec", sales: Math.floor(Math.random() * 5000) + 3000 }
      ];
      
      // Recent orders
      const recentOrders = [...orders]
        .sort((a, b) => {
          // Handle null createdAt values
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, 10);
      
      res.json({
        totalOrders,
        totalRevenue,
        activeOrders,
        totalCustomers,
        topSellingItems,
        monthlyStats,
        recentOrders
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching admin stats" });
    }
  });

  // Pizza Customization Routes
  app.get("/api/pizza/bases", async (req, res) => {
    try {
      const bases = await storage.getPizzaBases();
      res.json(bases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pizza bases" });
    }
  });

  app.get("/api/pizza/sizes", async (req, res) => {
    try {
      const sizes = await storage.getPizzaSizes();
      res.json(sizes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pizza sizes" });
    }
  });

  app.get("/api/pizza/crusts", async (req, res) => {
    try {
      const crusts = await storage.getPizzaCrusts();
      res.json(crusts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pizza crusts" });
    }
  });

  app.get("/api/pizza/sauces", async (req, res) => {
    try {
      const sauces = await storage.getPizzaSauces();
      res.json(sauces);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pizza sauces" });
    }
  });

  app.get("/api/pizza/toppings", async (req, res) => {
    try {
      const toppings = await storage.getPizzaToppings();
      res.json(toppings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pizza toppings" });
    }
  });

  app.get("/api/pizza/toppings/categories", async (req, res) => {
    try {
      const toppingsByCategory = await storage.getPizzaToppingsByCategory();
      res.json(toppingsByCategory);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pizza toppings by category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
