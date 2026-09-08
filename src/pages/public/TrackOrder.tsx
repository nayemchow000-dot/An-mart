import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Search, Package, Truck, CheckCircle } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [result, setResult] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) return;
    setIsTracking(true);
    setTimeout(() => {
      setIsTracking(false);
      setResult(true);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Track Order | AN Mart</title>
      </Helmet>
      
      <div className="bg-[#FAFAFA] min-h-[70vh] py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4">Track Your Order</h1>
            <p className="text-dark-light">Enter your Order ID and Phone Number to check current status</p>
          </div>

          <div className="card-premium p-6 md:p-8 mb-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Order ID</label>
                <input 
                  type="text" 
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ANM-12345" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={isTracking} className="btn-primary w-full md:w-auto h-[50px] px-8">
                  {isTracking ? 'Tracking...' : <><Search size={18} className="mr-2" /> Track</>}
                </button>
              </div>
            </form>
          </div>

          {result && (
            <div className="card-premium p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-dark border-b border-gray-100 pb-4 mb-6">Order Status: <span className="text-primary">Processing</span></h3>
              
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                
                <div className="space-y-8">
                  <div className="flex gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-dark">Order Confirmed</h4>
                      <p className="text-sm text-dark-light">Your order has been received and confirmed.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-dark">Processing</h4>
                      <p className="text-sm text-dark-light">We are preparing your items for dispatch.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative z-10 opacity-50">
                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                      <Truck size={20} />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-gray-500">Shipped</h4>
                      <p className="text-sm text-gray-400">Order handed over to delivery partner.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
