import { Helmet } from 'react-helmet-async';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function AdminCoupons() {
  const mockCoupons = [
    { id: '1', code: 'WELCOME10', discount: '10%', minOrder: 1000, expiry: 'Dec 31, 2024', status: 'Active' },
    { id: '2', code: 'EID500', discount: formatPrice(500), minOrder: 5000, expiry: 'Jun 15, 2024', status: 'Expired' },
  ];

  return (
    <>
      <Helmet>
        <title>Manage Coupons | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <button className="btn-primary py-2.5 shadow-sm">
            <Plus size={18} className="mr-2" /> Create Coupon
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Coupon Code</th>
                  <th className="p-4 font-medium">Discount</th>
                  <th className="p-4 font-medium">Min. Order</th>
                  <th className="p-4 font-medium">Expiry Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {mockCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-primary" />
                        <span className="font-bold text-gray-900 tracking-wide">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{coupon.discount}</td>
                    <td className="p-4 text-gray-600">{formatPrice(coupon.minOrder)}</td>
                    <td className="p-4 text-gray-600">{coupon.expiry}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
