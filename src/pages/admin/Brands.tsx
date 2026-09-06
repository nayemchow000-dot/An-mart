import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, X, Loader2, Upload } from 'lucide-react';
import { useBrandStore } from '../../store/useBrandStore';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

export default function AdminBrands() {
  const [searchTerm, setSearchTerm] = useState('');
  const { brands, addBrand, deleteBrand, updateBrand, initializeStore } = useBrandStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    nameBn: string;
    slug: string;
    image: string;
    description: string;
    status: 'active' | 'inactive';
  }>({
    id: '',
    name: '',
    nameBn: '',
    slug: '',
    image: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete brand "${name}"?`)) {
      try {
        await deleteBrand(id);
        toast.success('Brand deleted successfully');
      } catch (error) {
        toast.error('Failed to delete brand');
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateBrand(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
      toast.success('Brand status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setUploadingImage(true);
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.warn(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.id) {
        // Update
        const { id, ...updateData } = formData;
        await updateBrand(id, updateData);
        toast.success('Brand updated successfully');
      } else {
        // Create
        const { id, ...newData } = formData;
        await addBrand(newData);
        toast.success('Brand created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      id: '',
      name: '',
      nameBn: '',
      slug: '',
      image: '',
      description: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: any) => {
    setFormData({
      id: brand.id,
      name: brand.name,
      nameBn: brand.nameBn || '',
      slug: brand.slug,
      image: brand.image || '',
      description: brand.description || '',
      status: brand.status
    });
    setIsModalOpen(true);
  };

  // Generate slug automatically
  useEffect(() => {
    if (formData.name && !formData.id) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  }, [formData.name, formData.id]);

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (brand.nameBn && brand.nameBn.includes(searchTerm))
  );

  return (
    <>
      <Helmet>
        <title>Manage Brands | Admin Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-1">Manage product brands and logos</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Brand
        </button>
      </div>

      <div className="card p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search brands..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="py-3 px-4 font-medium">Logo</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Slug</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No brands found.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      {brand.image ? (
                        <img src={brand.image} alt={brand.name} className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{brand.name}</p>
                      {brand.nameBn && <p className="text-xs text-gray-500">{brand.nameBn}</p>}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{brand.slug}</td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => toggleStatus(brand.id, brand.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          brand.status === 'active' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {brand.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {brand.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(brand)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                {formData.id ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name (Bangla)
                    </label>
                    <input
                      type="text"
                      value={formData.nameBn}
                      onChange={(e) => setFormData({...formData, nameBn: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Logo
                    </label>
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                      <div className="space-y-1 text-center">
                        {formData.image ? (
                          <div className="relative inline-block">
                            <img src={formData.image} alt="Preview" className="h-32 object-contain mx-auto" />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, image: ''})}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            {uploadingImage ? (
                              <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="animate-spin text-primary mb-2" size={24} />
                                <span className="text-sm text-gray-500">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 mt-4">
                                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-700 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input 
                                      type="file" 
                                      className="sr-only" 
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, WEBP up to 2MB
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : formData.id ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
