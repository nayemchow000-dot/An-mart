import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, X, Loader2, Upload } from 'lucide-react';
import { useCategoryStore } from '../../store/useCategoryStore';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, addCategory, deleteCategory, updateCategory, initializeStore } = useCategoryStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    nameBn: '',
    slug: '',
    image: '',
    displayOrder: 0,
    status: 'active'
  });

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(id);
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateCategory(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
      toast.success('Category status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openAddModal = () => {
    setFormData({
      id: '',
      name: '',
      nameBn: '',
      slug: '',
      image: '',
      displayOrder: categories.length + 1,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setFormData({
      id: category.id,
      name: category.name,
      nameBn: category.nameBn || '',
      slug: category.slug,
      image: category.image || '',
      displayOrder: category.displayOrder || 0,
      status: category.status
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(files[0]);
      setFormData({ ...formData, image: url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }

    setIsLoading(true);
    try {
      if (formData.id) {
        await updateCategory(formData.id, {
          name: formData.name,
          nameBn: formData.nameBn,
          slug: formData.slug,
          image: formData.image,
          displayOrder: Number(formData.displayOrder),
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Category updated successfully');
      } else {
        await addCategory({
          id: formData.slug + '-' + Date.now(),
          name: formData.name,
          nameBn: formData.nameBn,
          slug: formData.slug,
          image: formData.image,
          displayOrder: Number(formData.displayOrder),
          status: formData.status as 'active' | 'inactive',
          createdAt: new Date().toISOString()
        });
        toast.success('Category added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save category');
      console.warn(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nameBn?.includes(searchTerm)
  );

  return (
    <>
      <Helmet>
        <title>Manage Categories | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <button onClick={openAddModal} className="btn-primary py-2.5 shadow-sm">
            <Plus size={18} className="mr-2" /> Add New Category
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium w-16">Icon</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Slug</th>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No categories found. Click "Add New Category" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 font-bold text-lg">{cat.name.charAt(0)}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{cat.name}</div>
                        {cat.nameBn && <div className="text-xs text-gray-500">{cat.nameBn}</div>}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                      <td className="p-4 text-gray-600">{cat.displayOrder}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleStatus(cat.id, cat.status)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            cat.status === 'active' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-gray-400 hover:text-primary transition-colors" 
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" 
                            title="Delete"
                          >
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {formData.id ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData({...formData, name: val, slug: formData.id ? formData.slug : slug});
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Bengali)</label>
                <input 
                  type="text" 
                  value={formData.nameBn}
                  onChange={(e) => setFormData({...formData, nameBn: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input 
                    type="number" 
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute top-0 right-0 p-1 bg-red-500/80 text-white hover:bg-red-600 rounded-bl-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 size={20} className="text-gray-400 animate-spin mb-1" />
                    ) : (
                      <Upload size={20} className="text-gray-400 mb-1" />
                    )}
                    <span className="text-xs font-medium text-gray-500">
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || uploadingImage}
                  className="btn-primary py-2 px-6 shadow-sm flex items-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
