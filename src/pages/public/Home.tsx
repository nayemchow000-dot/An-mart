import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, Gem, ShieldCheck, Truck, Clock } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/useProductStore';

export default function Home() {
  const { products } = useProductStore();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-[#1a1a1a] text-[#c2a578] py-2 px-4 text-center text-xs md:text-sm font-medium tracking-wide">
        Free Delivery on orders over ৳5000 | 100% Authentic Products
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 z-10 text-center md:text-left">
            <span className="text-[#c2a578] font-medium tracking-wider text-sm uppercase mb-4 block">
              Welcome to AN Mart
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Discover Pure <br className="hidden md:block" /> Radiance
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto md:mx-0">
              Explore our exclusive collection of premium cosmetics, authentic skincare, and exquisite women's jewellery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/shop" 
                className="px-8 py-3.5 bg-[#c2a578] text-white rounded hover:bg-[#b09467] font-medium flex items-center justify-center transition-colors shadow-lg shadow-[#c2a578]/30"
              >
                Shop Collection <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-12 md:mt-0 relative">
            <div className="aspect-[4/5] md:aspect-square w-full max-w-md mx-auto rounded-t-full shadow-2xl relative overflow-hidden bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1615397323211-18cbac68a184?auto=format&fit=crop&q=80&w=1920" 
                alt="Premium Cosmetics" 
                className="w-full h-full object-cover" 
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 md:right-0 bg-white p-3 rounded-full shadow-xl text-[#c2a578] animate-bounce-slow">
              <Sparkles size={24} />
            </div>
            <div className="absolute bottom-20 left-10 md:-left-4 bg-white p-3 rounded-full shadow-xl text-[#c2a578] animate-bounce-slow" style={{ animationDelay: '1s' }}>
              <Star size={24} />
            </div>
          </div>
        </div>
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
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Trending Now</h2>
              <div className="w-16 h-1 bg-[#c2a578] rounded"></div>
            </div>
            <Link to="/shop" className="hidden md:flex items-center text-[#c2a578] hover:text-[#1a1a1a] font-medium transition-colors">
              View All Products <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Loading products...
              </div>
            )}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center text-[#c2a578] hover:text-[#1a1a1a] font-medium transition-colors">
              View All Products <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-24 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1599643478514-4a420804ce68?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <span className="text-[#c2a578] font-medium tracking-wider text-sm uppercase mb-4 block">
            Special Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Elevate Your Daily <br/> Beauty Ritual
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Discover our curated selection of premium international brands, 100% authentic and delivered right to your doorstep.
          </p>
          <Link 
            to="/shop" 
            className="px-10 py-4 bg-white text-[#1a1a1a] rounded hover:bg-[#c2a578] hover:text-white font-semibold transition-colors inline-flex items-center justify-center"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
