import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { products, deleteProduct, initializeStore } = useProductStore();

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
      } catch (e) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Helmet>
        <title>Manage Products | Admin</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <Link to="/admin/products/add" className="btn-primary py-2.5 shadow-sm">
            <Plus size={18} className="mr-2" /> Add New Product
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-600 bg-white cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium w-16">Image</th>
                  <th className="p-4 font-medium">Product Info</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 line-clamp-1">{product.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{product.sku || 'NO SKU'}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                          product.status === 'published' ? 'bg-green-100 text-green-700' : 
                          product.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.status || 'draft'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-gray-600">
                      {product.category}
                      {product.brand && <div className="text-xs text-gray-400 mt-0.5">{product.brand}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{formatPrice(product.discountPrice || product.price)}</div>
                      {product.discountPrice && <div className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' : 
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/product/${product.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="View on site">
                          <ExternalLink size={16} />
                        </Link>
                        <Link to={`/admin/products/edit/${product.id}`} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filteredProducts.length} entries</span>
          </div>
        </div>
      </div>
    </>
  );
}
