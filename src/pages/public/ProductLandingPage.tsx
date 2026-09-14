import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProductStore } from '../../store/useProductStore';
import { useLandingPageStore } from '../../store/useLandingPageStore';
import { LandingPageConfig } from '../../components/admin/landing-builder/types';
import { Check, ShieldCheck, Truck, Phone, MessageCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductLandingPage() {
  const { productSlug, slug } = useParams();
  const targetSlug = productSlug || slug;
  const navigate = useNavigate();
  const { products, isLoading: productsLoading, initializeStore: initProducts } = useProductStore();

  useEffect(() => {
    const unsubscribe = initProducts();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initProducts]);
  const { pages, isLoading: pagesLoading, initializeStore } = useLandingPageStore();

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [initializeStore]);
  
  const [product, setProduct] = useState<any>(null);
  const [config, setConfig] = useState<LandingPageConfig | null>(null);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    district: '',
    address: '',
    packageId: '',
    deliveryArea: 'inside_dhaka'
  });

  const orderFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (productsLoading || pagesLoading) return;
    
    const prod = products.find(p => p.slug === targetSlug);
    if (!prod) {
      navigate('/shop');
      return;
    }
    setProduct(prod);

    const lp = pages.find(p => p.id === prod.id && p.status === 'active');
    if (!lp || !lp.content) {
      navigate(`/product/${targetSlug}`); // redirect to normal product page if no landing page
      return;
    }

    try {
      const parsed = JSON.parse(lp.content);
      setConfig(parsed);
      if (parsed.packages?.length > 0) {
        setOrderForm(prev => ({ ...prev, packageId: parsed.packages[0].id }));
      }
    } catch (e) {
      console.error(e);
      navigate(`/product/${targetSlug}`);
    }
  }, [targetSlug, products, pages, productsLoading, pagesLoading, navigate]);

  if (!product || !config) {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading...</div>;
  }

  const scrollToOrder = () => {
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPrice = () => {
    if (config.packages?.length > 0 && orderForm.packageId) {
      const pkg = config.packages.find(p => p.id === orderForm.packageId);
      return pkg ? pkg.salePrice : 0;
    }
    return product.discountPrice || product.price;
  };

  const deliveryCharge = orderForm.deliveryArea === 'inside_dhaka' ? 60 : 120;
  const total = getPrice() + deliveryCharge;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally this would create an order in the database
    toast.success('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।');
    setOrderForm({
      name: '', phone: '', district: '', address: '', packageId: config.packages?.[0]?.id || '', deliveryArea: 'inside_dhaka'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-900 pb-24 md:pb-0">
      <Helmet>
        <title>{config.heroTitle || product.title} | AN Mart</title>
      </Helmet>

      {/* Announcement Bar */}
      {config.announcementEnabled && config.announcementText && (
        <div className="bg-[#1A3626] text-[#F3EFE6] text-center py-2 px-4 text-sm font-medium">
          {config.announcementText}
        </div>
      )}

      {/* Header (Minimal) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#F0EBE1]">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
          <img src="/logo.png" alt="AN Mart" className="h-8" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x50?text=AN+Mart' }} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        
        {/* Sections based on config.sections order */}
        {config.sections.filter(s => s.isVisible).sort((a, b) => a.order - b.order).map(section => {
          
          if (section.type === 'hero') {
            return (
              <section key={section.id} className="px-4 py-8 md:py-12 bg-white mb-4 shadow-sm rounded-b-3xl">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden aspect-square bg-[#F9F8F6] relative">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    {product.discountPercentage > 0 && (
                      <div className="absolute top-4 right-4 bg-[#C89B7B] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        {product.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C3E35] leading-tight">
                      {config.heroTitle || product.titleBn || product.title}
                    </h1>
                    {config.heroSubtitle && (
                      <p className="text-[#5C6E64] text-lg leading-relaxed">{config.heroSubtitle}</p>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-[#C89B7B]">৳{product.discountPrice || product.price}</span>
                        {product.discountPrice && (
                          <span className="text-lg text-gray-400 line-through">৳{product.price}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button onClick={scrollToOrder} className="w-full bg-[#1A3626] text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-[#1A3626]/20 hover:bg-[#12261A] transition-colors active:scale-[0.98]">
                        {config.heroCTA || "এখনই অর্ডার করুন"}
                      </button>
                    </div>

                    {/* Trust Badges */}
                    {config.trustBadgesEnabled && config.trustBadges?.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-[#F0EBE1]">
                        {config.trustBadges.map(badge => (
                          <div key={badge.id} className="flex items-center gap-1.5 text-sm text-[#5C6E64] bg-[#FDFBF7] px-3 py-1.5 rounded-lg border border-[#F0EBE1]">
                            <ShieldCheck size={16} className="text-[#C89B7B]" />
                            <span>{badge.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          if (section.type === 'problem' && config.problems?.length > 0) {
            return (
              <section key={section.id} className="px-4 py-10 bg-[#F9F8F6] my-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[#2C3E35] mb-8">{config.problemTitle}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.problems.map(prob => (
                    <div key={prob.id} className="bg-white p-5 rounded-2xl border border-[#F0EBE1] shadow-sm flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFF5F5] text-[#D97777] flex items-center justify-center shrink-0">
                        {/* Mock Icon */}
                        <X size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2C3E35] mb-1">{prob.title}</h3>
                        <p className="text-sm text-[#5C6E64] leading-relaxed">{prob.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'benefits' && config.solutions?.length > 0) {
            return (
              <section key={section.id} className="px-4 py-10 my-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[#2C3E35] mb-8">{config.solutionTitle}</h2>
                <div className="space-y-4">
                  {config.solutions.map(sol => (
                    <div key={sol.id} className="bg-white p-5 rounded-2xl border border-[#F0EBE1] shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#F2F7F4] text-[#4A7862] flex items-center justify-center shrink-0">
                        <Check size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2C3E35] text-lg mb-1">{sol.title}</h3>
                        <p className="text-[#5C6E64] leading-relaxed">{sol.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'ingredients' && config.ingredients?.length > 0) {
            return (
              <section key={section.id} className="px-4 py-10 bg-[#F9F8F6] my-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[#2C3E35] mb-8">{config.ingredientsTitle}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {config.ingredients.map(ing => (
                    <div key={ing.id} className="bg-white p-4 rounded-xl border border-[#F0EBE1] text-center">
                      <h4 className="font-bold text-[#2C3E35] mb-1">{ing.name}</h4>
                      <p className="text-xs text-[#5C6E64]">{ing.description}</p>
                      {ing.value && <div className="mt-2 text-sm font-bold text-[#C89B7B]">{ing.value}</div>}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'video' && config.videoUrl) {
            return (
              <section key={section.id} className="px-4 py-10 my-6">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-black">
                  <iframe 
                    src={config.videoUrl.replace('watch?v=', 'embed/')} 
                    title="Product Video"
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            );
          }

          if (section.type === 'packages' && config.packages?.length > 0) {
            return (
              <section key={section.id} className="px-4 py-10 bg-white my-6 border-y border-[#F0EBE1]">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[#2C3E35] mb-8">{config.packagesTitle}</h2>
                <div className="space-y-4">
                  {config.packages.map(pkg => (
                    <label 
                      key={pkg.id} 
                      className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all ${orderForm.packageId === pkg.id ? 'border-[#1A3626] bg-[#F2F7F4]' : 'border-[#F0EBE1] bg-white hover:border-[#C89B7B]/50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          <input 
                            type="radio" 
                            name="package" 
                            value={pkg.id} 
                            checked={orderForm.packageId === pkg.id}
                            onChange={(e) => setOrderForm({...orderForm, packageId: e.target.value})}
                            className="w-5 h-5 text-[#1A3626] focus:ring-[#1A3626]"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg text-[#2C3E35]">{pkg.name}</h3>
                            {pkg.badge && (
                              <span className="bg-[#C89B7B] text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          {pkg.description && <p className="text-sm text-[#5C6E64] mb-2">{pkg.description}</p>}
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-[#1A3626]">৳{pkg.salePrice}</span>
                            {pkg.regularPrice > pkg.salePrice && (
                              <span className="text-sm text-gray-400 line-through">৳{pkg.regularPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            );
          }

          
          if (section.type === 'faq' && config.faqs?.length > 0) {
            return (
              <section key={section.id} className="px-4 py-10 my-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[#2C3E35] mb-8">{config.faqTitle || 'সাধারণ জিজ্ঞাসা'}</h2>
                <div className="space-y-3">
                  {config.faqs.map(faq => (
                    <details key={faq.id} className="group bg-white p-5 rounded-2xl border border-[#F0EBE1] cursor-pointer">
                      <summary className="flex justify-between items-center font-bold text-[#2C3E35] list-none">
                        <span>{faq.question}</span>
                        <span className="transition group-open:rotate-180">
                          <ChevronDown size={20} />
                        </span>
                      </summary>
                      <p className="text-[#5C6E64] mt-3 leading-relaxed border-t border-[#F0EBE1] pt-3">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === 'contact' && config.contactEnabled) {
            return (
              <section key={section.id} className="px-4 py-10 my-6 bg-[#1A3626] text-white rounded-3xl mx-4 text-center">
                <h2 className="text-2xl font-serif font-bold mb-6">{config.contactTitle}</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {config.contactPhone && (
                    <a href={`tel:${config.contactPhone}`} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors">
                      <Phone size={20} />
                      <span className="font-medium">{config.contactPhone}</span>
                    </a>
                  )}
                  {config.contactWhatsApp && (
                    <a href={`https://wa.me/${config.contactWhatsApp}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl transition-colors">
                      <MessageCircle size={20} />
                      <span className="font-medium">WhatsApp</span>
                    </a>
                  )}
                </div>
              </section>
            );
          }

          return null;
        })}

        {/* Order Form Section (Always at the bottom before footer) */}
        <section ref={orderFormRef} className="px-4 py-12 bg-white border-t border-[#F0EBE1] shadow-2xl rounded-t-3xl mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2C3E35] mb-2">অর্ডার কনফার্ম করুন</h2>
            <p className="text-[#5C6E64]">ফর্মটি সঠিকভাবে পূরণ করুন</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E35] mb-1">আপনার নাম *</label>
                <input required type="text" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#F0EBE1] rounded-xl focus:ring-[#C89B7B] focus:border-[#C89B7B]" placeholder="সম্পূর্ণ নাম লিখুন" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E35] mb-1">মোবাইল নাম্বার *</label>
                <input required type="tel" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#F0EBE1] rounded-xl focus:ring-[#C89B7B] focus:border-[#C89B7B]" placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E35] mb-1">ডেলিভারি এরিয়া *</label>
                <select value={orderForm.deliveryArea} onChange={e => setOrderForm({...orderForm, deliveryArea: e.target.value})} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#F0EBE1] rounded-xl focus:ring-[#C89B7B] focus:border-[#C89B7B]">
                  <option value="inside_dhaka">ঢাকার ভিতরে (৳৬০)</option>
                  <option value="outside_dhaka">ঢাকার বাইরে (৳১২০)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E35] mb-1">সম্পূর্ণ ঠিকানা *</label>
                <textarea required rows={2} value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#F0EBE1] rounded-xl focus:ring-[#C89B7B] focus:border-[#C89B7B]" placeholder="গ্রাম/মহল্লা, থানা, জেলা" />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#F0EBE1] space-y-3">
              <h3 className="font-bold text-[#2C3E35] mb-4 border-b border-[#E8E3D9] pb-2">অর্ডার সামারি</h3>
              <div className="flex justify-between text-sm text-[#5C6E64]">
                <span>পণ্যের মূল্য</span>
                <span className="font-medium text-[#2C3E35]">৳{getPrice()}</span>
              </div>
              <div className="flex justify-between text-sm text-[#5C6E64]">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-medium text-[#2C3E35]">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-[#1A3626] pt-3 border-t border-[#E8E3D9]">
                <span>সর্বমোট</span>
                <span>৳{total}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#1A3626] text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-[#1A3626]/20 hover:bg-[#12261A] transition-colors flex items-center justify-center gap-2">
              <Check size={20} /> অর্ডার কনফার্ম করুন — ৳{total}
            </button>
          </form>
        </section>

      </main>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-[#F0EBE1] md:hidden z-50">
        <button onClick={scrollToOrder} className="w-full bg-[#C89B7B] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#C89B7B]/30 active:scale-95 transition-transform">
          {config.heroCTA || "এখনই অর্ডার করুন"}
        </button>
      </div>

    </div>
  );
}
