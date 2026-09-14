import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
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

  const [regeneratingTypes, setRegeneratingTypes] = useState<string[]>([]);

  const handleRegenerateCreative = async (creativeType: string, sourceImageUrl: string) => {
    if (!formData) return;
    setRegeneratingTypes(prev => [...prev, creativeType]);
    try {
      const res = await fetch('/api/importer/generate-creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: formData,
          sourceImageUrl,
          creativeType
        })
      });
      
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        // Upload to Cloudinary
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (cloudName && uploadPreset) {
          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
          const fd = new FormData();
          fd.append('file', data.imageUrl);
          fd.append('upload_preset', uploadPreset);
          
          const cRes = await fetch(uploadUrl, { method: 'POST', body: fd });
          const cData = await cRes.json();
          if (cData.secure_url) {
            // Replace the old creative with the new one
            let newImages = [...(formData.images || [])];
            let newMetadata = [...aiCreatives];
            
            const existingMetaIndex = newMetadata.findIndex(m => m.creativeType === creativeType);
            if (existingMetaIndex >= 0) {
              const oldUrl = newMetadata[existingMetaIndex].url;
              newMetadata[existingMetaIndex].url = cData.secure_url;
              
              const imgIndex = newImages.indexOf(oldUrl);
              if (imgIndex >= 0) {
                newImages[imgIndex] = cData.secure_url;
              } else {
                newImages.push(cData.secure_url);
              }
            }
            
            setFormData({
              ...formData,
              images: newImages,
              specifications: {
                ...(formData.specifications || {}),
                aiCreatives: JSON.stringify(newMetadata)
              }
            });
            toast.success(`Regenerated ${creativeType} successfully`);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch(e) {
      toast.error('Failed to regenerate creative');
    } finally {
      setRegeneratingTypes(prev => prev.filter(t => t !== creativeType));
    }
  };

  let aiCreatives: any[] = [];
  try {
    if (formData?.specifications?.aiCreatives) {
      aiCreatives = JSON.parse(formData.specifications.aiCreatives);
    }
  } catch(e) {}
  
  const aiCreativeUrls = aiCreatives.map(c => c.url);
  const originalImages = formData?.images?.filter(url => !aiCreativeUrls.includes(url)) || [];


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
      console.warn(error);
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
            
            {/* Product Media */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Original Product Images <span className="text-red-500">*</span></h2>
                <span className="text-xs text-gray-500">First image is the thumbnail</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {originalImages.map((url, index) => {
                  const globalIndex = formData?.images?.indexOf(url) || index;
                  return (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => removeImage(globalIndex)}
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
                )})}
                
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

            {aiCreatives.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded text-xs">AI</span>
                  AN Mart AI Creatives
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {aiCreatives.map((creative, index) => {
                  const globalIndex = formData?.images?.indexOf(creative.url) || -1;
                  const isRegenerating = regeneratingTypes.includes(creative.creativeType);
                  return (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={creative.url} alt={creative.creativeType} className={`w-full h-full object-cover ${isRegenerating ? 'opacity-50 blur-sm' : ''}`} />
                    
                    {!isRegenerating && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                          type="button"
                          onClick={() => window.open(creative.url, '_blank')}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white text-white hover:text-gray-900 rounded-lg backdrop-blur-sm transition-colors text-xs font-medium w-24 text-center"
                        >
                          Preview
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleRegenerateCreative(creative.creativeType, originalImages[0])}
                          className="px-3 py-1.5 bg-primary/80 hover:bg-primary text-white rounded-lg backdrop-blur-sm transition-colors text-xs font-medium w-24 flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={12} /> Regenerate
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeImage(globalIndex)}
                          className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors text-xs font-medium w-24 flex items-center justify-center gap-1"
                        >
                          <X size={12} /> Delete
                        </button>
                      </div>
                    )}

                    {isRegenerating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                        <RefreshCw size={24} className="text-primary animate-spin mb-2" />
                        <span className="text-xs font-bold text-gray-800">Regenerating...</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold uppercase rounded backdrop-blur-md">
                      {creative.creativeType.replace('-', ' ')}
                    </div>
                  </div>
                )})}
              </div>
            </div>
            )}

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
