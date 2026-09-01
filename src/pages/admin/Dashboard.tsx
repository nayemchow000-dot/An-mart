import { Helmet } from 'react-helmet-async';
import { DollarSign, ShoppingBag, ShoppingCart, Users, ArrowUpRight, Plus, Layers, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

export default function Dashboard() {
  const stats = [
    { title: 'Total Revenue', value: formatPrice(125000), icon: <DollarSign size={24} />, trend: '+12.5%' },
    { title: 'Total Orders', value: '450', icon: <ShoppingCart size={24} />, trend: '+8.2%' },
    { title: 'Total Products', value: '124', icon: <ShoppingBag size={24} />, trend: '+2' },
    { title: 'Total Customers', value: '892', icon: <Users size={24} />, trend: '+15.3%' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AN Mart</title>
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/admin/products/add" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Add Product</span>
            </Link>
            <Link to="/admin/products" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <ShoppingBag size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Products</span>
            </Link>
            <Link to="/admin/categories" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <Layers size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Categories</span>
            </Link>
            <Link to="/admin/orders" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <ShoppingCart size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Orders</span>
            </Link>
            <Link to="/admin/customers" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Customers</span>
            </Link>
            <Link to="/admin/media" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <ImageIcon size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Media Library</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend} <ArrowUpRight size={14} className="ml-1" />
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders & Low Stock (Placeholder Grids) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">#ORD-{8000 + item}</td>
                      <td className="p-4 text-gray-600">Customer Name {item}</td>
                      <td className="p-4 text-gray-500">Oct {10 + item}, 2024</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Processing
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-900">{formatPrice(1250 + (item * 500))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Low Stock Alert</h2>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">Product Name Example {item}</h4>
                    <p className="text-xs text-red-500 mt-1 font-medium">Only {item + 1} left in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
