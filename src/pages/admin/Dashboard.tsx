import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  DollarSign, ShoppingCart, ShoppingBag, Users, 
  ArrowUpRight, Plus, Layers, ImageIcon,
  Package, LayoutTemplate, ShieldCheck, Activity,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import { supabase, isSupabaseConfigured } from '../../config/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Orders Stats
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('grand_total');
        
        if (ordersError) throw ordersError;

        const totalRevenue = ordersData?.reduce((sum, order) => sum + (Number(order.grand_total) || 0), 0) || 0;
        const totalOrders = ordersData?.length || 0;

        // Fetch Products Count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Fetch Customers Count
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');

        // Fetch Recent Orders
        const { data: recent } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          revenue: totalRevenue,
          orders: totalOrders,
          products: productsCount || 0,
          customers: customersCount || 0
        });

        setRecentOrders(recent || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(stats.revenue), 
      icon: <DollarSign size={24} />, 
      trend: '0.0%',
      gradient: 'from-[#FF6B6B] to-[#FF8E53]',
      shadow: 'shadow-[#FF6B6B]/20'
    },
    { 
      title: 'Total Orders', 
      value: stats.orders.toString(), 
      icon: <ShoppingCart size={24} />, 
      trend: '0.0%',
      gradient: 'from-[#4FACFE] to-[#00F2FE]',
      shadow: 'shadow-[#4FACFE]/20'
    },
    { 
      title: 'Total Products', 
      value: stats.products.toString(), 
      icon: <ShoppingBag size={24} />, 
      trend: '0.0%',
      gradient: 'from-[#FA709A] to-[#FEE140]',
      shadow: 'shadow-[#FA709A]/20'
    },
    { 
      title: 'Total Customers', 
      value: stats.customers.toString(), 
      icon: <Users size={24} />, 
      trend: '0.0%',
      gradient: 'from-[#667EEA] to-[#764BA2]',
      shadow: 'shadow-[#667EEA]/20'
    },
  ];

  const quickActions = [
    { title: 'Add Product', icon: <Plus size={20} />, link: '/admin/products/add', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Manage Products', icon: <Package size={20} />, link: '/admin/products', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Categories', icon: <Layers size={20} />, link: '/admin/categories', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Orders', icon: <ShoppingCart size={20} />, link: '/admin/orders', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Customers', icon: <Users size={20} />, link: '/admin/customers', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Store Design', icon: <LayoutTemplate size={20} />, link: '/admin/content', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AN Mart</title>
      </Helmet>
      
      {/* Radiant Background Wrapper */}
      <div className="relative -m-4 md:-m-8 p-4 md:p-8 min-h-[calc(100vh-4rem)] overflow-hidden bg-gray-50/50">
        {/* Animated Glow Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow pointer-events-none" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Dashboard Overview
              </h1>
              <p className="text-gray-500 mt-1">Welcome back to your store admin panel.</p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-primary text-sm font-medium bg-primary/5 px-4 py-2 rounded-full self-start sm:self-auto">
                <Activity size={16} className="animate-spin" />
                Syncing Data...
              </div>
            )}
          </div>

          {/* Stats Grid - Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {statCards.map((stat, idx) => (
              <div 
                key={idx} 
                className="relative overflow-hidden bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {stat.trend} <Activity size={12} className="ml-1" />
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions & Setup Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={24} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                  <Link 
                    key={idx}
                    to={action.link} 
                    className="flex flex-col items-center justify-center p-5 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/80 hover:border-primary/30 hover:bg-white/80 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Store Status widget */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Activity className="text-blue-500" size={24} />
                Store Status
              </h2>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-[40px]"></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Online & Active</h3>
                    <p className="text-gray-400 text-sm">Accepting new orders</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Payment Gateway</span>
                    <span className="flex items-center text-green-400 gap-1"><ShieldCheck size={14} /> Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Database Sync</span>
                    <span className="flex items-center text-green-400 gap-1"><Activity size={14} /> Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Grid */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden">
            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/40">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-primary" size={24} />
                Recent Orders
              </h2>
              <Link to="/admin/orders" className="text-sm text-primary font-semibold hover:underline">View All Orders</Link>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                  <Activity size={32} className="animate-spin text-primary/40 mb-3" />
                  <p>Loading recent orders...</p>
                </div>
              ) : recentOrders.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="p-5">Order ID</th>
                      <th className="p-5">Customer</th>
                      <th className="p-5">Date</th>
                      <th className="p-5">Status</th>
                      <th className="p-5">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {recentOrders.map((order) => {
                      const customerName = order.customer_info?.name || 'Unknown Customer';
                      const date = new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      });
                      
                      return (
                        <tr key={order.id} className="hover:bg-white/80 transition-colors">
                          <td className="p-5 font-medium text-gray-900">
                            <Link to="/admin/orders" className="hover:text-primary transition-colors">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </td>
                          <td className="p-5 text-gray-600 font-medium">{customerName}</td>
                          <td className="p-5 text-gray-500">{date}</td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                          </td>
                          <td className="p-5 font-bold text-gray-900">
                            {formatPrice(order.grand_total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <Package size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Your store is ready. New orders will appear here as soon as customers make a purchase.
                  </p>
                  <Link to="/admin/products/add" className="btn-primary py-2.5 px-6">
                    Add Your First Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
