import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import CartModal from '@/components/cart/cart-modal';
import { Menu, User, ShoppingCart, X } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { openCart, itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-primary font-heading font-bold text-2xl">
              Bella Pizza
            </Link>
            
            <nav className="hidden md:flex ml-8">
              <Link href="/" className={`px-3 py-2 ${isActive('/') ? 'text-primary font-medium' : 'text-textColor hover:text-primary font-medium'}`}>
                Início
              </Link>
              <Link href="/menu" className={`px-3 py-2 ${isActive('/menu') ? 'text-primary font-medium' : 'text-textColor hover:text-primary font-medium'}`}>
                Cardápio
              </Link>
              <Link href="/monte-sua-pizza" className={`px-3 py-2 ${isActive('/monte-sua-pizza') ? 'text-primary font-medium' : 'text-textColor hover:text-primary font-medium'}`}>
                Monte Sua Pizza
              </Link>
              {(user?.role === 'admin' || user?.role === 'admin_master') && (
                <Link href="/admin" className="px-3 py-2 text-primary font-bold">
                  Painel Admin
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div 
              className="relative cursor-pointer" 
              onClick={openCart}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="text-xl text-textColor" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {itemCount}
                </span>
              )}
            </div>
            
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5 mr-2" />
                    Entrar / Cadastrar
                  </Button>
                </Link>
              )}
            </div>
            
            <button
              className="block md:hidden"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-textColor" />
              ) : (
                <Menu className="h-6 w-6 text-textColor" />
              )}
            </button>
          </div>
        </div>
        
        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col mt-4 pb-2">
            <Link href="/" className={`px-3 py-2 ${isActive('/') ? 'text-primary' : 'text-textColor hover:text-primary'}`}>
              Início
            </Link>
            <Link href="/menu" className={`px-3 py-2 ${isActive('/menu') ? 'text-primary' : 'text-textColor hover:text-primary'}`}>
              Cardápio
            </Link>
            <Link href="/monte-sua-pizza" className={`px-3 py-2 ${isActive('/monte-sua-pizza') ? 'text-primary' : 'text-textColor hover:text-primary'}`}>
              Monte Sua Pizza
            </Link>
            {user ? (
              <>
                <div className="px-3 py-2 font-medium">{user.name}</div>
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-2 text-left text-textColor hover:text-primary"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link href="/auth" className="px-3 py-2 text-textColor hover:text-primary">
                Entrar / Cadastrar
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'admin_master') && (
              <Link href="/admin" className="px-3 py-2 text-primary font-bold">
                Painel Admin
              </Link>
            )}
          </nav>
        )}
      </div>
      
      {/* Cart Modal */}
      <CartModal />
    </header>
  );
}
