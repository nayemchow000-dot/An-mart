import { Link } from 'react-router-dom';
import { Globe, Heart, Smile, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div>
            <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-white mb-6 inline-block">
              AN Mart
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your premier destination for authentic cosmetics, premium skincare, and exquisite women's jewellery. We bring the world's finest beauty products directly to you.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Heart size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Smile size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop Collection</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Top Categories</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/category/cosmetics" className="hover:text-primary transition-colors">Premium Cosmetics</Link></li>
              <li><Link to="/category/skincare" className="hover:text-primary transition-colors">Skincare Routine</Link></li>
              <li><Link to="/category/jewellery" className="hover:text-primary transition-colors">Designer Jewellery</Link></li>
              <li><Link to="/category/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <MapPin size={18} className="text-primary shrink-0" />
                <span>123 Beauty Avenue, Block C, Banani, Dhaka, Bangladesh</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+880 1712-345678</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>support@anmart.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AN Mart. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
