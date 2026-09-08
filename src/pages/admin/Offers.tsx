import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Tag, Search, Edit, Trash2, X } from 'lucide-react';
import { useOfferStore } from '../../store/useOfferStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function Offers() {
  const { offers, addOffer, updateOffer, deleteOffer, initializeStore } = useOfferStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleOpenModal = (offer?: any) => {
    if (offer) {
      setFormData({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        status: offer.status
      });
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
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
        await updateOffer(formData.id, {
          title: formData.title,
          description: formData.description,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Offer updated successfully');
      } else {
        await addOffer({
          id: uuidv4(),
          title: formData.title,
          description: formData.description,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Offer created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteOffer(id);
        toast.success('Offer deleted successfully');
      } catch (error) {
        toast.error('Failed to delete offer');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Offers & Promotions | Admin | AN Mart</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Offers & Promotions</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Offer
          </button>
        </div>
        
        <div className="card-premium overflow-hidden">
          {offers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-6 rounded-xl border border-dashed border-gray-200">
              <Tag size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No active offers</h3>
              <p className="text-gray-500">Create special offers, flash sales, and combo deals to boost sales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Offer Title</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{offer.title}</div>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{offer.description}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {offer.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(offer)} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(offer.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? 'Edit Offer' : 'Create New Offer'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g. Eid Mega Sale"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary resize-none"
                    placeholder="Enter offer details..."
                  ></textarea>
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
                  {isSubmitting ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
