import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

export default function App() {
  // Initialize Supabase Auth listener globally so it runs on all routes, including /admin
  useSupabaseAuth();

  return (
    <HelmetProvider>
      <BrowserRouter>
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
        <AppRouter />
      </BrowserRouter>
    </HelmetProvider>
  );
}
