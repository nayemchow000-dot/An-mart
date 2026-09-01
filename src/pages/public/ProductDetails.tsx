import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = useProductStore();
  
  const [product, setProduct] = useState(products.find(p => p.slug === slug));
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    // Simulate fetch from Firestore based on slug
    const foundProduct = products.find(p => p.slug === slug);
    if (foundProduct) {
      setProduct(foundProduct);
      setActiveImage(0);
      setQuantity(1);
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="btn-outline">Return to Shop</button>
      </div>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const currentPrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    addItem({
      ...product,
      cartItemId: `${product.id}-${Date.now()}`,
      quantity
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <>
      <Helmet>
        <title>{`${product.title} | AN Mart`}</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb could go here */}

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-24 flex-shrink-0 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square w-20 md:w-full rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[500px] flex-grow bg-cream rounded-2xl overflow-hidden">
              <img 
                src={product.images[activeImage]} 
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {product.discountPrice && (
                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                  Sale
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-2 text-sm text-primary font-semibold uppercase tracking-wider">
              {product.brand || product.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex items-end gap-3 mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.discountPrice)}</span>
                  <span className="text-xl text-dark-light line-through mb-1">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-dark-light text-base leading-relaxed mb-8">
              {product.shortDescription}
            </p>

            <div className="border-t border-b border-cream py-6 mb-8 space-y-6">
              {/* Quantity */}
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-dark w-20">Quantity</span>
                <div className="flex items-center border border-cream-dark rounded-full bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-dark-light hover:text-primary transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-dark-light hover:text-primary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-dark-light">
                  {product.stock} items available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 btn-outline h-14"
              >
                <ShoppingBag size={20} className="mr-2" /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 btn-primary h-14"
              >
                Buy it Now
              </button>
              <button 
                onClick={() => isInWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                className="w-14 h-14 rounded-full border border-cream-dark flex items-center justify-center text-dark-light hover:text-primary hover:border-primary transition-all flex-shrink-0"
              >
                <Heart size={20} className={isInWishlist ? 'fill-primary text-primary' : ''} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-cream/50 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="text-primary mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-sm">Delivery across Bangladesh</h4>
                  <p className="text-xs text-dark-light mt-1">Inside Dhaka: 1-2 Days, Outside Dhaka: 3-5 Days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="text-primary mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-sm">Return Policy</h4>
                  <p className="text-xs text-dark-light mt-1">3 days easy return if product is damaged or defective.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mt-16 pt-16 border-t border-cream">
          <h2 className="text-2xl font-serif font-bold mb-6">Product Description</h2>
          <div 
            className="prose prose-sm max-w-none text-dark-light"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
    </>
  );
}
