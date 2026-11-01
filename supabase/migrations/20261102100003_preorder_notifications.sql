ALTER TABLE public.orders
  ALTER COLUMN order_number
  SET DEFAULT 'NL-' || upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 20));

UPDATE public.website_content
SET data = jsonb_set(
  data,
  '{copy}',
  COALESCE(data -> 'copy', '{}'::jsonb)
    - 'src/pages/CheckoutPage.tsx#whatsapp-item'
    - 'src/pages/CheckoutPage.tsx#whatsapp-message'
    - 'src/pages/CheckoutPage.tsx#submitting'
    - 'src/pages/CheckoutPage.tsx#submit',
  true
)
WHERE id = 'site';

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
    'preorder',
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
