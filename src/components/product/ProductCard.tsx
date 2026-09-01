import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      icon: '🛍️',
      style: {
        background: '#333',
        color: '#fff',
      }
    });
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist', {
        icon: '💖',
      });
    }
  };

  // Mock rating if not present
  const rating = product.rating || 4.5;
  const reviewsCount = product.reviewsCount || Math.floor(Math.random() * 100) + 10;

  return (
    <Link to={`/product/${product.id}`} className="group card-premium flex flex-col relative">
      {/* Discount Badge */}
      {product.discountPrice && (
        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded z-10 shadow-sm">
          -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        onClick={toggleWishlist}
        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-dark-light hover:text-primary z-10 transition-colors shadow-sm"
        aria-label="Toggle Wishlist"
      >
        <Heart size={18} className={isWishlisted ? 'fill-primary text-primary' : ''} />
      </button>

      {/* Image */}
      <div className="aspect-square bg-cream/30 overflow-hidden relative p-4">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Add overlay */}
        <div className="absolute inset-0 bg-dark/5 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex items-center justify-center backdrop-blur-[2px]">
          <button 
            onClick={handleAddToCart}
            className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 btn-primary shadow-xl"
          >
            <ShoppingBag size={18} className="mr-2" /> Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <span className="text-xs text-primary font-medium uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="font-serif font-bold text-dark text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < Math.floor(rating) ? 'fill-yellow-400' : 'text-gray-300'} />
            ))}
          </div>
          <span className="text-xs text-dark-light">({reviewsCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-dark-light text-sm line-through">{formatPrice(product.price)}</span>
                <span className="font-bold text-primary text-lg">{formatPrice(product.discountPrice)}</span>
              </>
            ) : (
              <span className="font-bold text-dark text-lg">{formatPrice(product.price)}</span>
            )}
          </div>
          
          {/* Mobile Add to Cart */}
          <button 
            onClick={handleAddToCart}
            className="lg:hidden p-2.5 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
}
