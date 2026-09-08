import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { useSupportStore } from '../../store/useSupportStore';
import toast from 'react-hot-toast';

export default function Support() {
  const { settings, sendMessage, initializeStore } = useSupportStore();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = initializeStore();
    return () => unsubscribe();
  }, [initializeStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;
    
    setIsSubmitting(true);
    try {
      await sendMessage(formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: '', phone: '', message: '' });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappLink = settings?.whatsapp ? `https://wa.me/88${settings.whatsapp.replace(/[^0-9]/g, '')}` : '#';
  const messengerLink = settings?.messenger ? `https://m.me/${settings.messenger}` : '#';

  return (
    <>
      <Helmet>
        <title>Customer Support | AN Mart</title>
      </Helmet>
      
      <div className="bg-[#FAFAFA] min-h-[70vh] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4">How can we help you?</h1>
            <p className="text-dark-light max-w-2xl mx-auto">Get in touch with our customer support team for any queries related to your orders, products, or our services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <a href={`tel:${settings?.phone}`} className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300 block">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Call Us</h3>
              <p className="text-sm text-dark-light mb-1">{settings?.phone || '+880 1234-567890'}</p>
              <p className="text-xs text-gray-400">Direct Phone Call</p>
            </a>
            
            <a href={`mailto:${settings?.email}`} className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300 block">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Email Us</h3>
              <p className="text-sm text-dark-light mb-1 break-all">{settings?.email || 'support@anmart.com'}</p>
              <p className="text-xs text-gray-400">24/7 Support</p>
            </a>
            
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300 block">
              <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366] mx-auto mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">WhatsApp</h3>
              <p className="text-sm text-dark-light mb-1">Chat on WhatsApp</p>
              <p className="text-xs text-gray-400">Instant Reply</p>
            </a>
            
            <a href={messengerLink} target="_blank" rel="noopener noreferrer" className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300 block">
              <div className="w-14 h-14 bg-[#0084FF]/10 rounded-full flex items-center justify-center text-[#0084FF] mx-auto mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Messenger</h3>
              <p className="text-sm text-dark-light mb-1">Chat on FB Messenger</p>
              <p className="text-xs text-gray-400">Instant Reply</p>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card-premium p-6 md:p-8">
              <h3 className="text-xl font-bold text-dark mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-primary" /> Send us a Message
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input 
                      type="text" required 
                      value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input 
                      type="tel" required 
                      value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" 
                      placeholder="01XXXXXXXXX" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea 
                    required rows={5} 
                    value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none resize-none" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto px-8 flex items-center justify-center gap-2">
                  <Send size={18} /> {isSubmitting ? 'Sending...' : 'Submit Message'}
                </button>
              </form>
            </div>

            <div className="card-premium p-6 md:p-8 bg-dark text-white">
              <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4 text-white">Office Location</h3>
              <div className="flex items-start gap-4 text-gray-300">
                <MapPin size={24} className="text-primary shrink-0 mt-1" />
                <p className="leading-relaxed whitespace-pre-wrap">{settings?.address || 'House 12, Road 5, Block C, Banani, Dhaka'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
