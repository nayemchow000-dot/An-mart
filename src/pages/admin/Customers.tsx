import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Mail, Phone, MoreVertical } from 'lucide-react';

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockCustomers = [
    { id: 'CUST-001', name: 'Nayem Chowdhury', email: 'nayem@example.com', phone: '01711000000', orders: 12, status: 'Active' },
    { id: 'CUST-002', name: 'Sarah Islam', email: 'sarah@example.com', phone: '01811000000', orders: 5, status: 'Active' },
    { id: 'CUST-003', name: 'Rakib Hasan', email: 'rakib@example.com', phone: '01911000000', orders: 1, status: 'Active' },
    { id: 'CUST-004', name: 'Tania Akter', email: 'tania@example.com', phone: '01611000000', orders: 0, status: 'Inactive' },
  ];

  return (
    <>
      <Helmet>
        <title>Manage Customers | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Total Orders</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {mockCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{customer.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Mail size={14} /> {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} /> {customer.phone}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{customer.orders}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
                        <MoreVertical size={18} />
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
