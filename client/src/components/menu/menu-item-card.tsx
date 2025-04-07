import { MenuItem } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Flame, Leaf, AlertTriangle } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl
    });
  };

  // Helper function to get the appropriate icon for each tag
  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'popular':
      case 'bestseller':
      case 'fire':
        return <Flame className="text-[#FFA41B] h-4 w-4 mr-1" />;
      case 'veggie':
      case 'vegetarian':
      case 'vegan':
        return <Leaf className="text-[#2C5530] h-4 w-4 mr-1" />;
      case 'spicy':
        return <AlertTriangle className="text-[#D73C2C] h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full overflow-hidden">
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="w-full h-52 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-bold text-xl">{item.name}</h3>
          <span className="text-[#D73C2C] font-bold">{formatCurrency(item.price)}</span>
        </div>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-wrap gap-2">
            {item.tags && item.tags.map((tag, index) => (
              <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded flex items-center">
                {getTagIcon(tag)}
                {tag}
              </span>
            ))}
          </div>
          <Button 
            onClick={handleAddToCart}
            className="bg-[#D73C2C] hover:bg-red-700 text-white rounded-full"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
