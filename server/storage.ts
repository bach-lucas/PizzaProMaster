import {
  users,
  type User,
  type InsertUser,
  categories,
  type Category,
  type InsertCategory,
  menuItems,
  type MenuItem,
  type InsertMenuItem,
  specialOffers,
  type SpecialOffer,
  type InsertSpecialOffer,
  orders,
  type Order,
  type InsertOrder,
  type PizzaBase,
  type PizzaSize,
  type PizzaCrust,
  type PizzaSauce,
  type PizzaTopping
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: number,
    category: Partial<InsertCategory>,
  ): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Menu item operations
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(
    id: number,
    menuItem: Partial<InsertMenuItem>,
  ): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  getFeaturedMenuItems(): Promise<MenuItem[]>;

  // Special offer operations
  getSpecialOffer(id: number): Promise<SpecialOffer | undefined>;
  getAllSpecialOffers(): Promise<SpecialOffer[]>;
  getActiveSpecialOffers(): Promise<SpecialOffer[]>;
  createSpecialOffer(specialOffer: InsertSpecialOffer): Promise<SpecialOffer>;
  updateSpecialOffer(
    id: number,
    specialOffer: Partial<InsertSpecialOffer>,
  ): Promise<SpecialOffer | undefined>;
  deleteSpecialOffer(id: number): Promise<boolean>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Pizza customization operations
  getPizzaBases(): Promise<PizzaBase[]>;
  getPizzaSizes(): Promise<PizzaSize[]>;
  getPizzaCrusts(): Promise<PizzaCrust[]>;
  getPizzaSauces(): Promise<PizzaSauce[]>;
  getPizzaToppings(): Promise<PizzaTopping[]>;
  getPizzaToppingsByCategory(): Promise<Record<string, PizzaTopping[]>>;

  // Session store
  sessionStore: any; // Using any for session store type to avoid issues
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private categoriesMap: Map<number, Category>;
  private menuItemsMap: Map<number, MenuItem>;
  private specialOffersMap: Map<number, SpecialOffer>;
  private ordersMap: Map<number, Order>;

  sessionStore: any; // Usando any para o tipo do sessionStore para evitar problemas de tipagem

  private userIdCounter = 1;
  private categoryIdCounter = 1;
  private menuItemIdCounter = 1;
  private specialOfferIdCounter = 1;
  private orderIdCounter = 1;

  constructor() {
    this.usersMap = new Map();
    this.categoriesMap = new Map();
    this.menuItemsMap = new Map();
    this.specialOffersMap = new Map();
    this.ordersMap = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Initialize with some data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    this.usersMap.set(this.userIdCounter++, {
      id: 1,
      username: "admin",
      password: "e3bc715f83803b24aee7c8126f22cca845617204917dbe7780d76313654dcf8c054f0b590178089ed62f9460c178aadbd7814361925192bbf2dc23639bd4e4d1.2f5c47acaaec2942b27c9d09bb3692d6", // "admin123"
      name: "Administrador",
      email: "admin@bellapizza.com",
      role: "admin",
      createdAt: new Date(),
    });

    // Create a customer user
    this.usersMap.set(this.userIdCounter++, {
      id: 2,
      username: "cliente",
      password:
        "e3bc715f83803b24aee7c8126f22cca845617204917dbe7780d76313654dcf8c054f0b590178089ed62f9460c178aadbd7814361925192bbf2dc23639bd4e4d1.2f5c47acaaec2942b27c9d09bb3692d6", // "admin123"
      name: "Cliente Teste",
      email: "cliente@exemplo.com",
      role: "customer",
      createdAt: new Date(),
    });

    // Create categories
    const pizzasCategory: Category = {
      id: this.categoryIdCounter++,
      name: "Pizzas",
      slug: "pizzas",
    };
    const sidesCategory: Category = {
      id: this.categoryIdCounter++,
      name: "Acompanhamentos",
      slug: "sides",
    };
    const drinksCategory: Category = {
      id: this.categoryIdCounter++,
      name: "Bebidas",
      slug: "drinks",
    };
    const dessertsCategory: Category = {
      id: this.categoryIdCounter++,
      name: "Sobremesas",
      slug: "desserts",
    };

    // Add categories to map
    this.categoriesMap.set(pizzasCategory.id, pizzasCategory);
    this.categoriesMap.set(sidesCategory.id, sidesCategory);
    this.categoriesMap.set(drinksCategory.id, drinksCategory);
    this.categoriesMap.set(dessertsCategory.id, dessertsCategory);

    // Create menu items
    this.createMenuItem({
      name: "Pizza Margherita",
      description:
        "Tomates frescos, queijo mussarela, manjericão fresco, sal e azeite de oliva extra-virgem.",
      price: 12.99,
      imageUrl:
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: pizzasCategory.id,
      tags: ["Vegetariana", "Popular"],
      featured: true,
    });

    this.createMenuItem({
      name: "Pizza de Pepperoni",
      description:
        "Molho de tomate, queijo mussarela e deliciosas fatias de pepperoni.",
      price: 14.99,
      imageUrl:
        "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: pizzasCategory.id,
      tags: ["Mais Vendida"],
      featured: true,
    });

    this.createMenuItem({
      name: "Pizza Suprema",
      description:
        "Pepperoni, linguiça, pimentões, cebolas, azeitonas pretas, cogumelos e queijo extra.",
      price: 16.99,
      imageUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: pizzasCategory.id,
      tags: ["Especial"],
      featured: true,
    });

    this.createMenuItem({
      name: "Pizza de Frango com Barbecue",
      description:
        "Molho barbecue, frango grelhado, cebola roxa e coentro com uma mistura de queijos mussarela e gouda.",
      price: 15.99,
      imageUrl:
        "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: pizzasCategory.id,
      tags: ["Popular"],
      featured: false,
    });

    this.createMenuItem({
      name: "Suprema Vegetariana",
      description:
        "Cogumelos, pimentões verdes, cebolas, azeitonas pretas, tomates sobre uma camada de queijo mussarela.",
      price: 13.99,
      imageUrl:
        "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: pizzasCategory.id,
      tags: ["Vegetariana"],
      featured: false,
    });

    this.createMenuItem({
      name: "Frango Buffalo",
      description:
        "Molho buffalo picante, frango grelhado, cebola roxa e molho ranch.",
      price: 15.99,
      imageUrl:
        "https://images.unsplash.com/photo-1593246049226-ded77bf90326?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: pizzasCategory.id,
      tags: ["Picante"],
      featured: false,
    });

    this.createMenuItem({
      name: "Pão de Alho",
      description: "Pão assado no forno com manteiga de alho e ervas.",
      price: 4.99,
      imageUrl:
        "https://images.unsplash.com/photo-1619894991209-30b97fce9a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: sidesCategory.id,
      tags: ["Popular"],
      featured: false,
    });

    this.createMenuItem({
      name: "Refrigerante Cola (2L)",
      description: "Refrigerante refrescante de cola.",
      price: 2.99,
      imageUrl:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: drinksCategory.id,
      tags: [],
      featured: false,
    });

    // Create special offers
    this.createSpecialOffer({
      name: "Combo Família",
      description: "2 Pizzas Grandes, 1 Acompanhamento e um Refrigerante de 2L",
      price: 29.99,
      originalPrice: 42.99,
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
      active: true,
    });

    this.createSpecialOffer({
      name: "Especial do Almoço",
      description: "1 Pizza Média e Bebida",
      price: 11.99,
      originalPrice: 16.99,
      imageUrl:
        "https://images.unsplash.com/photo-1594007654729-407eedc4fe0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
      active: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date(), role: user.role || 'customer' };
    this.usersMap.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesMap.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categoriesMap.values()).find(
      (category) => category.slug === slug,
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categoriesMap.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(
    id: number,
    category: Partial<InsertCategory>,
  ): Promise<Category | undefined> {
    const existingCategory = this.categoriesMap.get(id);
    if (!existingCategory) return undefined;

    const updatedCategory = { ...existingCategory, ...category };
    this.categoriesMap.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categoriesMap.delete(id);
  }

  // Menu item methods
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItemsMap.get(id);
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItemsMap.values());
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItemsMap.values()).filter(
      (item) => item.categoryId === categoryId,
    );
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemIdCounter++;
    const newMenuItem: MenuItem = { 
      ...menuItem, 
      id,
      tags: menuItem.tags || null,
      available: menuItem.available !== undefined ? menuItem.available : true,
      featured: menuItem.featured !== undefined ? menuItem.featured : null
    };
    this.menuItemsMap.set(id, newMenuItem);
    return newMenuItem;
  }

  async updateMenuItem(
    id: number,
    menuItem: Partial<InsertMenuItem>,
  ): Promise<MenuItem | undefined> {
    const existingMenuItem = this.menuItemsMap.get(id);
    if (!existingMenuItem) return undefined;

    const updatedMenuItem = { ...existingMenuItem, ...menuItem };
    this.menuItemsMap.set(id, updatedMenuItem);
    return updatedMenuItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItemsMap.delete(id);
  }

  async getFeaturedMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItemsMap.values()).filter(
      (item) => item.featured,
    );
  }

  // Special offer methods
  async getSpecialOffer(id: number): Promise<SpecialOffer | undefined> {
    return this.specialOffersMap.get(id);
  }

  async getAllSpecialOffers(): Promise<SpecialOffer[]> {
    return Array.from(this.specialOffersMap.values());
  }

  async getActiveSpecialOffers(): Promise<SpecialOffer[]> {
    return Array.from(this.specialOffersMap.values()).filter(
      (offer) => offer.active,
    );
  }

  async createSpecialOffer(
    specialOffer: InsertSpecialOffer,
  ): Promise<SpecialOffer> {
    const id = this.specialOfferIdCounter++;
    const newSpecialOffer: SpecialOffer = { 
      ...specialOffer, 
      id,
      active: specialOffer.active !== undefined ? specialOffer.active : true
    };
    this.specialOffersMap.set(id, newSpecialOffer);
    return newSpecialOffer;
  }

  async updateSpecialOffer(
    id: number,
    specialOffer: Partial<InsertSpecialOffer>,
  ): Promise<SpecialOffer | undefined> {
    const existingSpecialOffer = this.specialOffersMap.get(id);
    if (!existingSpecialOffer) return undefined;

    const updatedSpecialOffer = { ...existingSpecialOffer, ...specialOffer };
    this.specialOffersMap.set(id, updatedSpecialOffer);
    return updatedSpecialOffer;
  }

  async deleteSpecialOffer(id: number): Promise<boolean> {
    return this.specialOffersMap.delete(id);
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.ordersMap.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.ordersMap.values());
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.ordersMap.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id,
      status: order.status || 'pending',
      userId: order.userId !== undefined ? order.userId : null,
      address: order.address || null,
      createdAt: now,
      updatedAt: now,
    };
    this.ordersMap.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(
    id: number,
    status: string,
  ): Promise<Order | undefined> {
    const existingOrder = this.ordersMap.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder = {
      ...existingOrder,
      status,
      updatedAt: new Date(),
    };
    this.ordersMap.set(id, updatedOrder);
    return updatedOrder;
  }

  // Pizza bases
  private pizzaBases: PizzaBase[] = [
    {
      id: 1,
      name: "Tradicional",
      description: "Nossa massa tradicional, fina e crocante",
      price: 10.99,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 2,
      name: "Integral",
      description: "Massa integral mais saudável e rica em fibras",
      price: 12.99,
      imageUrl: "https://images.unsplash.com/photo-1620374643809-b69c702d0ed4?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 3,
      name: "Sem Glúten",
      description: "Opção especial para intolerantes ao glúten",
      price: 13.99,
      imageUrl: "https://images.unsplash.com/photo-1552539618-7eec9b4d1796?auto=format&fit=crop&w=300&h=300&q=80"
    }
  ];

  // Pizza sizes
  private pizzaSizes: PizzaSize[] = [
    {
      id: 1,
      name: "Pequena (25cm)",
      multiplier: 0.8,
      description: "Ideal para 1 pessoa"
    },
    {
      id: 2,
      name: "Média (30cm)",
      multiplier: 1.0,
      description: "Para 2 pessoas"
    },
    {
      id: 3,
      name: "Grande (35cm)",
      multiplier: 1.2,
      description: "Para 3 pessoas"
    },
    {
      id: 4,
      name: "Família (40cm)",
      multiplier: 1.5,
      description: "Para 4-5 pessoas"
    }
  ];

  // Pizza crusts
  private pizzaCrusts: PizzaCrust[] = [
    {
      id: 1,
      name: "Fina",
      price: 0,
      description: "Massa fina e crocante"
    },
    {
      id: 2,
      name: "Tradicional",
      price: 0,
      description: "Espessura média e macia"
    },
    {
      id: 3,
      name: "Borda Recheada com Catupiry",
      price: 3.99,
      description: "Borda recheada com queijo tipo catupiry"
    },
    {
      id: 4,
      name: "Borda Recheada com Cheddar",
      price: 3.99,
      description: "Borda recheada com queijo cheddar cremoso"
    }
  ];

  // Pizza sauces
  private pizzaSauces: PizzaSauce[] = [
    {
      id: 1,
      name: "Molho de Tomate Tradicional",
      price: 0,
      description: "Molho clássico de tomate com ervas",
      imageUrl: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 2,
      name: "Molho Branco",
      price: 0.99,
      description: "Molho cremoso à base de queijo",
      imageUrl: "https://images.unsplash.com/photo-1583168641000-b48f999c93e0?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 3,
      name: "Molho de Barbecue",
      price: 0.99,
      description: "Molho agridoce defumado",
      imageUrl: "https://images.unsplash.com/photo-1601313816462-5644cf14eebf?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 4,
      name: "Molho Picante",
      price: 0.99,
      description: "Molho de tomate com pimenta",
      imageUrl: "https://images.unsplash.com/photo-1599311979600-a596f74a832c?auto=format&fit=crop&w=300&h=300&q=80"
    }
  ];

  // Pizza toppings
  private pizzaToppings: PizzaTopping[] = [
    // Queijos
    {
      id: 1,
      name: "Queijo Mussarela",
      price: 0,
      category: "Queijos",
      description: "Queijo mussarela tradicional",
      imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 2,
      name: "Queijo Parmesão",
      price: 1.99,
      category: "Queijos",
      description: "Queijo parmesão ralado",
      imageUrl: "https://images.unsplash.com/photo-1612165399985-1db5c62ae1e1?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 3,
      name: "Queijo Gorgonzola",
      price: 2.99,
      category: "Queijos",
      description: "Queijo azul com sabor forte",
      imageUrl: "https://images.unsplash.com/photo-1626957341926-98752fc2ba90?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 4,
      name: "Catupiry",
      price: 1.99,
      category: "Queijos",
      description: "Queijo cremoso tipo requeijão",
      imageUrl: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=300&h=300&q=80"
    },
    
    // Carnes
    {
      id: 5,
      name: "Pepperoni",
      price: 2.99,
      category: "Carnes",
      description: "Rodelas de salame pepperoni",
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 6,
      name: "Bacon",
      price: 2.49,
      category: "Carnes",
      description: "Bacon crocante em cubos",
      imageUrl: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 7,
      name: "Presunto",
      price: 1.99,
      category: "Carnes",
      description: "Cubos de presunto",
      imageUrl: "https://images.unsplash.com/photo-1609252644229-a34503634db5?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 8,
      name: "Calabresa",
      price: 1.99,
      category: "Carnes",
      description: "Calabresa fatiada",
      imageUrl: "https://images.unsplash.com/photo-1626082929540-4da5cde5f72b?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 9,
      name: "Frango Desfiado",
      price: 1.99,
      category: "Carnes",
      description: "Peito de frango desfiado temperado",
      imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&h=300&q=80"
    },
    
    // Vegetais
    {
      id: 10,
      name: "Tomate",
      price: 0.99,
      category: "Vegetais",
      description: "Tomate em fatias",
      imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 11,
      name: "Cebola",
      price: 0.99,
      category: "Vegetais",
      description: "Cebola em fatias",
      imageUrl: "https://images.unsplash.com/photo-1599200786358-4752e3471784?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 12,
      name: "Pimentão",
      price: 0.99,
      category: "Vegetais",
      description: "Mix de pimentões coloridos",
      imageUrl: "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 13,
      name: "Champignon",
      price: 1.99,
      category: "Vegetais",
      description: "Champignon fatiado",
      imageUrl: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 14,
      name: "Milho",
      price: 0.99,
      category: "Vegetais",
      description: "Milho verde",
      imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 15,
      name: "Azeitonas",
      price: 0.99,
      category: "Vegetais",
      description: "Azeitonas pretas fatiadas",
      imageUrl: "https://images.unsplash.com/photo-1618660854352-58ebc77674d2?auto=format&fit=crop&w=300&h=300&q=80"
    },
    
    // Especiais
    {
      id: 16,
      name: "Manjericão",
      price: 0.50,
      category: "Especiais",
      description: "Folhas de manjericão fresco",
      imageUrl: "https://images.unsplash.com/photo-1600717707657-53775bc58050?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 17,
      name: "Orégano",
      price: 0,
      category: "Especiais",
      description: "Orégano seco",
      imageUrl: "https://images.unsplash.com/photo-1600692980298-789d5abf88af?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 18,
      name: "Azeite de Oliva",
      price: 0.50,
      category: "Especiais",
      description: "Azeite de oliva extra virgem",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&h=300&q=80"
    },
    {
      id: 19,
      name: "Parmesão Ralado",
      price: 0.99,
      category: "Especiais",
      description: "Parmesão ralado na hora",
      imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&h=300&q=80"
    }
  ];

  // Implementação dos métodos para customização de pizza
  async getPizzaBases(): Promise<PizzaBase[]> {
    return this.pizzaBases;
  }

  async getPizzaSizes(): Promise<PizzaSize[]> {
    return this.pizzaSizes;
  }

  async getPizzaCrusts(): Promise<PizzaCrust[]> {
    return this.pizzaCrusts;
  }

  async getPizzaSauces(): Promise<PizzaSauce[]> {
    return this.pizzaSauces;
  }

  async getPizzaToppings(): Promise<PizzaTopping[]> {
    return this.pizzaToppings;
  }

  async getPizzaToppingsByCategory(): Promise<Record<string, PizzaTopping[]>> {
    return this.pizzaToppings.reduce((acc, topping) => {
      if (!acc[topping.category]) {
        acc[topping.category] = [];
      }
      acc[topping.category].push(topping);
      return acc;
    }, {} as Record<string, PizzaTopping[]>);
  }
}

export const storage = new MemStorage();
