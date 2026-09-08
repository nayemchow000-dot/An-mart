import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function Support() {
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
            <div className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Call Us</h3>
              <p className="text-sm text-dark-light mb-1">+880 1234-567890</p>
              <p className="text-xs text-gray-400">10 AM to 8 PM</p>
            </div>
            
            <div className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Email Us</h3>
              <p className="text-sm text-dark-light mb-1">support@anmart.com</p>
              <p className="text-xs text-gray-400">24/7 Support</p>
            </div>
            
            <div className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Live Chat</h3>
              <p className="text-sm text-dark-light mb-1">Chat on WhatsApp</p>
              <p className="text-xs text-gray-400">Instant Reply</p>
            </div>
            
            <div className="card-premium p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-dark mb-2">Office Address</h3>
              <p className="text-sm text-dark-light line-clamp-2">House 12, Road 5, Block C, Banani, Dhaka</p>
            </div>
          </div>

          <div className="card-premium p-6 md:p-8">
            <h3 className="text-xl font-bold text-dark mb-6 border-b border-gray-100 pb-4">Send us a Message</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" required className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="01XXXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea required rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="btn-primary w-full md:w-auto px-8">Submit Message</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
