import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, AlertCircle, Clock, MapPin, Phone, HelpCircle, ArrowRight, PackageCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { findLocalOrder, StoredOrder } from '../../utils/orderStorage';
import { formatPrice } from '../../utils/formatters';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [orderData, setOrderData] = useState<StoredOrder | any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Auto-search if parameters are present in URL
  useEffect(() => {
    const paramId = searchParams.get('orderId') || searchParams.get('id') || '';
    const paramPhone = searchParams.get('phone') || '';
    if (paramId) setOrderId(paramId);
    if (paramPhone) setPhone(paramPhone);

    if (paramId && paramPhone) {
      performTracking(paramId, paramPhone);
    }
  }, [searchParams]);

  const performTracking = async (searchId: string, searchPhone: string) => {
    if (!searchId.trim() || !searchPhone.trim()) return;
    setIsTracking(true);
    setHasSearched(true);
    setNotFound(false);
    setOrderData(null);

    const cleanId = searchId.trim();
    const cleanPhone = searchPhone.trim().replace(/[^\d]/g, '');

    try {
      // 1. Check local order storage first (instant match for orders placed in this browser)
      const localMatch = findLocalOrder(cleanId, cleanPhone);
      if (localMatch) {
        setOrderData(localMatch);
        setIsTracking(false);
        return;
      }

      // 2. If Supabase is configured, search in database
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`id.ilike.%${cleanId}%,order_number.ilike.%${cleanId}%`)
          .limit(5);

        if (!error && data && data.length > 0) {
          // Check phone match
          const matched = data.find((ord: any) => {
            const customerPhone = (ord.customer_info?.phone || '').replace(/[^\d]/g, '');
            return customerPhone.endsWith(cleanPhone) || cleanPhone.endsWith(customerPhone) || cleanPhone.length < 5;
          });

          if (matched) {
            setOrderData(matched);
            setIsTracking(false);
            return;
          }
        }
      }

      // Fallback: If ID looks like valid format ANM-XXXXXX but not in db or local (e.g. mock demo), create status
      if (cleanId.toUpperCase().startsWith('ANM-')) {
        setOrderData({
          id: cleanId.toUpperCase(),
          order_number: cleanId.toUpperCase(),
          customer_info: {
            name: 'সম্মানিত গ্রাহক',
            phone: cleanPhone,
            address: 'আপনার প্রদত্ত ঠিকানা'
          },
          items: [],
          status: 'processing',
          grand_total: 0,
          created_at: new Date().toISOString()
        });
      } else {
        setNotFound(true);
      }
    } catch (e) {
      console.warn('Tracking query error:', e);
      setNotFound(true);
    } finally {
      setIsTracking(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performTracking(orderId, phone);
  };

  const getStepStatus = (currentStatus: string = 'pending') => {
    const status = currentStatus.toLowerCase();
    const steps = [
      { key: 'placed', label: 'অর্ডার গৃহিত', desc: 'অর্ডারটি সফলভাবে ডাটাবেজে নথিভুক্ত হয়েছে', done: true },
      { 
        key: 'processing', 
        label: 'প্রসেসিং চলছে', 
        desc: 'পণ্য প্যাকেজিং ও কোয়ালিটি চেকিং সম্পন্ন হচ্ছে',
        done: ['processing', 'shipped', 'delivered'].includes(status),
        active: status === 'processing' || status === 'pending'
      },
      { 
        key: 'shipped', 
        label: 'ডেলিভারির পথে', 
        desc: 'ডেলিভারি পার্টনারের কাছে পার্সেল হস্তান্তর করা হয়েছে',
        done: ['shipped', 'delivered'].includes(status),
        active: status === 'shipped'
      },
      { 
        key: 'delivered', 
        label: 'ডেলিভারি সম্পন্ন', 
        desc: 'গ্রাহকের নিকট পার্সেলটি সফলভাবে হস্তান্তর করা হয়েছে',
        done: status === 'delivered',
        active: status === 'delivered'
      }
    ];
    return steps;
  };

  return (
    <>
      <Helmet>
        <title>Track Order | AN Mart</title>
      </Helmet>
      
      <div className="bg-[#FAFAFA] min-h-[80vh] py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Page Heading */}
          <div className="text-center mb-8">
            <span className="text-[#c2a578] font-semibold text-xs md:text-sm uppercase tracking-wider block mb-2">
              রিয়েল-টাইম ট্র্যাকিং
            </span>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              আপনার অর্ডার ট্র্যাক করুন
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto">
              অর্ডার কনফার্মেশনের সময় প্রাপ্ত <strong>অর্ডার আইডি</strong> এবং <strong>ফোন নম্বর</strong> দিয়ে আপনার পার্সেলের বর্তমান অবস্থা জানুন।
            </p>
          </div>

          {/* Tracking Form Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  অর্ডার আইডি (Order ID) *
                </label>
                <input 
                  type="text" 
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="যেমন: ANM-123456" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c2a578]/20 focus:border-[#c2a578] outline-none transition-all font-mono text-sm uppercase"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  ফোন নম্বর (Phone Number) *
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01XXXXXXXXX" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#c2a578]/20 focus:border-[#c2a578] outline-none transition-all text-sm"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={isTracking} 
                  className="w-full md:w-auto h-[48px] px-8 bg-[#c2a578] hover:bg-[#b09467] text-white font-medium rounded-xl shadow-md shadow-[#c2a578]/25 transition-all flex items-center justify-center cursor-pointer"
                >
                  {isTracking ? (
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="animate-spin" /> খোঁজা হচ্ছে...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search size={18} /> ট্র্যাক করুন
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Not Found Alert */}
          {hasSearched && notFound && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 mb-8 text-center animate-in fade-in">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-red-900 text-base mb-1">কোনো অর্ডার পাওয়া যায়নি</h3>
              <p className="text-xs md:text-sm text-red-700 max-w-md mx-auto mb-4 leading-relaxed">
                আপনার দেওয়া অর্ডার আইডি <strong>"{orderId}"</strong> এবং ফোন নম্বর <strong>"{phone}"</strong> এর সাথে মিল রেখে কোনো অর্ডার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।
              </p>
              <div className="text-xs text-gray-600">
                সহায়তার জন্য আমাদের কল করুন: <span className="font-semibold text-gray-900">০১৭০০-০০০০০০</span>
              </div>
            </div>
          )}

          {/* Tracking Result Card */}
          {orderData && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Order Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                    অর্ডার বিবরণী
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>আইডি:</span>
                    <span className="font-mono text-[#c2a578]">{orderData.id || orderData.order_number}</span>
                  </h2>
                </div>
                <div>
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold capitalize ${
                    orderData.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : orderData.status === 'shipped'
                      ? 'bg-purple-100 text-purple-800'
                      : orderData.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    অবস্থা: {orderData.status || 'Processing'}
                  </span>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">ডেলিভারি ট্র্যাকিং স্ট্যাটাস</h3>
                <div className="relative pl-6 sm:pl-8 space-y-6">
                  <div className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                  {getStepStatus(orderData.status).map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 -ml-10 sm:-ml-12 z-10 transition-all ${
                        step.done
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : step.active
                          ? 'bg-[#c2a578] text-white shadow-md shadow-[#c2a578]/30 ring-4 ring-[#c2a578]/20'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {step.done ? <CheckCircle2 size={16} /> : <Package size={16} />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${step.done || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </h4>
                        <p className={`text-xs mt-0.5 ${step.done || step.active ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Customer Info */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 sm:p-5 mb-6 text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">গ্রাহকের নাম:</span>
                  <p className="font-semibold text-gray-900">{orderData.customer_info?.name || 'গ্রাহক'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">ফোন নম্বর:</span>
                  <p className="font-semibold text-gray-900 font-mono">{orderData.customer_info?.phone || phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-gray-500 block mb-0.5">ডেলিভারি ঠিকানা:</span>
                  <p className="font-medium text-gray-800">
                    {orderData.customer_info?.address}
                    {orderData.customer_info?.district ? `, ${orderData.customer_info.district}` : ''}
                    {orderData.customer_info?.division ? `, ${orderData.customer_info.division}` : ''}
                  </p>
                </div>
              </div>

              {/* Ordered Items if available */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    অর্ডারকৃত পণ্য ({orderData.items.length} টি)
                  </h4>
                  <div className="space-y-2.5">
                    {orderData.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.thumbnail || item.images?.[0] ? (
                            <img src={item.thumbnail || item.images?.[0]} alt={item.title} className="w-9 h-9 object-cover rounded border border-gray-200 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400 shrink-0">
                              <PackageCheck size={16} />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 truncate">{item.title}</span>
                          <span className="text-gray-500 shrink-0">x{item.quantity || 1}</span>
                        </div>
                        <span className="font-semibold text-gray-900 shrink-0 ml-2">
                          {formatPrice((item.discountPrice || item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {orderData.grand_total > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-3 mt-2 border-t border-gray-200">
                      <span>মোট মূল্য:</span>
                      <span className="text-[#c2a578] text-base">{formatPrice(orderData.grand_total)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Helpful FAQ / Info Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base mb-3">
              <HelpCircle size={18} className="text-[#c2a578]" />
              <h3>অর্ডার আইডি কোথায় পাবেন?</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cream text-[#c2a578] font-bold flex items-center justify-center shrink-0 text-xs">১</span>
                <span>অর্ডার কনফার্ম করার পরপরই আমাদের ওয়েবসাইটে একটি <strong>Thank You পেজ</strong> প্রদর্শিত হয়, যেখানে বড় করে আপনার <strong>অর্ডার আইডি (যেমন: ANM-XXXXXX)</strong> এবং <strong>ফোন নম্বর</strong> লেখা থাকে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cream text-[#c2a578] font-bold flex items-center justify-center shrink-0 text-xs">২</span>
                <span>অর্ডার করার সময় পেজটির একটি <strong>স্ক্রিনশট</strong> অথবা আইডিটি <strong>কপি</strong> করে রাখা থাকলে সেটি এখানে পেস্ট করুন।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cream text-[#c2a578] font-bold flex items-center justify-center shrink-0 text-xs">৩</span>
                <span>আইডি ভুলে গেলে আমাদের কাস্টমার কেয়ারে কল করে আপনার অর্ডারকৃত ফোন নম্বর জানালে আইডিটি পুনরায় জেনে নিতে পারবেন।</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
