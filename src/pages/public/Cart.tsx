import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { formatPrice } from '../../utils/formatters';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalAmount, getTotalItems } = useCartStore();

  const deliveryCharge = items.length > 0 ? 60 : 0; // Simulated delivery charge
  const subtotal = getTotalAmount();
  const grandTotal = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart | AN Mart</title>
        </Helmet>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-[#FAFAFA]">
          <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-primary-300 mb-6">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-dark mb-4">Your cart is empty</h2>
          <p className="text-dark-light mb-8 text-center max-w-md">
            Looks like you haven't added anything to your cart yet. Discover our premium collections and find something you love.
          </p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${getTotalItems()}) | AN Mart`}</title>
      </Helmet>
      
      <div className="bg-[#FAFAFA] min-h-screen py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-dark mb-8">Shopping Cart</h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3 space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="card-premium p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start relative">
                  
                  {/* Remove Button Mobile */}
                  <button 
                    onClick={() => removeItem(item.cartItemId)}
                    className="sm:hidden absolute top-4 right-4 text-dark-light hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>

                  <Link to={`/product/${item.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-cream rounded-xl overflow-hidden block">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </Link>
                  
                  <div className="flex-grow flex flex-col justify-between h-full w-full">
                    <div>
                      <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                        {item.brand || item.category}
                      </div>
                      <Link to={`/product/${item.slug}`} className="block pr-6 sm:pr-0">
                        <h3 className="font-serif font-semibold text-dark text-lg hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="mt-2 text-dark font-medium">
                        {formatPrice(item.discountPrice || item.price)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 sm:mt-6 w-full">
                      <div className="flex items-center border border-cream-dark rounded-full bg-white">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-dark-light hover:text-primary transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-dark-light hover:text-primary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.cartItemId)}
                        className="hidden sm:flex items-center gap-1.5 text-sm text-dark-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="card-premium p-6 sticky top-24">
                <h3 className="font-serif font-bold text-xl mb-6 border-b border-cream pb-4">Order Summary</h3>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-dark-light">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-light">Delivery Charge</span>
                    <span className="font-medium text-dark">{formatPrice(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-cream">
                    <span className="font-serif font-bold text-lg text-dark">Grand Total</span>
                    <span className="font-serif font-bold text-2xl text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary h-14"
                >
                  Proceed to Checkout <ArrowRight size={18} className="ml-2" />
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-4 border-t border-cream pt-6">
                  <p className="text-xs text-dark-light text-center">
                    Secure checkout powered by industry standard encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
