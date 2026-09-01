import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export default function MobileBottomNav() {
  const location = useLocation();
  const { getTotalItems } = useCartStore();
  const cartItemsCount = getTotalItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === '/' ? 'text-primary' : 'text-dark-light hover:text-primary'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link 
          to="/shop" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === '/shop' ? 'text-primary' : 'text-dark-light hover:text-primary'
          }`}
        >
          <Search size={20} />
          <span className="text-[10px] font-medium">Shop</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`relative flex flex-col items-center gap-1 transition-colors ${
            location.pathname === '/cart' ? 'text-primary' : 'text-dark-light hover:text-primary'
          }`}
        >
          <div className="relative">
            <ShoppingBag size={20} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === '/profile' ? 'text-primary' : 'text-dark-light hover:text-primary'
          }`}
        >
          <User size={20} />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </div>
  );
}
