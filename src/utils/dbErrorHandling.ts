import { useDBErrorStore } from '../store/useDBErrorStore';

export const handleDBError = (error: any, table: string) => {
  if (error && (error.code === '42501' || error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST116')) {
    const sql = `
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR TO CREATE MISSING TABLES

-- 1. Create Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
    id text PRIMARY KEY, name text NOT NULL, "nameBn" text, slug text NOT NULL, image text, description text, status text DEFAULT 'active', "createdAt" timestamp with time zone DEFAULT now(), "updatedAt" timestamp with time zone DEFAULT now()
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY, name text NOT NULL, "nameBn" text, "nameEn" text, slug text NOT NULL, image text, description text, "displayOrder" integer DEFAULT 0, status text DEFAULT 'active', "createdAt" timestamp with time zone DEFAULT now()
);

-- 3. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id text PRIMARY KEY, code text NOT NULL, discount text NOT NULL, "minOrder" integer, expiry text, status text DEFAULT 'active', "createdAt" timestamp with time zone DEFAULT now()
);

-- 4. Create Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id text PRIMARY KEY, title text NOT NULL, description text, status text DEFAULT 'active', "createdAt" timestamp with time zone DEFAULT now()
);

-- 5. Create Landing Pages Table
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id text PRIMARY KEY, title text NOT NULL, slug text NOT NULL, content text, status text DEFAULT 'active', "createdAt" timestamp with time zone DEFAULT now()
);

-- 6. Support Settings Table
CREATE TABLE IF NOT EXISTS public.support_settings (
    id text PRIMARY KEY, phone text, email text, whatsapp text, messenger text, address text, "updatedAt" timestamp with time zone DEFAULT now()
);

-- 7. Support Messages Table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id text PRIMARY KEY, name text NOT NULL, phone text, message text NOT NULL, status text DEFAULT 'unread', "createdAt" timestamp with time zone DEFAULT now()
);

-- 8. Grant basic table permissions to the authenticated & anon roles
GRANT ALL ON public.brands TO authenticated, anon;
GRANT ALL ON public.categories TO authenticated, anon;
GRANT ALL ON public.coupons TO authenticated, anon;
GRANT ALL ON public.offers TO authenticated, anon;
GRANT ALL ON public.landing_pages TO authenticated, anon;
GRANT ALL ON public.support_settings TO authenticated, anon;
GRANT ALL ON public.support_messages TO authenticated, anon;

-- 9. Enable Row Level Security (RLS) on the tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 10. Create Public Read & Insert Policies
CREATE POLICY "Allow public read" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.landing_pages FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.support_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.support_messages FOR INSERT WITH CHECK (true);

-- 11. Create Admin Write Policies
CREATE POLICY "Allow Admin all" ON public.brands USING (true);
CREATE POLICY "Allow Admin all" ON public.categories USING (true);
CREATE POLICY "Allow Admin all" ON public.support_settings USING (true);
CREATE POLICY "Allow Admin all" ON public.support_messages USING (true);
`;
    
    // Only set it globally if we haven't already shown it, to avoid spam
    useDBErrorStore.getState().setError(error.code, error.message, sql.trim());
  }
};
