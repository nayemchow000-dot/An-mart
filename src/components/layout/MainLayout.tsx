import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useProductStore } from '../../store/useProductStore';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  // Initialize Firebase Auth listener here so it's active across the entire app
  useFirebaseAuth();
  
  useEffect(() => {
    // Initialize real-time products store
    const unsubscribe = useProductStore.getState().initializeStore();
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-gray-900 font-sans">
      <Helmet>
        <title>AN Mart | Premium Cosmetics & Jewellery</title>
        <meta name="description" content="Discover premium cosmetics, authentic skincare, and elegant women's jewellery." />
      </Helmet>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#c2a578',
              secondary: '#fff',
            },
          },
        }} 
      />
      
      <Navbar />
      
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

