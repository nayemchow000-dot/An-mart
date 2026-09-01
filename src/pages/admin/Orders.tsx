import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Eye, Filter } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockOrders = [
    { id: 'ORD-8005', customer: 'Nayem Chowdhury', date: 'Oct 15, 2024', status: 'Pending', total: 4500, method: 'bKash' },
    { id: 'ORD-8004', customer: 'Sarah Islam', date: 'Oct 14, 2024', status: 'Processing', total: 2250, method: 'COD' },
    { id: 'ORD-8003', customer: 'Rakib Hasan', date: 'Oct 14, 2024', status: 'Shipped', total: 8900, method: 'Nagad' },
    { id: 'ORD-8002', customer: 'Tania Akter', date: 'Oct 13, 2024', status: 'Delivered', total: 1250, method: 'Card' },
    { id: 'ORD-8001', customer: 'Mehdi Hasan', date: 'Oct 12, 2024', status: 'Cancelled', total: 3400, method: 'COD' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800'; // Pending
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Orders | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{order.id}</td>
                    <td className="p-4 text-gray-700">{order.customer}</td>
                    <td className="p-4 text-gray-500">{order.date}</td>
                    <td className="p-4 text-gray-700">{order.method}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 text-primary hover:bg-primary-50 rounded transition-colors" title="View Details">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
