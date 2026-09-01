import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData;
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // Create new user profile in Firestore
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'New User',
          role: 'customer',
          createdAt: new Date().toISOString(),
          addresses: [],
        };
        await setDoc(userDocRef, userData);
      }
      
      setUser(userData as any);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | AN Mart</title>
      </Helmet>
      
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-md w-full space-y-8">
          <div className="card-premium p-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-dark mb-2">Welcome Back</h2>
            <p className="text-sm text-dark-light mb-8">
              Sign in to your AN Mart account
            </p>
          
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full btn-outline flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.71 5.82 14.14H2.14V16.99C3.96 20.61 7.69 23 12 23Z" fill="#34A853"/>
                <path d="M5.82 14.14C5.59 13.47 5.46 12.75 5.46 12C5.46 11.25 5.59 10.53 5.82 9.86V7.01H2.14C1.39 8.5 0.96 10.2 0.96 12C0.96 13.8 1.39 15.5 2.14 16.99L5.82 14.14Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.45 2.08 14.97 1 12 1C7.69 1 3.96 3.39 2.14 7.01L5.82 9.86C6.71 7.29 9.14 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
