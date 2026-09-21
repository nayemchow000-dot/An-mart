import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Check, Camera, Search, ShoppingBag, ArrowRight, Printer, Phone, MapPin, PackageCheck } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

export interface OrderSuccessData {
  orderId: string;
  phone: string;
  name: string;
  address: string;
  division?: string;
  district?: string;
  paymentMethod: string;
  grandTotal: number;
  deliveryCharge: number;
  subtotal: number;
  items: any[];
  createdAt: string;
}

interface OrderSuccessViewProps {
  order: OrderSuccessData;
  onClose?: () => void;
  isModal?: boolean;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ order, onClose, isModal = false }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    toast.success('অর্ডার আইডি কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTrackOrder = () => {
    if (onClose) onClose();
    navigate(`/track-order?orderId=${encodeURIComponent(order.orderId)}&phone=${encodeURIComponent(order.phone)}`);
  };

  const handleContinueShopping = () => {
    if (onClose) onClose();
    navigate('/shop');
  };

  return (
    <div className={`w-full ${isModal ? 'p-1' : 'max-w-3xl mx-auto py-6 md:py-10 px-4'}`}>
      {/* Success Badge & Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-8 ring-emerald-50/50 animate-in zoom-in-75 duration-300">
          <CheckCircle2 size={isModal ? 38 : 46} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
          ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
          আমরা আপনার অর্ডারটি পেয়েছি। ডেলিভারির পূর্বে আমাদের প্রতিনিধি আপনার সাথে ফোন করে যোগাযোগ করবেন।
        </p>
      </div>

      {/* Critical Screenshot & Copy Notice Box */}
      <div className="mb-6 bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Camera size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <span>স্ক্রিনশট নিয়ে রাখুন বা আইডিটি কপি করুন!</span>
            </h2>
            <p className="text-xs md:text-sm text-amber-800 mt-1 leading-relaxed">
              অনুগ্রহ করে এই পেজটির একটি <strong>স্ক্রিনশট (Screenshot)</strong> নিয়ে রাখুন অথবা নিচের <strong>অর্ডার আইডিটি কপি</strong> করে সংরক্ষণ করুন। পরবর্তীতে মেনু থেকে <strong>"Track Order"</strong> করতে এই আইডি ও ফোন নম্বরটি প্রয়োজন হবে।
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Order ID & Phone Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Order ID Card */}
        <div className="bg-white border-2 border-[#c2a578]/40 rounded-2xl p-5 shadow-sm relative">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">
            <span>আপনার অর্ডার আইডি (Order ID)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl md:text-2xl font-mono font-bold text-gray-900 tracking-wider">
              {order.orderId}
            </span>
            <button
              onClick={handleCopyId}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#c2a578] hover:bg-[#b09467] text-white'
              }`}
              title="অর্ডার আইডি কপি করুন"
            >
              {copied ? (
                <>
                  <Check size={14} /> কপি হয়েছে
                </>
              ) : (
                <>
                  <Copy size={14} /> কপি করুন
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">এই আইডি দিয়ে যেকোনো সময় অর্ডার ট্র্যাক করতে পারবেন</p>
        </div>

        {/* Phone Number Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">
            নিবন্ধনকৃত ফোন নম্বর (Phone)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <Phone size={15} />
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900 font-mono">
              {order.phone}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">অর্ডার সংক্রান্ত আপডেটের জন্য এই নম্বরে কল করা হবে</p>
        </div>
      </div>

      {/* Customer & Delivery Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
          <MapPin size={18} className="text-[#c2a578]" /> ডেলিভারি ও পেমেন্ট তথ্য
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 text-xs block mb-0.5">গ্রাহকের নাম:</span>
            <p className="font-semibold text-gray-900">{order.name}</p>
          </div>
          <div>
            <span className="text-gray-500 text-xs block mb-0.5">পেমেন্ট মেথড:</span>
            <p className="font-semibold text-gray-900">
              {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : order.paymentMethod.toUpperCase()}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-500 text-xs block mb-0.5">ডেলিভারি ঠিকানা:</span>
            <p className="font-medium text-gray-800">
              {order.address}{order.district ? `, ${order.district}` : ''}{order.division ? `, ${order.division}` : ''}
            </p>
          </div>
        </div>

        {/* Ordered Items Preview */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
            অর্ডারকৃত পণ্যসমূহ ({order.items.length} টি)
          </span>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  {item.thumbnail || item.images?.[0] ? (
                    <img
                      src={item.thumbnail || item.images?.[0]}
                      alt={item.title}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 text-gray-400">
                      <PackageCheck size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">পরিমাণ: {item.quantity || 1} টি</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {formatPrice((item.discountPrice || item.price) * (item.quantity || 1))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="bg-[#fafafa] rounded-xl p-3.5 mt-3 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-600">
              <span>সাবটোটাল</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ডেলিভারি চার্জ</span>
              <span>{formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>মোট প্রদেয় টাকা</span>
              <span className="text-[#c2a578]">{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <button
          onClick={handleTrackOrder}
          type="button"
          className="w-full sm:w-auto px-6 py-3.5 bg-[#c2a578] hover:bg-[#b09467] text-white font-medium rounded-xl shadow-lg shadow-[#c2a578]/25 transition-all flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
        >
          <Search size={18} /> অর্ডার ট্র্যাক করুন (Track Order)
        </button>

        <button
          onClick={handleContinueShopping}
          type="button"
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
        >
          <ShoppingBag size={18} /> আরও শপিং করুন
        </button>

        {!isModal && (
          <button
            onClick={() => window.print()}
            type="button"
            className="w-full sm:w-auto px-4 py-3.5 text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="রশিদ প্রিন্ট করুন"
          >
            <Printer size={16} /> প্রিন্ট
          </button>
        )}
      </div>
    </div>
  );
};
