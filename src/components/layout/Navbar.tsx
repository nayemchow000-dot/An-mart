import { useSiteConfigStore } from '../../store/useSiteConfigStore';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, Phone, MapPin, LogOut, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartItemsCount = getTotalItems();
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);
  const { publishedConfig } = useSiteConfigStore();
  const storeName = publishedConfig?.branding?.storeName || 'AN Mart';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm flex flex-col">
      {/* Top Bar (Desktop) */}
      <div className="bg-[#FAFAFA] text-gray-600 text-[11px] md:text-xs py-1.5 border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/support" className="flex items-center gap-1.5 hover:text-[#c2a578] cursor-pointer transition-colors">
              <Phone size={12} /> Support: +880 1234-567890
            </Link>
            <Link to="/track-order" className="flex items-center gap-1.5 hover:text-[#c2a578] cursor-pointer transition-colors">
              <MapPin size={12} /> Track Order
            </Link>
          </div>
          <div className="flex items-center gap-4 font-medium tracking-wide">
            <span className="text-[#c2a578]">Free Delivery on orders over ৳5000!</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4 lg:gap-8">
            
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-3 md:gap-0 flex-shrink-0">
              <button 
                className="md:hidden p-1 text-gray-600 hover:text-[#c2a578] transition-colors -ml-1" 
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
              <Link to="/" className="flex items-center">
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a]">
                  {storeName}
                </span>
              </Link>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative flex shadow-sm">
                <input 
                  type="text" 
                  placeholder="Search for cosmetics, skincare, jewellery..." 
                  className="w-full bg-[#f9f9f9] border border-gray-200 text-gray-900 rounded-l-md pl-4 pr-10 py-2.5 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#c2a578] focus:border-[#c2a578] transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-[#1a1a1a] text-white px-6 rounded-r-md hover:bg-[#c2a578] transition-colors flex items-center justify-center">
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
               {/* User Dropdown */}
               <div className="relative group hidden md:block">
                 <Link to={isAuthenticated ? "/profile" : "/login"} className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#c2a578] transition-colors py-2">
                   <User size={22} strokeWidth={1.5} />
                   <span className="text-[10px] font-medium uppercase tracking-wider">{isAuthenticated ? 'Profile' : 'Sign In'}</span>
                 </Link>
                 
                 {/* Hover Dropdown */}
                 {isAuthenticated && (
                   <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-gray-100 shadow-xl rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                     <div className="p-3 border-b border-gray-100">
                       <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Customer'}</p>
                       <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                     </div>
                     <div className="py-1">
                       {user?.role === 'admin' && (
                         <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c2a578]">Admin Dashboard</Link>
                       )}
                       <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#c2a578]">My Orders</Link>
                       <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                         <LogOut size={16} /> Sign Out
                       </button>
                     </div>
                   </div>
                 )}
               </div>

               {/* Wishlist */}
               <Link to="/wishlist" className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#c2a578] transition-colors relative py-2">
                 <div className="relative">
                   <Heart size={22} strokeWidth={1.5} />
                   {wishlistItemsCount > 0 && (
                     <span className="absolute -top-1.5 -right-2 bg-[#c2a578] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                       {wishlistItemsCount}
                     </span>
                   )}
                 </div>
                 <span className="hidden md:block text-[10px] font-medium uppercase tracking-wider">Wishlist</span>
               </Link>

               {/* Cart */}
               <Link to="/cart" className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#c2a578] transition-colors relative py-2">
                 <div className="relative">
                   <ShoppingBag size={22} strokeWidth={1.5} />
                   {cartItemsCount > 0 && (
                     <span className="absolute -top-1.5 -right-2 bg-[#1a1a1a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                       {cartItemsCount}
                     </span>
                   )}
                 </div>
                 <span className="hidden md:block text-[10px] font-medium uppercase tracking-wider">Cart</span>
               </Link>
            </div>
          </div>

          {/* Mobile Search Bar (Row 2) */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="w-full relative flex">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-[#f8f8f8] border border-gray-200 text-gray-900 rounded-md pl-4 pr-10 py-2 focus:outline-none focus:border-[#c2a578] focus:bg-white text-sm transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-gray-500 hover:text-[#c2a578] flex items-center justify-center">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Categories (Mega Menu Bar) */}
      <div className="hidden md:block bg-white shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-8 h-12">
            {[
              { name: 'Makeup', path: '/category/makeup' },
              { name: 'Skin Care', path: '/category/skincare' },
              { name: 'Hair Care', path: '/category/haircare' },
              { name: 'Jewellery', path: '/category/jewellery' },
              { name: 'Personal Care', path: '/category/personal-care' },
              { name: 'Fragrance', path: '/category/fragrance' },
              { name: 'Brands', path: '/brands' },
            ].map((cat) => (
              <Link 
                key={cat.name} 
                to={cat.path} 
                className="text-sm font-medium text-gray-700 hover:text-[#c2a578] hover:border-b-2 border-[#c2a578] h-full flex items-center px-1 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link 
              to="/offers" 
              className="text-sm font-bold text-red-600 hover:text-red-700 h-full flex items-center px-1"
            >
              Offers
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]">
              <span className="font-serif text-xl font-bold tracking-tight text-[#1a1a1a]">
                {storeName}
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col space-y-1 px-4">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg">Home</Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg">Shop All</Link>
                <Link to="/category/cosmetics" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg">Cosmetics</Link>
                <Link to="/category/skincare" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg">Skincare</Link>
                <Link to="/category/jewellery" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg">Jewellery</Link>
                <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-3">
                  <MapPin size={18} className="text-[#c2a578]" /> Track Order
                </Link>
                <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-900 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-3">
                  <Phone size={18} className="text-[#c2a578]" /> Customer Support
                </Link>
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-[#FAFAFA]">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-900 font-medium px-4 py-2">
                    <User size={18} className="text-gray-500" /> My Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-900 font-medium px-4 py-2">
                      <Menu size={18} className="text-gray-500" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 text-red-600 font-medium px-4 py-2">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full flex justify-center py-2.5">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
