/*
# Secure WhatsApp commerce permissions

1. Purpose
- Keep the public storefront readable while limiting product and order management to administrators.
- Preserve guest checkout by allowing anonymous order creation.
- Replace anonymous direct order reads with a narrow public lookup function used by order tracking.

2. Modified tables
- `profiles`: customers may update their own contact fields, but cannot write the `role` field.
- `products`: public users can read active products; only administrators can insert, update, or delete products.
- `orders`: customers can read their own orders; administrators can read and update all orders; anonymous users can create orders but cannot browse order rows.
- `order_items`: customers and administrators can read only items attached to an order they may read; anonymous users can create items for guest checkout.

3. Security
- Admin policies verify `profiles.role = 'admin'` for privileged product and order actions.
- Profile insert/update privileges are column-limited so a browser cannot promote itself.
- `get_public_order` is the only anonymous order lookup and accepts a single order number.
- Function execution is explicitly granted only to `anon` and `authenticated` because it is the intended public tracking entry point.

4. Notes
- No existing rows are deleted or rewritten.
- The existing sign-up flow must rely on the database default role of `customer`.
*/

REVOKE INSERT, UPDATE ON profiles FROM authenticated;
GRANT INSERT (id, full_name, phone, address) ON profiles TO authenticated;
GRANT UPDATE (full_name, phone, address) ON profiles TO authenticated;

DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id AND role = 'customer');

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "authenticated_manage_products" ON products;
DROP POLICY IF EXISTS "authenticated_update_products" ON products;
DROP POLICY IF EXISTS "authenticated_delete_products" ON products;

CREATE POLICY "admins_insert_products" ON products FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "admins_update_products" ON products FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "admins_delete_products" ON products FOR DELETE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "anon_read_by_order_number" ON orders;
DROP POLICY IF EXISTS "authenticated_update_orders" ON orders;
CREATE POLICY "admins_read_all_orders" ON orders FOR SELECT
TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "admins_update_orders" ON orders FOR UPDATE
TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_allowed_order_items" ON order_items FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')))
);

CREATE INDEX IF NOT EXISTS orders_order_number_lower_idx ON orders (lower(order_number));

CREATE OR REPLACE FUNCTION public.get_public_order(p_order_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'subtotal', o.subtotal,
    'shipping_cost', o.shipping_cost,
    'total', o.total,
    'payment_method', o.payment_method,
    'created_at', o.created_at,
    'order_items', COALESCE((SELECT jsonb_agg(to_jsonb(oi)) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb)
  )
  INTO result
  FROM orders o
  WHERE lower(o.order_number) = lower(trim(p_order_number));

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_order(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_order(text) TO anon, authenticated;
