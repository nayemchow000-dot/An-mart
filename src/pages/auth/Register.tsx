import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      if (authError) throw authError;

      // 2. Create Profile in PostgreSQL
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            role: 'customer',
            updated_at: new Date().toISOString(),
          });
          
        if (profileError) {
          console.warn("Profile creation error:", profileError);
        }
      }

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.warn(error);
      if (error.message?.includes('already registered')) {
        toast.error('Email is already in use');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
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

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Full Address / Location</label>
              <textarea 
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House, Road, Area, City"
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
