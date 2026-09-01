import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';

import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Shop from '../pages/public/Shop';
import ProductDetails from '../pages/public/ProductDetails';
import Cart from '../pages/public/Cart';
import Checkout from '../pages/public/Checkout';
import Profile from '../pages/customer/Profile';

import Dashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import AdminCategories from '../pages/admin/Categories';
import AdminOrders from '../pages/admin/Orders';
import AdminCustomers from '../pages/admin/Customers';
import AdminCoupons from '../pages/admin/Coupons';
import AdminSettings from '../pages/admin/Settings';

// Placeholder components for routes that don't exist yet
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[50vh] bg-[#FAFAFA]">
    <h1 className="text-2xl font-serif font-bold text-gray-900">{title} (Coming Soon)</h1>
  </div>
);

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="category/:slug" element={<Shop />} />
        <Route path="product/:slug" element={<ProductDetails />} />
        
        {/* Static Pages */}
        <Route path="about" element={<Placeholder title="About Us" />} />
        <Route path="contact" element={<Placeholder title="Contact" />} />
        <Route path="faq" element={<Placeholder title="FAQ" />} />
        
        {/* User / Cart */}
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Placeholder title="Wishlist" />} />
        <Route path="checkout" element={<Checkout />} />
        
        {/* Auth */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        
        <Route path="*" element={<Placeholder title="404 - Not Found" />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="brands" element={<Placeholder title="Brands Management" />} />
        <Route path="reviews" element={<Placeholder title="Reviews Management" />} />
        <Route path="offers" element={<Placeholder title="Offers Management" />} />
        <Route path="media" element={<Placeholder title="Media Library" />} />
        <Route path="landing-pages" element={<Placeholder title="Landing Pages" />} />
        <Route path="seo" element={<Placeholder title="SEO Management" />} />
        <Route path="content" element={<Placeholder title="Website Content" />} />
        <Route path="legal" element={<Placeholder title="Legal Pages" />} />
      </Route>
    </Routes>
  );
}
