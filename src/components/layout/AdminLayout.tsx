import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Layers,
  Award,
  MessageSquare,
  Gift,
  Image as ImageIcon,
  Layout,
  Search,
  FileText,
  Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Security Verification (Role-based access control)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Logged out from admin panel');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Layers size={20} /> },
    { name: 'Brands', path: '/admin/brands', icon: <Award size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={20} /> },
    { name: 'Offers', path: '/admin/offers', icon: <Gift size={20} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <Tag size={20} /> },
    { name: 'Media Library', path: '/admin/media', icon: <ImageIcon size={20} /> },
    { name: 'Landing Pages', path: '/admin/landing-pages', icon: <Layout size={20} /> },
    { name: 'SEO', path: '/admin/seo', icon: <Search size={20} /> },
    { name: 'Website Content', path: '/admin/content', icon: <FileText size={20} /> },
    { name: 'Legal Pages', path: '/admin/legal', icon: <Shield size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 shadow-sm
        transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <Link to="/admin" className="font-serif text-2xl font-bold text-primary">
            AN Mart <span className="text-sm font-sans font-normal text-gray-500">Admin</span>
          </Link>
          <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Navigation Area */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm ${
                  isActive 
                    ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout (Fixed at Bottom) */}
        <div className="p-4 border-t border-gray-200 shrink-0 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@anmart.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden shrink-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-30">
          <button 
            className="p-2 text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-serif text-xl font-bold text-primary">AN Mart Admin</span>
        </header>
        
        {/* Main Scrollable Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
