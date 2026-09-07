import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("No Supabase credentials found in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('products').select('title, slug, images').ilike('title', '%Hoodia%');
  if (error) {
    console.error("DB Error:", error);
  } else {
    console.log("Found products:", JSON.stringify(data, null, 2));
  }
}
check();
