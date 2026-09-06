import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, Gem, ShieldCheck, Truck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { useSiteConfigStore } from '../../store/useSiteConfigStore';

export default function Home() {
  const { products } = useProductStore();
  const { publishedConfig } = useSiteConfigStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSection = publishedConfig.sections.find(s => s.id === 'hero-slider');
  const bannersSection = publishedConfig.sections.find(s => s.id === 'promotional-banners');

  const slides = heroSection?.data?.slides || [];
  const banners = bannersSection?.data?.banners || [];

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-[#1a1a1a] text-[#c2a578] py-2 px-4 text-center text-xs md:text-sm font-medium tracking-wide">
        Free Delivery on orders over ৳5000 | 100% Authentic Products
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#FAFAFA] overflow-hidden group">
        {slides.length > 0 ? (
          <div className="relative h-[80vh] md:h-[600px] lg:h-[700px] w-full">
            {slides.map((slide: any, index: number) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                  src={slide.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
                  <div className="max-w-3xl px-4">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-lg">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium drop-shadow-md">
                        {slide.subtitle}
                      </p>
                    )}
                    <Link
                      to={slide.link || '/shop'}
                      className="inline-flex px-8 py-3.5 bg-[#c2a578] text-white rounded hover:bg-[#b09467] font-medium items-center justify-center transition-colors shadow-lg shadow-[#c2a578]/30"
                    >
                      {slide.buttonText || 'Shop Now'} <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
                  {slides.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
            <span className="text-[#c2a578] font-medium tracking-wider text-sm uppercase mb-4 block">
              Welcome to AN Mart
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Discover Pure <br className="hidden md:block" /> Radiance
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              Explore our exclusive collection of premium cosmetics, authentic skincare, and exquisite women's jewellery.
            </p>
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-[#c2a578] text-white rounded hover:bg-[#b09467] font-medium inline-flex items-center justify-center transition-colors shadow-lg shadow-[#c2a578]/30"
            >
              Shop Collection <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="border-y border-gray-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 bg-[#fafafa] rounded-full flex items-center justify-center text-[#c2a578] shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nationwide Delivery</h3>
                <p className="text-sm text-gray-500">Fast & secure shipping across BD</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 bg-[#fafafa] rounded-full flex items-center justify-center text-[#c2a578] shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">100% Authentic</h3>
                <p className="text-sm text-gray-500">Genuine products guaranteed</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 bg-[#fafafa] rounded-full flex items-center justify-center text-[#c2a578] shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                <p className="text-sm text-gray-500">Dedicated customer service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      {banners.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.slice(0, 2).map((banner: any) => (
                <Link key={banner.id} to={banner.link || '/shop'} className="block overflow-hidden rounded-2xl group relative aspect-[21/9]">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                  <img src={banner.imageUrl} alt="Promotion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Shop by Category</h2>
            <div className="w-16 h-1 bg-[#c2a578] mx-auto rounded"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { name: 'Cosmetics', icon: Sparkles, link: '/category/cosmetics' },
              { name: 'Jewellery', icon: Gem, link: '/category/jewellery' },
              { name: 'Skincare', icon: Star, link: '/category/skincare' },
              { name: 'Accessories', icon: ShieldCheck, link: '/category/accessories' },
            ].map((category) => (
              <Link 
                key={category.name} 
                to={category.link}
                className="group flex flex-col items-center p-8 rounded-2xl bg-[#FAFAFA] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-[#c2a578] mb-6 group-hover:scale-110 transition-transform duration-300">
                  <category.icon size={32} />
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">New Arrivals</h2>
              <div className="w-16 h-1 bg-[#c2a578] rounded"></div>
            </div>
            <Link to="/shop" className="hidden md:flex items-center text-[#c2a578] font-medium hover:text-[#b09467] transition-colors">
              View All <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.filter(p => p.status === "published").slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center text-[#c2a578] font-medium hover:text-[#b09467] transition-colors">
              View All Products <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
