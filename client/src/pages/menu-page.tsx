import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MenuItemCard from "@/components/menu/menu-item-card";
import SpecialOfferCard from "@/components/menu/special-offer-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category, MenuItem, SpecialOffer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenuPage() {
  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch all menu items
  const { data: allMenuItems, isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  // Fetch special offers
  const { data: specialOffers, isLoading: isLoadingOffers } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/offers/active"],
  });

  // State for active category
  const [activeCategory, setActiveCategory] = useState<number | "all" | "offers">("all");

  // Filter menu items by category
  const filteredItems = allMenuItems && activeCategory !== "all" && activeCategory !== "offers" 
    ? allMenuItems.filter(item => item.categoryId === activeCategory)
    : allMenuItems;

  // Handle category change
  const handleCategoryChange = (categoryId: number | "all" | "offers") => {
    setActiveCategory(categoryId);
  };

  // Display loading skeletons while data is being fetched
  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="w-full h-52" />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-[#D73C2C] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-center">Nosso Cardápio</h1>
            <p className="text-center mt-2">Preparado com ingredientes premium e assado à perfeição</p>
          </div>
        </section>

        {/* Menu Categories Tabs */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-8">
              {isLoadingCategories ? (
                <div className="flex overflow-x-auto pb-4 justify-center space-x-2">
                  {Array(4).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-24 rounded mx-1" />
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="all" className="w-full max-w-3xl">
                  <TabsList className="flex justify-start overflow-x-auto pb-2 mb-4 w-full h-auto flex-wrap">
                    <TabsTrigger 
                      value="all" 
                      className={`tab ${activeCategory === "all" ? "active-tab" : ""} mx-2 px-4 py-2 whitespace-nowrap font-heading text-lg`}
                      onClick={() => handleCategoryChange("all")}
                    >
                      Todos os Itens
                    </TabsTrigger>
                    
                    {categories?.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={String(category.id)}
                        className={`tab ${activeCategory === category.id ? "active-tab" : ""} mx-2 px-4 py-2 whitespace-nowrap font-heading text-lg`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                    
                    <TabsTrigger
                      value="offers"
                      className={`tab ${activeCategory === "offers" ? "active-tab" : ""} mx-2 px-4 py-2 whitespace-nowrap font-heading text-lg`}
                      onClick={() => handleCategoryChange("offers")}
                    >
                      Ofertas Especiais
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>

            {/* Special Offers (Only shown when offers tab is active) */}
            {activeCategory === "offers" && (
              <div className="grid grid-cols-1 gap-6 mb-12">
                {isLoadingOffers ? (
                  Array(2).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-64 w-full rounded-lg" />
                  ))
                ) : specialOffers && specialOffers.length > 0 ? (
                  specialOffers.map((offer, index) => (
                    <SpecialOfferCard key={offer.id} offer={offer} isInverted={index % 2 !== 0} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Não há ofertas especiais disponíveis no momento.</p>
                  </div>
                )}
              </div>
            )}

            {/* Menu Items (Shown for all tabs except offers) */}
            {activeCategory !== "offers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {isLoadingMenuItems ? (
                  renderSkeletons(6)
                ) : filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">Nenhum item encontrado nesta categoria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
