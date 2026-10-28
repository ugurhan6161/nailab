import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  badge: string | null;
  stock: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: Record<string, string> | null;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: Record<string, string> | null;
  role: string;
  created_at: string;
};

export type AcademyCourse = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};
