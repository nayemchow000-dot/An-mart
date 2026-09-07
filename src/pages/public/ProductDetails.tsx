import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, ShieldCheck, Star, ChevronDown, ChevronUp, Zap, Clock } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';
import QuickOrderModal from '../../components/checkout/QuickOrderModal';
import ProductCard from '../../components/product/ProductCard';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, isLoading } = useProductStore();
  
  const [product, setProduct] = useState(products.find(p => p.slug === slug));
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');
  
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    const foundProduct = products.find(p => p.slug === slug);
    if (foundProduct) {
      setProduct(foundProduct);
      setActiveImage(0);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug, products]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cream-dark border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-serif font-bold mb-4 text-dark">Product Not Found</h2>
        <p className="text-dark-light mb-8 max-w-md">The product you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary">Return to Shop</button>
      </div>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const currentPrice = product.discountPrice || product.price;
  
  // Calculate discount percentage if not explicitly provided
  const discountPercent = product.discountPercentage || 
    (product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);

  const handleAddToCart = () => {
    addItem({
      ...product,
      cartItemId: `${product.id}-${Date.now()}`,
      quantity
    });
    toast.success('Added to cart!');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Find related products (same category, excluding current)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id && p.status === 'published')
    .slice(0, 4);

  return (
    <div className="bg-white">
      <Helmet>
        <title>{`${product.title} | AN Mart`}</title>
        <meta name="description" content={product.shortDescription || `Buy ${product.title} at AN Mart.`} />
        <meta property="og:title" content={`${product.title} | AN Mart`} />
        <meta property="og:description" content={product.shortDescription} />
        <meta property="og:image" content={product.images?.[0] || ''} />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24 lg:h-max">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 lg:w-24 flex-shrink-0 scrollbar-hide py-1">
              {(product.images || []).map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-primary ring-2 ring-primary/20 ring-offset-1' : 'border-cream hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {product.videoUrl && (
                <button 
                  onClick={() => setActiveImage(-1)}
                  className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden border-2 flex items-center justify-center bg-dark/5 text-dark transition-all ${
                    activeImage === -1 ? 'border-primary ring-2 ring-primary/20 ring-offset-1 text-primary' : 'border-cream hover:border-primary/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <svg className="w-8 h-8 fill-current text-white drop-shadow-md" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover opacity-50" />}
                </button>
              )}
            </div>
            
            {/* Main Image/Video */}
            <div className="relative aspect-square sm:aspect-[4/5] lg:aspect-[3/4] flex-grow bg-cream rounded-2xl overflow-hidden shadow-sm">
              {activeImage === -1 && product.videoUrl ? (
                <video 
                  src={product.videoUrl} 
                  autoPlay 
                  controls 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={product.images?.[activeImage] || ""} 
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercent > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.isFlashSale && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Zap size={12} className="fill-current" /> Flash Sale
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info (Right Column) */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Link to={`/category/${product.category.toLowerCase()}`} className="text-sm text-primary font-semibold uppercase tracking-wider hover:underline">
                  {product.brand || product.category}
                </Link>
                {product.sku && (
                  <span className="text-xs text-dark-light bg-cream px-2 py-0.5 rounded-full font-medium">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <Star className="fill-current" size={16} />
                <Star className="fill-current" size={16} />
                <Star className="fill-current" size={16} />
                <Star className="fill-current" size={16} />
                <Star className="fill-current" size={16} />
                <span className="text-dark-light ml-1">(Reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-dark mb-4 leading-tight">
              {product.title}
            </h1>
            
            {product.titleBn && (
              <h2 className="text-xl sm:text-2xl text-dark-light font-medium mb-4">{product.titleBn}</h2>
            )}

            {/* Pricing Box */}
            <div className="bg-cream/30 border border-cream rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap items-end gap-4 mb-2">
                <span className="text-4xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                {product.discountPrice && (
                  <span className="text-xl text-dark-light line-through mb-1">{formatPrice(product.price)}</span>
                )}
              </div>
              
              {product.stockStatus === 'in_stock' || product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  In Stock ({product.stock} items available)
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500 text-sm font-medium mt-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Out of Stock
                </div>
              )}
            </div>

            <p className="text-dark-light text-base md:text-lg leading-relaxed mb-8">
              {product.shortDescription}
            </p>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border-2 border-cream-dark rounded-xl bg-white w-full sm:w-auto">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 flex items-center justify-center text-dark-light hover:text-primary transition-colors"
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-14 h-14 flex items-center justify-center text-dark-light hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex-1 flex gap-2">
                <button 
                  onClick={() => setIsQuickOrderOpen(true)}
                  disabled={product.stock <= 0}
                  className="flex-1 btn-primary h-14 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 animate-pulse-slow"
                >
                  Order Now (Quick)
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-14 h-14 btn-outline p-0 flex items-center justify-center flex-shrink-0"
                  title="Add to Cart"
                >
                  <ShoppingBag size={22} />
                </button>
                <button 
                  onClick={() => isInWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isInWishlist 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-cream-dark text-dark-light hover:border-primary hover:text-primary'
                  }`}
                >
                  <Heart size={22} className={isInWishlist ? 'fill-primary' : ''} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 bg-cream/30 p-3 rounded-xl border border-cream">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-dark">Delivery Time</h4>
                  <p className="text-xs text-dark-light">{product.deliveryTime || '2-5 Business Days'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-cream/30 p-3 rounded-xl border border-cream">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                  {product.isCodAvailable !== false ? <RotateCcw size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-dark">{product.isCodAvailable !== false ? 'Cash on Delivery' : '100% Authentic'}</h4>
                  <p className="text-xs text-dark-light">{product.isCodAvailable !== false ? 'Pay when you receive' : 'Guaranteed Products'}</p>
                </div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-cream divide-y divide-cream">
              
              {/* Description (English) */}
              <div className="py-2">
                <button 
                  onClick={() => toggleSection('description')}
                  className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                >
                  <span>Detailed Description</span>
                  {expandedSection === 'description' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSection === 'description' && (
                  <div className="pb-6 prose prose-sm sm:prose-base prose-primary max-w-none text-dark-light animate-in fade-in slide-in-from-top-2 duration-300"
                       dangerouslySetInnerHTML={{ __html: product.description }} />
                )}
              </div>

              {/* Description (Bangla) */}
              {product.descriptionBn && (
                <div className="py-2">
                  <button 
                    onClick={() => toggleSection('descriptionBn')}
                    className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                  >
                    <span>বিস্তারিত বিবরণ (বাংলা)</span>
                    {expandedSection === 'descriptionBn' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'descriptionBn' && (
                    <div className="pb-6 prose prose-sm sm:prose-base prose-primary max-w-none text-dark-light animate-in fade-in slide-in-from-top-2 duration-300 font-sans"
                         dangerouslySetInnerHTML={{ __html: product.descriptionBn }} />
                  )}
                </div>
              )}

              {/* Benefits (if exists) */}
              {product.benefits && (
                <div className="py-2">
                  <button 
                    onClick={() => toggleSection('benefits')}
                    className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                  >
                    <span>Key Benefits</span>
                    {expandedSection === 'benefits' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'benefits' && (
                    <div className="pb-6 prose prose-sm sm:prose-base prose-primary max-w-none text-dark-light animate-in fade-in slide-in-from-top-2 duration-300"
                         dangerouslySetInnerHTML={{ __html: product.benefits }} />
                  )}
                </div>
              )}

              {/* Ingredients (if exists) */}
              {product.ingredients && (
                <div className="py-2">
                  <button 
                    onClick={() => toggleSection('ingredients')}
                    className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                  >
                    <span>Ingredients</span>
                    {expandedSection === 'ingredients' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'ingredients' && (
                    <div className="pb-6 prose prose-sm sm:prose-base prose-primary max-w-none text-dark-light animate-in fade-in slide-in-from-top-2 duration-300"
                         dangerouslySetInnerHTML={{ __html: product.ingredients }} />
                  )}
                </div>
              )}

              {/* How to Use (if exists) */}
              {product.howToUse && (
                <div className="py-2">
                  <button 
                    onClick={() => toggleSection('howToUse')}
                    className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                  >
                    <span>How to Use</span>
                    {expandedSection === 'howToUse' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'howToUse' && (
                    <div className="pb-6 prose prose-sm sm:prose-base prose-primary max-w-none text-dark-light animate-in fade-in slide-in-from-top-2 duration-300"
                         dangerouslySetInnerHTML={{ __html: product.howToUse }} />
                  )}
                </div>
              )}

              {/* Specifications (if exists) */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="py-2">
                  <button 
                    onClick={() => toggleSection('specs')}
                    className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                  >
                    <span>Specifications</span>
                    {expandedSection === 'specs' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'specs' && (
                    <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <table className="w-full text-sm text-left">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <tr key={key} className="border-b border-cream last:border-0">
                              <th className="py-3 px-4 bg-cream/30 font-medium text-dark w-1/3 rounded-l-lg">{key}</th>
                              <td className="py-3 px-4 text-dark-light">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* FAQs (if exists) */}
              {product.faqs && product.faqs.length > 0 && (
                <div className="py-2">
                  <button 
                    onClick={() => toggleSection('faqs')}
                    className="w-full py-4 flex items-center justify-between font-serif font-bold text-lg text-dark hover:text-primary transition-colors"
                  >
                    <span>Frequently Asked Questions</span>
                    {expandedSection === 'faqs' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === 'faqs' && (
                    <div className="pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {product.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-cream/20 p-4 rounded-xl border border-cream">
                          <h4 className="font-bold text-dark mb-2">{faq.question}</h4>
                          <p className="text-dark-light text-sm">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-cream/20 py-16 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-serif font-bold text-dark text-center mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream p-4 z-40 flex items-center gap-3 pb-6 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex-1 flex flex-col">
          <span className="text-xs text-dark-light font-medium uppercase tracking-wider">{product.title}</span>
          <span className="text-lg font-bold text-primary leading-none mt-0.5">{formatPrice(currentPrice)}</span>
        </div>
        <button 
          onClick={() => setIsQuickOrderOpen(true)}
          disabled={product.stock <= 0}
          className="btn-primary h-12 px-6 flex-shrink-0 shadow-lg"
        >
          Order Now
        </button>
      </div>

      {/* Modals */}
      <QuickOrderModal 
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        product={product}
        quantity={quantity}
        onSuccess={() => {
          setIsQuickOrderOpen(false);
          navigate('/checkout'); // Or a dedicated success page
        }}
      />
    </div>
  );
}
