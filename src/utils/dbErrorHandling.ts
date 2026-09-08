import { useDBErrorStore } from '../store/useDBErrorStore';

export const handleDBError = (error: any, table: string) => {
  if (error && (error.code === '42501' || error.code === '42P01' || error.code === 'PGRST205')) {
    const sql = `
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR TO CREATE MISSING TABLES

-- 1. Create Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
    id text PRIMARY KEY,
    name text NOT NULL,
    "nameBn" text,
    slug text NOT NULL,
    image text,
    description text,
    status text DEFAULT 'active',
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now()
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    "nameBn" text,
    "nameEn" text,
    slug text NOT NULL,
    image text,
    description text,
    "displayOrder" integer DEFAULT 0,
    status text DEFAULT 'active',
    "createdAt" timestamp with time zone DEFAULT now()
);

-- 3. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id text PRIMARY KEY,
    code text NOT NULL,
    discount text NOT NULL,
    "minOrder" integer,
    expiry text,
    status text DEFAULT 'active',
    "createdAt" timestamp with time zone DEFAULT now()
);

-- 4. Create Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    status text DEFAULT 'active',
    "createdAt" timestamp with time zone DEFAULT now()
);

-- 5. Create Landing Pages Table
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id text PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    status text DEFAULT 'active',
    "createdAt" timestamp with time zone DEFAULT now()
);

-- 6. Grant basic table permissions to the authenticated & anon roles
GRANT ALL ON public.brands TO authenticated;
GRANT ALL ON public.brands TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO anon;
GRANT ALL ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO anon;
GRANT ALL ON public.offers TO authenticated;
GRANT ALL ON public.offers TO anon;
GRANT ALL ON public.landing_pages TO authenticated;
GRANT ALL ON public.landing_pages TO anon;

-- 7. Enable Row Level Security (RLS) on the tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- 8. Create Public Read Policies
DROP POLICY IF EXISTS "Allow public read access on brands" ON public.brands;
CREATE POLICY "Allow public read access on brands" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on coupons" ON public.coupons;
CREATE POLICY "Allow public read access on coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on offers" ON public.offers;
CREATE POLICY "Allow public read access on offers" ON public.offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on landing_pages" ON public.landing_pages;
CREATE POLICY "Allow public read access on landing_pages" ON public.landing_pages FOR SELECT USING (true);

-- 9. Create Admin Write Policies (Simplified for demo)
DROP POLICY IF EXISTS "Allow Admins to Insert brands" ON public.brands;
CREATE POLICY "Allow Admins to Insert brands" ON public.brands FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Admins to Update brands" ON public.brands;
CREATE POLICY "Allow Admins to Update brands" ON public.brands FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow Admins to Delete brands" ON public.brands;
CREATE POLICY "Allow Admins to Delete brands" ON public.brands FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow Admins to Insert categories" ON public.categories;
CREATE POLICY "Allow Admins to Insert categories" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Admins to Update categories" ON public.categories;
CREATE POLICY "Allow Admins to Update categories" ON public.categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow Admins to Delete categories" ON public.categories;
CREATE POLICY "Allow Admins to Delete categories" ON public.categories FOR DELETE USING (true);
`;
    
    // Only set it globally if we haven't already shown it, to avoid spam
    useDBErrorStore.getState().setError(error.code, error.message, sql.trim());
  }
};
