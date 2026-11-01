ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique
  ON public.products (slug);

UPDATE public.products
SET is_active = false
WHERE slug IS NULL;

DROP POLICY IF EXISTS "public_read_products" ON public.products;
DROP POLICY IF EXISTS "public_read_active_products" ON public.products;
CREATE POLICY "public_read_active_products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admins_read_all_products" ON public.products;
CREATE POLICY "admins_read_all_products" ON public.products
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.website_content (
  id text PRIMARY KEY CHECK (id = 'site'),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_customer_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS create_customer_profile_after_signup ON auth.users;
CREATE TRIGGER create_customer_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_customer_profile();

INSERT INTO public.profiles (id, full_name, role)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data ->> 'full_name', ''),
  'customer'
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.website_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.website_content TO authenticated;

DROP POLICY IF EXISTS "public_read_website_content" ON public.website_content;
CREATE POLICY "public_read_website_content" ON public.website_content
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admins_insert_website_content" ON public.website_content;
CREATE POLICY "admins_insert_website_content" ON public.website_content
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins_update_website_content" ON public.website_content;
CREATE POLICY "admins_update_website_content" ON public.website_content
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins_delete_website_content" ON public.website_content;
CREATE POLICY "admins_delete_website_content" ON public.website_content
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

REVOKE INSERT, SELECT, UPDATE ON public.orders FROM anon;
REVOKE INSERT ON public.orders FROM authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
REVOKE INSERT, SELECT ON public.order_items FROM anon;
REVOKE INSERT ON public.order_items FROM authenticated;
GRANT SELECT ON public.order_items TO authenticated;

DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "insert_order_items" ON public.order_items;

CREATE OR REPLACE FUNCTION public.create_store_order(
  p_guest_name text,
  p_guest_phone text,
  p_shipping_address jsonb,
  p_notes text,
  p_items jsonb,
  p_guest_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  created_order public.orders;
  subtotal_amount numeric(10, 2);
  shipping_amount numeric(10, 2);
  result jsonb;
BEGIN
  IF NULLIF(trim(p_guest_name), '') IS NULL
    OR NULLIF(trim(p_guest_phone), '') IS NULL
    OR p_shipping_address IS NULL
    OR jsonb_typeof(p_shipping_address) IS DISTINCT FROM 'object'
    OR NULLIF(trim(p_shipping_address ->> 'address'), '') IS NULL
    OR NULLIF(trim(p_shipping_address ->> 'city'), '') IS NULL
    OR p_items IS NULL
    OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Sipariş bilgileri eksik veya geçersiz.';
  END IF;

  IF jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'Siparişteki ürün sayısı geçersiz.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_items) AS requested(product_id uuid, quantity integer)
    LEFT JOIN public.products AS product ON product.id = requested.product_id
    WHERE requested.product_id IS NULL
        OR requested.quantity IS NULL
        OR requested.quantity < 1
        OR requested.quantity > 100
        OR product.id IS NULL
        OR product.is_active IS NOT TRUE
  ) THEN
    RAISE EXCEPTION 'Siparişte geçersiz veya satışta olmayan ürün var.';
  END IF;

  SELECT COALESCE(SUM(product.price * requested.quantity), 0)
  INTO subtotal_amount
  FROM jsonb_to_recordset(p_items) AS requested(product_id uuid, quantity integer)
  JOIN public.products AS product ON product.id = requested.product_id;

  shipping_amount := CASE WHEN subtotal_amount >= 1500 THEN 0 ELSE 89 END;

  INSERT INTO public.orders (
    user_id,
    guest_email,
    guest_name,
    guest_phone,
    status,
    subtotal,
    shipping_cost,
    total,
    shipping_address,
    payment_method,
    notes
  )
  VALUES (
    auth.uid(),
    COALESCE(auth.jwt() ->> 'email', NULLIF(trim(p_guest_email), '')),
    trim(p_guest_name),
    trim(p_guest_phone),
    'beklemede',
    subtotal_amount,
    shipping_amount,
    subtotal_amount + shipping_amount,
    p_shipping_address,
    'whatsapp',
    NULLIF(trim(p_notes), '')
  )
  RETURNING * INTO created_order;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    product_image,
    quantity,
    unit_price,
    total_price
  )
  SELECT
    created_order.id,
    product.id,
    product.name,
    product.image_url,
    requested.quantity,
    product.price,
    product.price * requested.quantity
  FROM jsonb_to_recordset(p_items) AS requested(product_id uuid, quantity integer)
  JOIN public.products AS product ON product.id = requested.product_id;

  SELECT to_jsonb(created_order) || jsonb_build_object(
    'order_items',
    COALESCE(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
  )
  INTO result
  FROM public.order_items AS item
  WHERE item.order_id = created_order.id;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.create_store_order(text, text, jsonb, text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_store_order(text, text, jsonb, text, jsonb, text) TO anon, authenticated;
