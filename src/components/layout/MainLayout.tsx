import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { useProductStore } from '../../store/useProductStore';
import { useSiteConfigStore } from '../../store/useSiteConfigStore';

export default function MainLayout() {
  useEffect(() => {
    // Initialize real-time products store
    const unsubscribeProducts = useProductStore.getState().initializeStore();
    
    // Initialize site config store
    useSiteConfigStore.getState().initializeStore();

    return () => {
      unsubscribeProducts();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 font-sans">
      <Helmet>
        <title>AN Mart | Premium Cosmetics & Jewellery</title>
        <meta name="description" content="Discover premium cosmetics, authentic skincare, and elegant women's jewellery." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}


