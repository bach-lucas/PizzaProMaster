import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const CartModal = () => {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    updateSpecialInstructions,
    subtotal,
    deliveryFee,
    total 
  } = useCart();

  const [editingInstructions, setEditingInstructions] = useState<number | null>(null);
  const [currentInstructions, setCurrentInstructions] = useState("");

  const handleInstructionsEdit = (itemId: number, instructions: string = "") => {
    setEditingInstructions(itemId);
    setCurrentInstructions(instructions);
  };

  const saveInstructions = (itemId: number) => {
    updateSpecialInstructions(itemId, currentInstructions);
    setEditingInstructions(null);
    setCurrentInstructions("");
  };

  return (
    <Dialog open={isCartOpen} onOpenChange={closeCart}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Your Cart</DialogTitle>
        </DialogHeader>
        
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">Your cart is empty</h3>
            <p className="mb-6 text-gray-600">Looks like you haven't added any items to your cart yet.</p>
            <Button onClick={closeCart} variant="default">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex border-b border-gray-200 pb-4">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-heading font-medium">{item.name}</h4>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-gray-600 mt-1 mb-1">
                        {item.description}
                      </p>
                    )}
                    
                    {editingInstructions === item.id ? (
                      <div className="mt-1">
                        <Input
                          value={currentInstructions}
                          onChange={(e) => setCurrentInstructions(e.target.value)}
                          placeholder="Special instructions..."
                          className="text-sm mb-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => saveInstructions(item.id)}
                          className="text-xs"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.specialInstructions ? (
                          <>
                            {item.specialInstructions}
                            <button 
                              onClick={() => handleInstructionsEdit(item.id, item.specialInstructions)}
                              className="ml-2 text-xs text-primary hover:underline"
                            >
                              Edit
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleInstructionsEdit(item.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            Add special instructions
                          </button>
                        )}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <button 
                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="mx-3 font-medium">{item.quantity}</span>
                      <button 
                        className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button 
                        className="ml-auto text-gray-400 hover:text-primary"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery Fee</span>
                <span className="font-bold">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl">{formatCurrency(total)}</span>
              </div>
              
              <div className="space-y-2">
                <Link href="/checkout">
                  <Button className="w-full" onClick={closeCart}>
                    Proceed to Checkout
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={closeCart}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
