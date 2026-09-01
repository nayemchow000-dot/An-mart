import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Heart, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Successfully logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Profile | AN Mart</title>
      </Helmet>

      <div className="bg-[#FAFAFA] min-h-screen py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-dark mb-8">My Account</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="card-premium p-6 self-start">
              <div className="flex items-center gap-4 mb-6 border-b border-cream pb-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-dark">{user.name}</h2>
                  <p className="text-sm text-dark-light">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                {user.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium bg-primary text-white hover:bg-primary-600 transition-colors mb-4"
                  >
                    <LayoutDashboard size={18} /> Go to Admin Panel
                  </button>
                )}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-dark hover:bg-cream transition-colors">
                  <Package size={18} className="text-dark-light" /> My Orders
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-dark hover:bg-cream transition-colors"
                >
                  <Heart size={18} className="text-dark-light" /> Wishlist
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-2 space-y-6">
              <div className="card-premium p-6 sm:p-8">
                <h3 className="font-serif font-bold text-xl mb-6">Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-light mb-1">Full Name</label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg font-medium">{user.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-light mb-1">Email Address</label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg font-medium">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-light mb-1">Phone Number</label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg font-medium">{user.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-light mb-1">Account Role</label>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg font-medium capitalize">{user.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
