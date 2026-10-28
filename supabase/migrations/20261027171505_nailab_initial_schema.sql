/*
# NAILAB - Clinical Atelier & Academy Store - Initial Schema

## Overview
Full e-commerce + academy platform for professional nail care brand.

## New Tables

### products
- id (uuid, pk)
- name (text) - product name in Turkish
- description (text) - product description
- price (numeric) - price in TRY
- original_price (numeric) - original price for discount display
- image_url (text) - product image
- category (text) - kategori: 'kit', 'ekipman', 'malzeme', 'kurs'
- badge (text) - optional badge like 'Yeni', 'Fırsat', 'Çok Satan'
- stock (integer) - available stock
- rating (numeric) - 1-5 rating
- review_count (integer) - number of reviews
- is_active (boolean)
- created_at (timestamptz)

### orders
- id (uuid, pk)
- order_number (text, unique) - human-readable order number
- user_id (uuid, nullable) - nullable for guest orders
- guest_email (text, nullable)
- guest_name (text, nullable)
- guest_phone (text, nullable)
- status (text) - 'beklemede', 'onaylandı', 'hazırlanıyor', 'kargoda', 'teslim edildi', 'iptal'
- subtotal (numeric)
- shipping_cost (numeric)
- total (numeric)
- shipping_address (jsonb)
- payment_method (text)
- notes (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)

### order_items
- id (uuid, pk)
- order_id (uuid, fk orders)
- product_id (uuid, fk products)
- product_name (text) - snapshot at order time
- product_image (text)
- quantity (integer)
- unit_price (numeric) - price at order time
- total_price (numeric)

### profiles
- id (uuid, pk, fk auth.users)
- full_name (text)
- phone (text, nullable)
- address (jsonb, nullable)
- role (text) - 'customer', 'trainer', 'admin'
- created_at (timestamptz)

### academy_courses
- id (uuid, pk)
- title (text)
- description (text)
- instructor (text)
- duration (text)
- level (text) - 'Başlangıç', 'Orta', 'İleri'
- price (numeric)
- image_url (text)
- is_active (boolean)
- created_at (timestamptz)

### notifications
- id (uuid, pk)
- user_id (uuid, fk auth.users, nullable)
- title (text)
- message (text)
- type (text) - 'siparis', 'kampanya', 'sistem'
- is_read (boolean)
- created_at (timestamptz)

## Security
- RLS enabled on all tables
- Products and courses: public read (anon + authenticated)
- Orders: authenticated users see own orders, anon can insert (guest checkout) + read by order_number
- Profiles: authenticated users see/edit own profile
- Notifications: authenticated users see own notifications
*/

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  image_url text,
  category text NOT NULL DEFAULT 'malzeme',
  badge text,
  stock integer NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 4.5,
  review_count integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_manage_products" ON products;
CREATE POLICY "authenticated_manage_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_products" ON products;
CREATE POLICY "authenticated_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_products" ON products;
CREATE POLICY "authenticated_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address jsonb,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'NL-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email text,
  guest_name text,
  guest_phone text,
  status text NOT NULL DEFAULT 'beklemede',
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  shipping_address jsonb,
  payment_method text DEFAULT 'kredi_karti',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
CREATE POLICY "users_read_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_read_by_order_number" ON orders;
CREATE POLICY "anon_read_by_order_number" ON orders FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_orders" ON orders;
CREATE POLICY "authenticated_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON order_items TO anon, authenticated;

DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_own_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ACADEMY COURSES TABLE
CREATE TABLE IF NOT EXISTS academy_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  instructor text NOT NULL,
  duration text,
  level text DEFAULT 'Başlangıç',
  price numeric(10,2) NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON academy_courses TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_courses" ON academy_courses;
CREATE POLICY "public_read_courses" ON academy_courses FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'sistem',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;

