import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Truck, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/ui/Input';
import { formatPrice } from '../../utils/formatters';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalAmount, clearCart, getTotalItems } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    altPhone: '',
    division: 'Dhaka',
    district: '',
    address: '',
    paymentMethod: 'cod' // cod, bkash, nagad, card
  });

  // Calculate totals
  const subtotal = getTotalAmount();
  const deliveryCharge = formData.division === 'Dhaka' ? 60 : 120;
  const grandTotal = subtotal + deliveryCharge;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

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
      const orderData = {
        user_id: user?.uid || null,
        customer_info: formData,
        items: items,
        subtotal,
        delivery_charge: deliveryCharge,
        grand_total: grandTotal,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) throw error;
      
      // If payment method is not COD, here we would redirect to payment gateway
      if (formData.paymentMethod !== 'cod') {
        toast.loading('Redirecting to payment gateway...', { duration: 2000 });
        // Simulating payment gateway redirect and return
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast.success('Order placed successfully!');
      clearCart();
      // Normally redirect to an order success/tracking page
      navigate('/profile'); 
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Secure Checkout | AN Mart</title>
      </Helmet>

      <div className="bg-[#FAFAFA] min-h-screen py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-bold text-dark mb-8">Checkout</h1>
          
          <form onSubmit={handlePlaceOrder} className="flex flex-col-reverse lg:flex-row gap-8">
            
            {/* Left Column - Forms */}
            <div className="lg:w-2/3 space-y-8">
              
              {/* Shipping Address */}
              <div className="card-premium p-6 sm:p-8">
                <h2 className="text-xl font-serif font-bold text-dark mb-6 flex items-center gap-2 border-b border-cream pb-4">
                  <Truck className="text-primary" /> Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-dark-light">Division</label>
                    <select 
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                      className="px-4 py-2.5 rounded-lg border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chattogram">Chattogram</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barishal">Barishal</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                    </select>
                  </div>
                  
                  <Input 
                    label="District / City" 
                    name="district" 
                    required 
                    value={formData.district} 
                    onChange={handleChange} 
                    placeholder="e.g. Dhaka North"
                  />
                </div>
                
                <div className="mt-6 w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-dark-light">Detailed Address</label>
                  <textarea 
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House, Road, Area, etc."
                    className="px-4 py-2.5 rounded-lg border border-cream-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="card-premium p-6 sm:p-8">
                <h2 className="text-xl font-serif font-bold text-dark mb-6 flex items-center gap-2 border-b border-cream pb-4">
                  <CreditCard className="text-primary" /> Payment Method
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <label className={`cursor-pointer rounded-xl border-2 p-4 flex items-start gap-4 transition-all ${
                    formData.paymentMethod === 'cod' ? 'border-primary bg-primary-50' : 'border-cream hover:border-primary-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={formData.paymentMethod === 'cod'} 
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary border-gray-300" 
                    />
                    <div>
                      <span className="block font-semibold text-dark flex items-center gap-2">
                        <Banknote size={18} className="text-green-600" /> Cash on Delivery
                      </span>
                      <span className="block text-sm text-dark-light mt-1">Pay when you receive the product.</span>
                    </div>
                  </label>

                  {/* bKash */}
                  <label className={`cursor-pointer rounded-xl border-2 p-4 flex items-start gap-4 transition-all ${
                    formData.paymentMethod === 'bkash' ? 'border-primary bg-primary-50' : 'border-cream hover:border-primary-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bkash" 
                      checked={formData.paymentMethod === 'bkash'} 
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary border-gray-300" 
                    />
                    <div>
                      <span className="block font-semibold text-dark flex items-center gap-2">
                        <div className="w-5 h-5 bg-pink-500 rounded-sm flex items-center justify-center text-white text-[10px] font-bold tracking-tighter">bK</div> bKash Payment
                      </span>
                      <span className="block text-sm text-dark-light mt-1">Secure online payment via bKash.</span>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label className={`cursor-pointer rounded-xl border-2 p-4 flex items-start gap-4 transition-all ${
                    formData.paymentMethod === 'nagad' ? 'border-primary bg-primary-50' : 'border-cream hover:border-primary-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="nagad" 
                      checked={formData.paymentMethod === 'nagad'} 
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary border-gray-300" 
                    />
                    <div>
                      <span className="block font-semibold text-dark flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center text-white text-[10px] font-bold tracking-tighter">N</div> Nagad Payment
                      </span>
                      <span className="block text-sm text-dark-light mt-1">Secure online payment via Nagad.</span>
                    </div>
                  </label>

                  {/* Cards */}
                  <label className={`cursor-pointer rounded-xl border-2 p-4 flex items-start gap-4 transition-all ${
                    formData.paymentMethod === 'card' ? 'border-primary bg-primary-50' : 'border-cream hover:border-primary-300'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card" 
                      checked={formData.paymentMethod === 'card'} 
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary border-gray-300" 
                    />
                    <div>
                      <span className="block font-semibold text-dark flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-600" /> Credit/Debit Card
                      </span>
                      <span className="block text-sm text-dark-light mt-1">Visa, MasterCard, Amex supported.</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column - Summary */}
            <div className="lg:w-1/3">
              <div className="card-premium p-6 sticky top-24">
                <h3 className="font-serif font-bold text-xl mb-6 border-b border-cream pb-4">Order Summary</h3>
                
                {/* Items preview */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                  {items.map(item => (
                    <div key={item.cartItemId} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-cream rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-semibold text-dark line-clamp-1">{item.title}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-dark-light">Qty: {item.quantity}</span>
                          <span className="text-sm font-bold text-primary">{formatPrice((item.discountPrice || item.price) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 text-sm mb-6 border-t border-cream pt-6">
                  <div className="flex justify-between">
                    <span className="text-dark-light">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-light">Delivery Charge</span>
                    <span className="font-medium text-dark">{formatPrice(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-cream mt-4">
                    <span className="font-serif font-bold text-lg text-dark">Grand Total</span>
                    <span className="font-serif font-bold text-2xl text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary h-14"
                >
                  {loading ? 'Processing...' : `Place Order • ${formatPrice(grandTotal)}`}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-dark-light">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span>Secure SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
}
