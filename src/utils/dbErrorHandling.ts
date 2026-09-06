import { useDBErrorStore } from '../store/useDBErrorStore';

export const handleDBError = (error: any, table: string) => {
  if (error && (error.code === '42501' || error.code === '42P01' || error.code === 'PGRST205')) {
    const sql = `
-- 1. Grant basic table permissions to the authenticated role
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO anon;
GRANT ALL ON public.website_settings TO authenticated;
GRANT ALL ON public.website_settings TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO anon;

-- 2. Enable Row Level Security (RLS) on the tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Read Policies
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on website_settings" ON public.website_settings;
CREATE POLICY "Allow public read access on website_settings" ON public.website_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON public.categories;
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);

-- 4. Create Admin Write Policies
DROP POLICY IF EXISTS "Allow Admins to Insert Products" ON public.products;
CREATE POLICY "Allow Admins to Insert Products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Admins to Update Products" ON public.products;
CREATE POLICY "Allow Admins to Update Products" ON public.products FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow Admins to Delete Products" ON public.products;
CREATE POLICY "Allow Admins to Delete Products" ON public.products FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow Admins to Insert Settings" ON public.website_settings;
CREATE POLICY "Allow Admins to Insert Settings" ON public.website_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Admins to Update Settings" ON public.website_settings;
CREATE POLICY "Allow Admins to Update Settings" ON public.website_settings FOR UPDATE TO authenticated USING (true);
`;
    
    // Only set it globally if we haven't already shown it, to avoid spam
    useDBErrorStore.getState().setError(error.code, error.message, sql.trim());
  }
};
