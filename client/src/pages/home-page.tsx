import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MenuItemCard from "@/components/menu/menu-item-card";
import SpecialOfferCard from "@/components/menu/special-offer-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowDown, ArrowRight } from "lucide-react";
import { MenuItem, SpecialOffer } from "@shared/schema";

export default function HomePage() {
  const { data: featuredItems, isLoading: isLoadingFeatured } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu/featured"],
  });

  const { data: specialOffers, isLoading: isLoadingOffers } = useQuery<SpecialOffer[]>({
    queryKey: ["/api/offers/active"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Seção Principal */}
        <section className="relative bg-[#D73C2C] text-white overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 hero-container">
            <div className="max-w-3xl relative hero-text">
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 text-shadow">
                Pizza Italiana Autêntica Entregue Quentinha & Fresca
              </h1>
              <p className="text-lg mb-8 text-shadow">
                Feita artesanalmente com ingredientes premium e assada à perfeição em nossos fornos a lenha
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button className="bg-[#FFA41B] hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full drop-shadow-md">
                    Peça Agora
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" className="bg-transparent hover:bg-white hover:text-[#D73C2C] border-2 border-white text-white font-bold py-3 px-8 rounded-full drop-shadow-md">
                    Ver Cardápio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Imagem em background com media queries para ajustar posicionamento */}
          <div className="absolute top-0 right-0 w-full md:w-1/2 lg:w-2/5 h-full opacity-20 md:opacity-80 pointer-events-none hero-image">
            <div className="relative w-full h-full md:left-16 xl:left-24">
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Deliciosa pizza artesanal" 
                className="object-cover h-full w-full md:rounded-l-[50px]"
              />
              {/* Gradiente sobreposto para melhorar legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D73C2C] via-[#D73C2C] to-transparent opacity-90 md:opacity-50"></div>
            </div>
          </div>
          
          {/* Proteção adicional para garantir que o texto seja legível */}
          <div className="hidden md:block absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#D73C2C] to-transparent opacity-70 z-[1]"></div>
        </section>

        {/* Seção de Itens em Destaque */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-8">
              Destaques do Cardápio
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoadingFeatured ? (
                // Estado de carregamento
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md h-80 animate-pulse">
                    <div className="w-full h-52 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : featuredItems && featuredItems.length > 0 ? (
                // Exibir itens em destaque
                featuredItems.slice(0, 3).map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">Nenhum item em destaque disponível.</p>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Link href="/menu">
                <Button variant="outline" className="bg-[#FFA41B] hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center">
                  <span>Ver Cardápio Completo</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seção de Ofertas Especiais */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-8">
              Ofertas Especiais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoadingOffers ? (
                // Estado de carregamento
                Array(2).fill(0).map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
                ))
              ) : specialOffers && specialOffers.length > 0 ? (
                // Exibir ofertas especiais
                specialOffers.slice(0, 2).map((offer, index) => (
                  <SpecialOfferCard key={offer.id} offer={offer} isInverted={index % 2 !== 0} />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">Não há ofertas especiais disponíveis no momento.</p>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Seção Sobre Nós */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">Nossa História</h2>
                <p className="text-gray-700 mb-4">
                  Na Pizza ZZA forno a lenha, estamos preparando autênticas pizzas italianas há mais de 25 anos. Nossas receitas foram transmitidas por gerações, e temos orgulho de usar apenas os ingredientes mais frescos.
                </p>
                <p className="text-gray-700 mb-6">
                  Nossa massa é feita fresca diariamente, e nosso molho é preparado com tomates selecionados à mão e uma mistura secreta de ervas e especiarias.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-[#D73C2C] hover:text-red-700 font-bold">Saiba mais sobre nós</a>
                  <a href="#" className="text-[#D73C2C] hover:text-red-700 font-bold">Veja nossas unidades</a>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Interior do restaurante" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Chef preparando pizza" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Pizza fresca" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1600628421055-4d30de868b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Experiência gastronômica" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
