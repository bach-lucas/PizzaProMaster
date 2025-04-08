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
  orderItemSchema,
  insertAddressSchema
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
      if (req.user.role === "admin" || req.user.role === "admin_master") {
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
      if (req.user.role !== "admin" && req.user.role !== "admin_master" && order.userId !== req.user.id) {
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
      
      // Enviar notificação de pedido criado
      try {
        const { notificationService } = await import("./services/notification");
        notificationService.notifyOrderCreated(newOrder, req.user);
      } catch (notifyError) {
        console.error("Erro ao enviar notificação de pedido criado:", notifyError);
        // Não interrompe o fluxo se a notificação falhar
      }
      
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
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
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
      
      // Enviar notificação de atualização de status
      try {
        // Buscar o usuário que fez o pedido
        const user = await storage.getUser(updatedOrder.userId || 0);
        if (user) {
          const { notificationService } = await import("./services/notification");
          await notificationService.notifyOrderStatusUpdated(updatedOrder, user);
        }
      } catch (notifyError) {
        console.error("Erro ao enviar notificação de status atualizado:", notifyError);
        // Não interrompe o fluxo se a notificação falhar
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // User management (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      const users = await storage.getAllUsers();
      // Remove passwords from the response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });
  
  // Obter um usuário específico
  app.get("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remove a senha da resposta
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });
  
  // Atualizar um usuário
  app.put("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para atualizar um usuário" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      // Verificar permissões: somente o próprio usuário ou um administrador pode atualizar
      if (req.user.id !== id && req.user.role !== "admin" && req.user.role !== "admin_master") {
        return res.status(403).json({ message: "Sem permissão para atualizar este usuário" });
      }
      
      // Se a senha for fornecida, hash ela
      let userData = { ...req.body };
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remove a senha da resposta
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });
  
  // Excluir um usuário
  app.delete("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      // Não permitir que usuários excluam a si mesmos
      if (id === req.user.id) {
        return res.status(400).json({ message: "Você não pode excluir sua própria conta" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "Usuário não encontrado ou é o admin master (não pode ser excluído)" });
      }
      
      res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir usuário" });
    }
  });
  
  // Alterar a função de um usuário (somente admin_master)
  app.put("/api/users/:id/role", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para alterar funções" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de usuário inválido" });
      }
      
      const { role } = req.body;
      if (!role || !["admin_master", "admin", "customer"].includes(role)) {
        return res.status(400).json({ message: "Função inválida" });
      }
      
      const updatedUser = await storage.setUserRole(id, role, req.user.id);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Se o usuário tentou alterar a função mas não tem permissão
      if (updatedUser.role !== role) {
        return res.status(403).json({ 
          message: "Sem permissão para definir esta função. Somente o admin master pode promover/rebaixar administradores.",
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            role: updatedUser.role
          }
        });
      }
      
      // Registrar no log de administradores
      if (updatedUser.role === role && req.user.role === "admin_master") {
        // Só registra se a alteração foi bem-sucedida e feita por um admin_master
        await storage.logAdminAction({
          adminId: req.user.id,
          action: "update_role",
          entityType: "user",
          entityId: id,
          details: `Alterou função do usuário ${updatedUser.username} para ${role}`
        });
      }
      
      // Remove a senha da resposta
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Erro ao alterar função do usuário" });
    }
  });

  // Admin logs
  app.post("/api/admin/logs", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      const adminId = req.user.id;
      const { action, entityType, entityId, details } = req.body;
      const ipAddress = req.ip;
      
      const logEntry = await storage.logAdminAction({
        adminId,
        action,
        entityType,
        entityId,
        details,
        ipAddress
      });
      
      res.status(201).json(logEntry);
    } catch (error) {
      res.status(500).json({ message: "Erro ao registrar ação de administrador" });
    }
  });
  
  app.get("/api/admin/logs", async (req, res) => {
    try {
      console.log("GET /api/admin/logs - Iniciando requisição");
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        console.log("GET /api/admin/logs - Usuário sem permissão:", req.user?.role);
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      // Se for admin_master, pode ver todos os logs; caso contrário, vê apenas os próprios logs
      const adminId = req.user.role === "admin_master" ? undefined : req.user.id;
      console.log(`GET /api/admin/logs - Buscando logs para adminId:`, adminId ? adminId : "todos (admin_master)");
      
      const logs = await storage.getAdminLogs(adminId);
      console.log(`GET /api/admin/logs - Logs encontrados:`, logs.length);
      
      // Buscar informações dos usuários para enriquecer os logs
      const adminIdsSet = new Set<number>();
      logs.forEach(log => adminIdsSet.add(log.adminId));
      const adminIds = Array.from(adminIdsSet);
      console.log(`GET /api/admin/logs - IDs de administradores encontrados:`, adminIds);
      
      const admins = await Promise.all(
        adminIds.map(id => storage.getUser(id))
      );
      
      const adminsMap = new Map();
      admins.forEach(admin => {
        if (admin) {
          const { id, name, username } = admin;
          adminsMap.set(id, { id, name, username });
        }
      });
      
      // Adicionar nomes de administradores aos logs
      const logsWithAdminInfo = logs.map(log => ({
        ...log,
        admin: adminsMap.get(log.adminId) || { id: log.adminId, name: "Desconhecido", username: "desconhecido" }
      }));
      
      console.log(`GET /api/admin/logs - Enviando resposta com ${logsWithAdminInfo.length} logs`);
      res.json(logsWithAdminInfo);
    } catch (error) {
      console.error("GET /api/admin/logs - Erro:", error);
      res.status(500).json({ message: "Erro ao buscar logs de administrador" });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
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

  // Endereços de entrega (Cliente)
  
  // Obter endereços do usuário
  app.get("/api/addresses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para ver seus endereços" });
      }
      
      const userAddresses = await storage.getUserAddresses(req.user.id);
      res.json(userAddresses);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar endereços" });
    }
  });
  
  // Adicionar um novo endereço
  app.post("/api/addresses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para adicionar um endereço" });
      }
      
      // Verificar se o usuário já tem 3 endereços cadastrados
      const userAddresses = await storage.getUserAddresses(req.user.id);
      if (userAddresses.length >= 3) {
        return res.status(400).json({ message: "Você já possui o limite máximo de 3 endereços cadastrados" });
      }
      
      // Se o endereço estiver marcado como favorito, desmarcar os outros
      if (req.body.isFavorite) {
        await storage.clearFavoriteAddresses(req.user.id);
      }
      
      const addressData = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedAddress = insertAddressSchema.parse(addressData);
      const newAddress = await storage.createAddress(validatedAddress);
      
      res.status(201).json(newAddress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao adicionar endereço" });
    }
  });
  
  // Atualizar um endereço
  app.put("/api/addresses/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para atualizar um endereço" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de endereço inválido" });
      }
      
      // Verificar se o endereço pertence ao usuário
      const address = await storage.getAddressById(id);
      if (!address) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Você não tem permissão para editar este endereço" });
      }
      
      // Se o endereço estiver sendo marcado como favorito, desmarcar os outros
      if (req.body.isFavorite && !address.isFavorite) {
        await storage.clearFavoriteAddresses(req.user.id);
      }
      
      const updatedAddress = await storage.updateAddress(id, req.body);
      if (!updatedAddress) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      
      res.json(updatedAddress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar endereço" });
    }
  });
  
  // Excluir um endereço
  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para excluir um endereço" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de endereço inválido" });
      }
      
      // Verificar se o endereço pertence ao usuário
      const address = await storage.getAddressById(id);
      if (!address) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Você não tem permissão para excluir este endereço" });
      }
      
      const success = await storage.deleteAddress(id);
      if (!success) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      
      res.json({ message: "Endereço excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir endereço" });
    }
  });
  
  // Definir endereço como favorito
  app.put("/api/addresses/:id/favorite", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Você precisa estar logado para marcar um endereço como favorito" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de endereço inválido" });
      }
      
      // Verificar se o endereço pertence ao usuário
      const address = await storage.getAddressById(id);
      if (!address) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: "Você não tem permissão para editar este endereço" });
      }
      
      // Desmarcar todos os endereços como favorito primeiro
      await storage.clearFavoriteAddresses(req.user.id);
      
      // Marcar este endereço como favorito
      const updatedAddress = await storage.updateAddress(id, { isFavorite: true });
      if (!updatedAddress) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      
      res.json(updatedAddress);
    } catch (error) {
      res.status(500).json({ message: "Erro ao marcar endereço como favorito" });
    }
  });

  // Sistema de Configurações - rotas
  // Rota para buscar as configurações de horário de funcionamento
  app.get("/api/settings/business-hours", async (req, res) => {
    try {
      const businessHours = await storage.getBusinessHours();
      res.json(businessHours);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar horários de funcionamento" });
    }
  });

  // Rota para atualizar as configurações de horário de funcionamento (apenas admin)
  app.put("/api/settings/business-hours", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }

      const hours = req.body;
      const updated = await storage.updateBusinessHours(hours, req.user.id);
      
      // Registrar ação no log de administração
      await storage.logAdminAction({
        adminId: req.user.id,
        action: "update",
        entityType: "settings",
        details: "Atualização de horário de funcionamento",
        ipAddress: req.ip
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar horários de funcionamento" });
    }
  });
  
  // Rota para buscar as configurações de entrega
  app.get("/api/settings/delivery", async (req, res) => {
    try {
      const deliverySettings = await storage.getDeliverySettings();
      res.json(deliverySettings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configurações de entrega" });
    }
  });

  // Rota para atualizar as configurações de entrega (apenas admin)
  app.put("/api/settings/delivery", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }

      const settings = req.body;
      const updated = await storage.updateDeliverySettings(settings, req.user.id);
      
      // Registrar ação no log de administração
      await storage.logAdminAction({
        adminId: req.user.id,
        action: "update",
        entityType: "settings",
        details: "Atualização de configurações de entrega",
        ipAddress: req.ip
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar configurações de entrega" });
    }
  });
  
  // Rota para buscar as configurações de pedidos
  app.get("/api/settings/orders", async (req, res) => {
    try {
      const orderSettings = await storage.getOrderSettings();
      res.json(orderSettings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configurações de pedidos" });
    }
  });

  // Rota para atualizar as configurações de pedidos (apenas admin)
  app.put("/api/settings/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }

      const settings = req.body;
      const updated = await storage.updateOrderSettings(settings, req.user.id);
      
      // Registrar ação no log de administração
      await storage.logAdminAction({
        adminId: req.user.id,
        action: "update",
        entityType: "settings",
        details: "Atualização de configurações de pedidos",
        ipAddress: req.ip
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar configurações de pedidos" });
    }
  });
  
  // Rota para buscar as preferências gerais
  app.get("/api/settings/preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      const preferences = await storage.getGeneralPreferences();
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar preferências gerais" });
    }
  });

  // Rota para atualizar as preferências gerais (apenas admin)
  app.put("/api/settings/preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }

      const preferences = req.body;
      const updated = await storage.updateGeneralPreferences(preferences, req.user.id);
      
      // Registrar ação no log de administração
      await storage.logAdminAction({
        adminId: req.user.id,
        action: "update",
        entityType: "settings",
        details: "Atualização de preferências gerais",
        ipAddress: req.ip
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar preferências gerais" });
    }
  });
  
  // Rota para obter todas as configurações do sistema (apenas admin)
  app.get("/api/settings", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "admin_master")) {
        return res.status(403).json({ message: "Permissão de administrador necessária" });
      }
      
      const [businessHours, deliverySettings, orderSettings, preferences] = await Promise.all([
        storage.getBusinessHours(),
        storage.getDeliverySettings(),
        storage.getOrderSettings(),
        storage.getGeneralPreferences()
      ]);
      
      res.json({
        businessHours,
        deliverySettings,
        orderSettings,
        preferences
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configurações do sistema" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
