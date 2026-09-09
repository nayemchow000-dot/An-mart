import { useState, useEffect } from 'react';
import { X, Truck } from 'lucide-react';
import { Product } from '../../types';
import { Input } from '../ui/Input';
import { formatPrice } from '../../utils/formatters';
import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { trackInitiateCheckout, trackPurchase, trackPlaceAnOrder, generateEventId } from '../../utils/tracking/tiktok';
import toast from 'react-hot-toast';

interface QuickOrderModalProps {
  product: Product;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickOrderModal({ product, quantity, isOpen, onClose, onSuccess }: QuickOrderModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    division: 'Dhaka',
    address: '',
    paymentMethod: 'cod'
  });

  const price = product.discountPrice || product.price;
  const subtotal = price * quantity;
  const deliveryCharge = formData.division === 'Dhaka' ? 100 : 150;
  const grandTotal = subtotal + deliveryCharge;

  useEffect(() => {
    if (isOpen) {
      trackInitiateCheckout([{ ...product, quantity }], grandTotal);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic BD Phone Validation
    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid Bangladeshi phone number');
      return;
    }

    setLoading(true);

    try {
      const orderItem = {
        ...product,
        cartItemId: `${product.id}-quick-${Date.now()}`,
        quantity
      };

      const orderData = {
        user_id: user?.uid || null,
        customer_info: formData,
        items: [orderItem],
        subtotal,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('orders').insert([orderData]);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const eventId = generateEventId();
      trackPlaceAnOrder([orderItem], grandTotal, `ORD-${Date.now()}`, eventId);
      trackPurchase([orderItem], grandTotal, `ORD-${Date.now()}`, eventId);
      
      toast.success('Order placed successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-cream px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-serif font-bold text-xl text-dark">Quick Order</h2>
          <button onClick={onClose} className="p-2 text-dark-light hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-6">
          {/* Order Summary Summary */}
          <div className="bg-cream/30 p-4 rounded-xl flex gap-4 items-center">
            <img 
              src={product.images?.[0] || ""} 
              alt={product.title} 
              className="w-16 h-16 object-cover rounded-lg border border-cream"
            />
            <div className="flex-1">
              <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
              <div className="text-primary font-bold mt-1">
                {quantity} × {formatPrice(price)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Input 
              label="Full Name" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your full name"
            />
            <Input 
              label="Phone Number" 
              name="phone" 
              required 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="01XXXXXXXXX"
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-dark-light">Division</label>
              <select 
                name="division" 
                value={formData.division} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="Dhaka">Dhaka (Inside) - ৳100</option>
                <option value="Outside Dhaka">Outside Dhaka - ৳150</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-dark-light">Full Address</label>
              <textarea 
                name="address" 
                required 
                value={formData.address} 
                onChange={handleChange}
                rows={2}
                placeholder="House, Road, Area"
                className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white resize-none"
              ></textarea>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-cream pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-dark-light">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-dark-light">
              <span>Delivery Charge</span>
              <span>{formatPrice(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-dark pt-2 border-t border-cream">
              <span>Total</span>
              <span className="text-primary">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-cream/50 p-4 rounded-xl border border-primary/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" checked readOnly className="text-primary focus:ring-primary" />
              <span className="font-medium text-dark">Cash on Delivery</span>
            </label>
            <p className="text-xs text-dark-light ml-7 mt-1">Pay with cash upon delivery.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary h-12 flex items-center justify-center text-lg"
          >
            {loading ? 'Processing...' : 'Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
