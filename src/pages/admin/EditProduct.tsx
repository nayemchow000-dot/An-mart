import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { Product } from '../../types';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct } = useProductStore();
  const { categories } = useCategoryStore();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({ ...product });
      } else {
        toast.error('Product not found');
        navigate('/admin/products');
      }
    }
  }, [id, products, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !formData) return;

    setUploadingImage(true);
    try {
      const newImages = [...(formData.images || [])];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i]);
        newImages.push(url);
      }
      setFormData({ ...formData, images: newImages });
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    if (!formData) return;
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    
    // Auto-generate slug from title if slug is empty
    if (name === 'title' && !formData.slug) {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ 
        ...prev!, 
        [name]: value,
        slug: generatedSlug 
      }));
      return;
    }

    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;
    
    if (!formData.title || !formData.slug || !formData.category || !formData.price || formData.price <= 0) {
      toast.error('Please fill all required fields (Title, Slug, Category, Price)');
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure specific numbers
      const updatedProduct: Partial<Product> = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock),
        deliveryCharge: Number(formData.deliveryCharge || 0),
        updatedAt: new Date().toISOString()
      };

      await updateProduct(id, updatedProduct);
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Product | Admin</title>
      </Helmet>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/90 backdrop-blur-sm py-4 z-10 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/products"
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary py-2.5 px-6 shadow-sm flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Update Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Basic Information</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title (Bengali)
                  </label>
                  <input 
                    type="text" 
                    name="titleBn"
                    value={formData.titleBn || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Slug <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input 
                      type="text" 
                      name="brand"
                      value={formData.brand || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input 
                      type="text" 
                      name="sku"
                      value={formData.sku || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Descriptions</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea 
                    name="shortDescription"
                    value={formData.shortDescription || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (English)</label>
                  <textarea 
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description (Bengali)</label>
                  <textarea 
                    name="descriptionBn"
                    value={formData.descriptionBn || ''}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Product Media */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Product Images <span className="text-red-500">*</span></h2>
                <span className="text-xs text-gray-500">First image is the thumbnail</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {formData.images?.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold uppercase rounded">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                <label className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer aspect-square">
                  {uploadingImage ? (
                    <Loader2 size={24} className="text-gray-400 animate-spin mb-2" />
                  ) : (
                    <Upload size={24} className="text-gray-400 mb-2" />
                  )}
                  <span className="text-xs font-medium text-gray-500 text-center">
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            
            {/* Status & Organization */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Organization</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="cosmetics">Cosmetics</option>
                        <option value="skincare">Skincare</option>
                        <option value="jewellery">Jewellery</option>
                        <option value="clothing">Clothing</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      name="isFeatured"
                      checked={formData.isFeatured || false}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      name="isNewArrival"
                      checked={formData.isNewArrival || false}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">New Arrival</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Pricing & Inventory</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (৳) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (৳)</label>
                  <input 
                    type="number" 
                    name="discountPrice"
                    value={formData.discountPrice || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="stock"
                    value={formData.stock || ''}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Setup */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Delivery Setup</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (৳)</label>
                  <input 
                    type="number" 
                    name="deliveryCharge"
                    value={formData.deliveryCharge || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                  <input 
                    type="text" 
                    name="deliveryTime"
                    value={formData.deliveryTime || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      name="isCodAvailable"
                      checked={formData.isCodAvailable !== false}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Cash on Delivery Available</span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </>
  );
}
