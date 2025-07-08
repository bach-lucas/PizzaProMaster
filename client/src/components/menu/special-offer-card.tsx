import { SpecialOffer } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface SpecialOfferCardProps {
  offer: SpecialOffer;
  isInverted?: boolean;
}

export default function SpecialOfferCard({ offer, isInverted = false }: SpecialOfferCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: offer.id,
      name: offer.name,
      price: offer.price,
      quantity: 1,
      imageUrl: offer.imageUrl
    });
  };

  const bgColor = isInverted ? "bg-[#69300a]" : "bg-[#94845c]";
  const textColor = isInverted ? "text-[#69300a]" : "text-[#94845c]";

  return (
    <div className={`${bgColor} rounded-lg overflow-hidden flex flex-col md:flex-row`}>
      <div className="md:w-2/5 p-6 flex items-center justify-center">
        <img 
          src={offer.imageUrl} 
          alt={offer.name} 
          className="rounded-full w-40 h-40 object-cover" 
        />
      </div>
      <div className="md:w-3/5 p-6 text-white">
        <h3 className="font-heading font-bold text-2xl mb-2">{offer.name}</h3>
        <p className="mb-4">{offer.description}</p>
        <div className="flex items-center mb-4">
          <span className="text-2xl font-bold">{formatCurrency(offer.price)}</span>
          <span className="ml-2 line-through opacity-75">{formatCurrency(offer.originalPrice)}</span>
        </div>
        <Button 
          onClick={handleAddToCart}
          className="bg-white hover:bg-gray-100 font-bold py-2 px-6 rounded-full"
          style={{ color: isInverted ? '#69300a' : '#94845c' }}
        >
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
}
