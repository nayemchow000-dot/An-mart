import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Loader2, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { useSiteConfigStore } from '../../store/useSiteConfigStore';
import { uploadToCloudinary } from '../../config/cloudinary';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function HomepageCMS() {
  const { draftConfig, hasUnsavedChanges, updateSection, publishChanges, discardChanges, initializeStore } = useSiteConfigStore();
  const [activeTab, setActiveTab] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await publishChanges();
      toast.success('Homepage changes published successfully!');
    } catch (error) {
      toast.error('Failed to publish changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getSection = (id: string) => draftConfig.sections.find(s => s.id === id);

  const heroSection = getSection('hero-slider');
  const bannersSection = getSection('promotional-banners');

  const addSlide = () => {
    if (!heroSection) return;
    const newSlide = {
      id: uuidv4(),
      imageUrl: '',
      title: 'New Slide',
      subtitle: '',
      link: '/',
      buttonText: 'Shop Now'
    };
    updateSection('hero-slider', {
      slides: [...(heroSection.data?.slides || []), newSlide]
    });
  };

  const updateSlide = (id: string, field: string, value: string) => {
    if (!heroSection) return;
    const updatedSlides = heroSection.data.slides.map((slide: any) => 
      slide.id === id ? { ...slide, [field]: value } : slide
    );
    updateSection('hero-slider', { slides: updatedSlides });
  };

  const removeSlide = (id: string) => {
    if (!heroSection) return;
    const updatedSlides = heroSection.data.slides.filter((slide: any) => slide.id !== id);
    updateSection('hero-slider', { slides: updatedSlides });
  };

  const addBanner = () => {
    if (!bannersSection) return;
    const newBanner = {
      id: uuidv4(),
      imageUrl: '',
      link: '/'
    };
    updateSection('promotional-banners', {
      banners: [...(bannersSection.data?.banners || []), newBanner]
    });
  };

  const updateBanner = (id: string, field: string, value: string) => {
    if (!bannersSection) return;
    const updatedBanners = bannersSection.data.banners.map((banner: any) => 
      banner.id === id ? { ...banner, [field]: value } : banner
    );
    updateSection('promotional-banners', { banners: updatedBanners });
  };

  const removeBanner = (id: string) => {
    if (!bannersSection) return;
    const updatedBanners = bannersSection.data.banners.filter((banner: any) => banner.id !== id);
    updateSection('promotional-banners', { banners: updatedBanners });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'hero' | 'banner') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setUploadingImage(id);
      const url = await uploadToCloudinary(file);
      if (type === 'hero') {
        updateSlide(id, 'imageUrl', url);
      } else {
        updateBanner(id, 'imageUrl', url);
      }
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.warn(error);
    } finally {
      setUploadingImage(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Homepage CMS | Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Homepage CMS</h1>
          <p className="text-gray-500 text-sm mt-1">Manage banners, sliders, and featured sections</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <button 
              onClick={discardChanges}
              className="btn-outline flex items-center gap-2"
              disabled={isSaving}
            >
              <X size={18} />
              Discard
            </button>
          )}
          <button 
            onClick={handleSaveAll}
            className={`btn-primary flex items-center gap-2 ${!hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Publish Changes
          </button>
        </div>
      </div>

      <div className="card p-0 mb-8 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'hero' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Hero Slider
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'banners' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Promotional Banners
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Hero Slides</h2>
                <button onClick={addSlide} className="btn-outline text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Slide
                </button>
              </div>

              {(!heroSection?.data?.slides || heroSection.data.slides.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No slides added yet. Add a slide to appear on the homepage.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {heroSection.data.slides.map((slide: any, index: number) => (
                    <div key={slide.id} className="border border-gray-200 rounded-xl p-5 flex flex-col lg:flex-row gap-6 bg-white shadow-sm relative group">
                      
                      <div className="absolute top-4 right-4">
                        <button 
                          onClick={() => removeSlide(slide.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="lg:w-1/3 flex flex-col space-y-3">
                        <label className="text-sm font-medium text-gray-700">Slide Image (1920x800 px)</label>
                        <div className="relative aspect-[21/9] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
                          {slide.imageUrl ? (
                            <img src={slide.imageUrl} alt="Slide preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={32} className="text-gray-400" />
                          )}
                          
                          {uploadingImage === slide.id && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 size={24} className="text-white animate-spin" />
                            </div>
                          )}

                          <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-center bg-black/40 transition-opacity">
                            <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                              {slide.imageUrl ? 'Change Image' : 'Upload Image'}
                            </span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, slide.id, 'hero')}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="lg:w-2/3 space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input 
                              type="text" 
                              value={slide.title}
                              onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                              placeholder="e.g. Summer Collection"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                            <input 
                              type="text" 
                              value={slide.subtitle}
                              onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                              placeholder="e.g. Up to 50% off"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                            <input 
                              type="text" 
                              value={slide.buttonText}
                              onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                              placeholder="e.g. Shop Now"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                            <input 
                              type="text" 
                              value={slide.link}
                              onChange={(e) => updateSlide(slide.id, 'link', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                              placeholder="e.g. /shop"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Promotional Banners</h2>
                <button onClick={addBanner} className="btn-outline text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Banner
                </button>
              </div>

              {(!bannersSection?.data?.banners || bannersSection.data.banners.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No banners added yet. Add side-by-side promotional banners.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bannersSection.data.banners.map((banner: any, index: number) => (
                    <div key={banner.id} className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4 bg-white shadow-sm relative">
                      
                      <div className="absolute top-4 right-4 z-10">
                        <button 
                          onClick={() => removeBanner(banner.id)}
                          className="p-2 text-gray-400 bg-white/80 backdrop-blur hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-col space-y-3">
                        <label className="text-sm font-medium text-gray-700">Banner Image</label>
                        <div className="relative aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
                          {banner.imageUrl ? (
                            <img src={banner.imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={32} className="text-gray-400" />
                          )}
                          
                          {uploadingImage === banner.id && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 size={24} className="text-white animate-spin" />
                            </div>
                          )}

                          <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-center bg-black/40 transition-opacity">
                            <span className="bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                              {banner.imageUrl ? 'Change Image' : 'Upload Image'}
                            </span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, banner.id, 'banner')}
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                        <input 
                          type="text" 
                          value={banner.link}
                          onChange={(e) => updateBanner(banner.id, 'link', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                          placeholder="e.g. /category/electronics"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
