import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/useProductStore';

export default function Shop() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { products } = useProductStore();

  const categories = ['Cosmetics', 'Skincare', 'Jewellery', 'Accessories'];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter products
  let displayedProducts = [...products];
  if (selectedCategories.length > 0) {
    displayedProducts = displayedProducts.filter(p => selectedCategories.includes(p.category));
  }

  // Sort products
  if (sortBy === 'price-low') {
    displayedProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sortBy === 'price-high') {
    displayedProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else {
    // Newest
    displayedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <>
      <Helmet>
        <title>Shop | AN Mart</title>
        <meta name="description" content="Browse our complete collection of premium cosmetics, skincare, and jewellery." />
      </Helmet>

      {/* Page Header */}
      <div className="bg-cream py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4">Shop All Collection</h1>
          <p className="text-dark-light max-w-2xl mx-auto">
            Discover our carefully curated selection of beauty and elegance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="font-serif font-semibold text-lg border-b border-cream pb-2 mb-4">Categories</h3>
                <ul className="space-y-3">
                  {categories.map(cat => (
                    <li key={cat}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-4 h-4 rounded border-cream-dark text-primary focus:ring-primary" 
                        />
                        <span className="text-sm text-dark-light group-hover:text-primary transition-colors">{cat}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-serif font-semibold text-lg border-b border-cream pb-2 mb-4">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 text-sm border border-cream-dark rounded-md focus:outline-none focus:border-primary" />
                  <span>-</span>
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 text-sm border border-cream-dark rounded-md focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="flex-grow">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-cream">
              <button 
                className="md:hidden flex items-center gap-2 text-sm font-medium border border-cream-dark px-4 py-2 rounded-lg"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
              
              <div className="text-sm text-dark-light hidden md:block">
                Showing {displayedProducts.length} products
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-dark-light hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-cream-dark text-sm rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-primary cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-light" />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.length > 0 ? (
                displayedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-dark-light">
                  No products found matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          <div className="fixed inset-0 bg-dark/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-4/5 max-w-xs h-full bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif font-bold text-xl">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 -mr-2">
                <X size={24} />
              </button>
            </div>
            
            {/* Same filters as desktop */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif font-semibold text-lg border-b border-cream pb-2 mb-4">Categories</h3>
                <ul className="space-y-4">
                  {categories.map(cat => (
                    <li key={cat}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="w-5 h-5 rounded border-cream-dark text-primary focus:ring-primary" 
                        />
                        <span className="text-base text-dark-light">{cat}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-cream">
              <button className="w-full btn-primary" onClick={() => setIsMobileFilterOpen(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
