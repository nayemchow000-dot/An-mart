import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Tag, Edit, Trash2, X } from 'lucide-react';
import { useCouponStore } from '../../store/useCouponStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, initializeStore } = useCouponStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    discount: '',
    minOrder: '',
    expiry: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleOpenModal = (coupon?: any) => {
    if (coupon) {
      setFormData({
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        minOrder: coupon.minOrder.toString(),
        expiry: coupon.expiry,
        status: coupon.status
      });
    } else {
      setFormData({
        id: '',
        code: '',
        discount: '',
        minOrder: '',
        expiry: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        await updateCoupon(formData.id, {
          code: formData.code,
          discount: formData.discount,
          minOrder: Number(formData.minOrder) || 0,
          expiry: formData.expiry,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Coupon updated successfully');
      } else {
        await addCoupon({
          id: uuidv4(),
          code: formData.code,
          discount: formData.discount,
          minOrder: Number(formData.minOrder) || 0,
          expiry: formData.expiry,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Coupon created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted successfully');
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Coupons | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary py-2.5 shadow-sm">
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
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No coupons found. Click "Create Coupon" to add one.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-primary" />
                          <span className="font-bold text-gray-900 tracking-wide">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-700">{coupon.discount}</td>
                      <td className="p-4 text-gray-600">৳{coupon.minOrder}</td>
                      <td className="p-4 text-gray-600">{coupon.expiry}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          coupon.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(coupon)} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary uppercase"
                    placeholder="e.g. WELCOME10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount/Percentage</label>
                  <input 
                    type="text" 
                    required
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g. 10% or 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (৳)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g. 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.expiry}
                    onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 btn-primary"
                >
                  {isSubmitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
