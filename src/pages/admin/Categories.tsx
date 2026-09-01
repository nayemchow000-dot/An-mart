import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useCategoryStore } from '../../store/useCategoryStore';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, deleteCategory, updateCategory, initializeStore } = useCategoryStore();

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
          <button className="btn-primary py-2.5 shadow-sm">
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
                          <button className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
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
    </>
  );
}
