import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, Phone, MapPin, LogOut } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const cartItemsCount = getTotalItems();
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
            <span className="flex items-center gap-1.5 hover:text-[#c2a578] cursor-pointer transition-colors">
              <Phone size={12} /> Support: +880 1234-567890
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#c2a578] cursor-pointer transition-colors">
              <MapPin size={12} /> Track Order
            </span>
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
              <button className="md:hidden p-1 text-gray-600 hover:text-[#c2a578] transition-colors -ml-1" aria-label="Menu">
                <Menu size={24} strokeWidth={1.5} />
              </button>
              <Link to="/" className="flex items-center">
                <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a]">
                  AN <span className="text-[#c2a578]">Mart</span>
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
    </header>
  );
}
