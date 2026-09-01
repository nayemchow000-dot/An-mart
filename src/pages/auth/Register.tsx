import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // 2. Update Auth Profile
        await updateProfile(user, {
          displayName: formData.name
        });

        // 3. Create Firestore Document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'customer',
          addresses: [],
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.message?.includes('API key')) {
          console.warn('Firebase register failed, falling back to local demo register:', err);
          const { useAuthStore } = await import('../../store/useAuthStore');
          const { setUser } = useAuthStore.getState();
          setUser({
            uid: 'demo-user-' + Date.now(),
            email: formData.email,
            name: formData.name,
            role: 'customer',
            createdAt: new Date().toISOString()
          });
        } else {
          throw err;
        }
      }

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email is already in use');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | AN Mart</title>
      </Helmet>
      
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-md w-full space-y-8 card-premium p-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-dark">Create Account</h2>
            <p className="mt-2 text-sm text-dark-light">
              Join AN Mart for a premium shopping experience
            </p>
          </div>
          
          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
            <Input
              label="Full Name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <Input
              label="Phone Number (BD)"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-dark-light">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
