import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Save, Eye, Check, X, LayoutTemplate } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useLandingPageStore } from '../../store/useLandingPageStore';
import toast from 'react-hot-toast';
import { LandingPageConfig, LandingPageSection } from '../../components/admin/landing-builder/types';
import { v4 as uuidv4 } from 'uuid';
import BuilderSidebar from '../../components/admin/landing-builder/BuilderSidebar';
import BuilderEditor from '../../components/admin/landing-builder/BuilderEditor';

const defaultSections: LandingPageSection[] = [
  { id: 'sec-hero', type: 'hero', isVisible: true, order: 0 },
  { id: 'sec-problem', type: 'problem', isVisible: true, order: 1 },
  { id: 'sec-benefits', type: 'benefits', isVisible: true, order: 2 },
  { id: 'sec-ingredients', type: 'ingredients', isVisible: true, order: 3 },
  { id: 'sec-video', type: 'video', isVisible: true, order: 4 },
  { id: 'sec-reviews', type: 'reviews', isVisible: true, order: 5 },
  { id: 'sec-packages', type: 'packages', isVisible: true, order: 6 },
  { id: 'sec-faq', type: 'faq', isVisible: true, order: 7 },
  { id: 'sec-contact', type: 'contact', isVisible: true, order: 8 },
];

const defaultConfig: LandingPageConfig = {
  announcementText: "সারা বাংলাদেশে Cash on Delivery",
  announcementEnabled: true,
  countdownEnabled: false,
  countdownEndTime: new Date(Date.now() + 86400000).toISOString(),
  countdownText: "অফার শেষ হতে বাকি",
  trustBadgesEnabled: true,
  trustBadges: [
    { id: uuidv4(), text: "Cash on Delivery" },
    { id: uuidv4(), text: "100% Original Product" },
    { id: uuidv4(), text: "Fast Delivery" }
  ],
  heroTitle: "",
  heroSubtitle: "",
  heroCTA: "এখনই অর্ডার করুন",
  heroSecondaryCTA: "আরও বিস্তারিত দেখুন",
  problemTitle: "আপনার সমস্যার মূল কারণগুলো কী?",
  problems: [],
  solutionTitle: "এই পণ্যটি কীভাবে সাহায্য করতে পারে?",
  solutions: [],
  ingredientsTitle: "মূল উপাদানসমূহ",
  ingredients: [],
  howToUseTitle: "কিভাবে ব্যবহার করবেন?",
  howToUseSteps: [],
  videoUrl: "",
  giftsEnabled: false,
  giftsTitle: "অর্ডারের সাথে ফ্রি উপহার",
  gifts: [],
  packagesTitle: "প্যাকেজ নির্বাচন করুন",
  packages: [],
  faqTitle: "সাধারণ জিজ্ঞাসা",
  faqs: [],
  contactEnabled: true,
  contactTitle: "যেকোনো প্রয়োজনে যোগাযোগ করুন",
  contactPhone: "",
  contactWhatsApp: "",
  contactFacebook: "",
  sections: defaultSections,
};

export default function LandingPageBuilder() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, initializeStore: initProducts } = useProductStore();

  useEffect(() => {
    const unsubscribe = initProducts();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initProducts]);
  const { pages, addPage, updatePage, isLoading: storeLoading, initializeStore } = useLandingPageStore();

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initializeStore]);
  
  const [product, setProduct] = useState<any>(null);
  const [config, setConfig] = useState<LandingPageConfig>(defaultConfig);
  const [isEnabled, setIsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storeLoading || !productId) return;
    
    const prod = products.find(p => p.id === productId);
    if (!prod) {
      toast.error('Product not found');
      navigate('/admin/products');
      return;
    }
    setProduct(prod);

    // See if landing page exists
    const lp = pages.find(p => p.id === productId);
    if (lp) {
      setIsEnabled(lp.status === 'active');
      if (lp.content) {
        try {
          const parsed = JSON.parse(lp.content);
          setConfig({ ...defaultConfig, ...parsed });
        } catch (e) {
          console.error("Failed to parse LP content", e);
        }
      }
    } else {
      setConfig({
        ...defaultConfig,
        heroTitle: prod.titleBn || prod.title,
        heroSubtitle: prod.shortDescription || '',
      });
    }
    setIsLoading(false);
  }, [productId, products, pages, storeLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const lp = pages.find(p => p.id === productId);
      const lpData = {
        title: product.title,
        slug: product.slug, // ensure URL matches product
        content: JSON.stringify(config),
        status: (isEnabled ? 'active' : 'inactive') as 'active' | 'inactive'
      };

      if (lp) {
        await updatePage(productId!, lpData);
        toast.success('Landing page updated');
      } else {
        await addPage({
          id: productId!,
          ...lpData,
        } as any);
        toast.success('Landing page created');
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Error saving landing page: ' + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
      <Helmet><title>Landing Page Builder | {product.title}</title></Helmet>
      
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <LayoutTemplate size={20} className="text-primary" />
              Landing Page Builder
            </h1>
            <p className="text-sm text-gray-500">Editing: {product.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
              <input type="checkbox" className="sr-only" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
              <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{isEnabled ? 'Published' : 'Draft'}</span>
          </label>
          
          <button onClick={() => window.open(`/product/${product.slug}`, '_blank')} className="btn-outline flex items-center gap-2 py-2">
            <Eye size={16} /> Preview
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary flex items-center gap-2 py-2">
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        <BuilderSidebar activeTab={activeTab} setActiveTab={setActiveTab} config={config} setConfig={setConfig} />
        <BuilderEditor activeTab={activeTab} config={config} setConfig={setConfig} product={product} />
      </div>
    </div>
  );
}