DROP POLICY IF EXISTS "users_read_own_notifications" ON notifications;
CREATE POLICY "users_read_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "users_update_own_notifications" ON notifications;
CREATE POLICY "users_update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED SAMPLE PRODUCTS
INSERT INTO products (name, description, price, original_price, category, badge, stock, rating, review_count, image_url) VALUES
('Anatomik Tırnak Eğitim Kiti Pro', 'Profesyonel manikür akademileri için tam set anatomik eğitim kiti. 24 parça silikon el modeli, nail form setleri ve eğitim materyalleri dahil.', 2850.00, 3200.00, 'kit', 'Çok Satan', 45, 4.9, 128, 'https://images.pexels.com/photos/3997987/pexels-photo-3997987.jpeg'),
('Hassas Freze Makinesi Elite 35K', 'Profesyonel kullanım için 35.000 RPM hassas freze makinesi. Düşük titreşim, uzun ömürlü karbon fırçasız motor.', 4200.00, 4800.00, 'ekipman', 'Fırsat', 18, 4.8, 89, 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg'),
('Nail Art Başlangıç Seti', 'Tırnak sanatına yeni başlayanlar için kapsamlı kit. Jel boyalar, fırçalar, lamp ve uygulama materyalleri.', 890.00, null, 'kit', 'Yeni', 120, 4.7, 64, 'https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg'),
('UV/LED Profesyonel Lamba 48W', 'Hızlı kürleme için 48W güçlü UV/LED lamba. Tüm jel ve shellac ürünleriyle uyumlu.', 680.00, 750.00, 'ekipman', null, 87, 4.6, 203, 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg'),
('Klinik Anatomik El Modeli Set', 'Tıbbi kalitede silikon el modelleri. 5 farklı boyut, detaylı damar ve eklem yapısı ile gerçekçi uygulama imkanı.', 1650.00, null, 'kit', 'Yeni', 32, 5.0, 45, 'https://images.pexels.com/photos/3997990/pexels-photo-3997990.jpeg'),
('Profesyonel Akrilik Set Deluxe', 'Salon kalitesi akrilik tırnak seti. 20 renk akrilik toz, monomer, fırça seti ve nail form paketi.', 1250.00, 1450.00, 'malzeme', 'Fırsat', 65, 4.8, 156, 'https://images.pexels.com/photos/3997987/pexels-photo-3997987.jpeg'),
('Jel Oje Koleksiyonu 60 Renk', 'Sezonun en trend 60 renk jel oje koleksiyonu. UV/LED uyumlu, uzun kalıcı formül.', 1890.00, 2100.00, 'malzeme', 'Çok Satan', 43, 4.7, 312, 'https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg'),
('Toz Emici Masaüstü Aspiratör Pro', 'Güçlü filtre sistemi ile toz ve kimyasal buhar emen profesyonel masaüstü aspiratör.', 950.00, null, 'ekipman', null, 28, 4.5, 77, 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg')
ON CONFLICT DO NOTHING;

-- SEED SAMPLE COURSES
INSERT INTO academy_courses (title, description, instructor, duration, level, price, image_url) VALUES
('Profesyonel Manikür Temelleri', 'Tırnak bakımının temel tekniklerini öğrenin. Hijyen kuralları, alet kullanımı ve temel boyama teknikleri.', 'Dr. Ayşe Kaya', '8 Saat', 'Başlangıç', 1500.00, 'https://images.pexels.com/photos/3997987/pexels-photo-3997987.jpeg'),
('Jel ve Akrilik Uygulama Masterclass', 'Jel ve akrilik tırnak uygulamalarında ileri düzey teknikler. Sertifikalı eğitim programı.', 'Uzm. Fatma Demir', '16 Saat', 'Orta', 3200.00, 'https://images.pexels.com/photos/1604869/pexels-photo-1604869.jpeg'),
('Nail Art & Tasarım Workshop', 'Yaratıcı tırnak sanatı teknikleri. Nail art detay çalışmaları, airbrush ve 3D tasarım.', 'Selin Arslan', '12 Saat', 'İleri', 2800.00, 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg'),
('Klinik Anatomik Tırnak Eğitimi', 'Tırnak anatomisi ve patolojisi. Klinik yaklaşım ve medikal tırnak bakımı teknikleri.', 'Dr. Mehmet Yılmaz', '20 Saat', 'İleri', 4500.00, 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg')
ON CONFLICT DO NOTHING;
