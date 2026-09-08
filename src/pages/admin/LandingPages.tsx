import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Layout, Search, Edit, Trash2, X } from 'lucide-react';
import { useLandingPageStore } from '../../store/useLandingPageStore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function LandingPages() {
  const { pages, addPage, updatePage, deletePage, initializeStore } = useLandingPageStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    content: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleOpenModal = (page?: any) => {
    if (page) {
      setFormData({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        status: page.status
      });
    } else {
      setFormData({
        id: '',
        title: '',
        slug: '',
        content: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        await updatePage(formData.id, {
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          content: formData.content,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Landing page updated successfully');
      } else {
        await addPage({
          id: uuidv4(),
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          content: formData.content,
          status: formData.status as 'active' | 'inactive'
        });
        toast.success('Landing page created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save landing page');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this landing page?')) {
      try {
        await deletePage(id);
        toast.success('Landing page deleted successfully');
      } catch (error) {
        toast.error('Failed to delete landing page');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Landing Pages | Admin | AN Mart</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Landing Pages</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Page
          </button>
        </div>
        
        <div className="card-premium overflow-hidden">
          {pages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-6 rounded-xl border border-dashed border-gray-200">
              <Layout size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No landing pages found</h3>
              <p className="text-gray-500">Create custom landing pages for marketing campaigns or special categories.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Page Title</th>
                    <th className="p-4 font-medium">URL Slug</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{page.title}</div>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">/{page.slug}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          page.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {page.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(page)} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(page.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? 'Edit Landing Page' : 'Create Landing Page'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="e.g. Summer Collection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                    <input 
                      type="text" 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                      placeholder="e.g. summer-collection (auto-generated if empty)"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                  <textarea 
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                    placeholder="<div class='text-center'>...</div>"
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
                  {isSubmitting ? 'Saving...' : 'Save Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
