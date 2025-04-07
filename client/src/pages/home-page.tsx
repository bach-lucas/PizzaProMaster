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
        {/* Hero Section */}
        <section className="relative bg-[#D73C2C] text-white">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
                Authentic Italian Pizza Delivered Hot & Fresh
              </h1>
              <p className="text-lg mb-8">
                Handcrafted with premium ingredients and baked to perfection in our brick ovens
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button className="bg-[#FFA41B] hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full">
                    Order Now
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" className="bg-transparent hover:bg-white hover:text-[#D73C2C] border-2 border-white text-white font-bold py-3 px-8 rounded-full">
                    View Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-full md:w-1/2 lg:w-2/5 h-full opacity-20 md:opacity-100">
            <img 
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Delicious pizza" 
              className="object-cover h-full w-full"
            />
          </div>
        </section>

        {/* Featured Menu Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-8">
              Featured Items
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoadingFeatured ? (
                // Loading state
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
                // Display featured items
                featuredItems.slice(0, 3).map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No featured items available.</p>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Link href="/menu">
                <Button variant="outline" className="bg-[#FFA41B] hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center">
                  <span>View Full Menu</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-8">
              Special Offers
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoadingOffers ? (
                // Loading state
                Array(2).fill(0).map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
                ))
              ) : specialOffers && specialOffers.length > 0 ? (
                // Display special offers
                specialOffers.slice(0, 2).map((offer, index) => (
                  <SpecialOfferCard key={offer.id} offer={offer} isInverted={index % 2 !== 0} />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-500">No special offers available right now.</p>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">Our Story</h2>
                <p className="text-gray-700 mb-4">
                  At Bella Pizza, we've been crafting authentic Italian pizzas for over 25 years. Our recipes have been passed down through generations, and we take pride in using only the freshest ingredients.
                </p>
                <p className="text-gray-700 mb-6">
                  Our dough is made fresh daily, and our sauce is prepared with hand-selected tomatoes and a secret blend of herbs and spices.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-[#D73C2C] hover:text-red-700 font-bold">Learn more about us</a>
                  <a href="#" className="text-[#D73C2C] hover:text-red-700 font-bold">See our locations</a>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Restaurant interior" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Chef preparing pizza" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Fresh pizza" 
                    className="rounded-lg shadow-md object-cover h-48"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1600628421055-4d30de868b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Dining experience" 
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
