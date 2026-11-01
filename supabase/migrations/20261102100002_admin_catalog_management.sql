CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_categories_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.product_categories TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_product_categories" ON public.product_categories;
CREATE POLICY "public_read_product_categories" ON public.product_categories
  FOR SELECT TO anon, authenticated
  USING (true);

INSERT INTO public.product_categories (slug, title, description, image_url, is_featured, sort_order)
VALUES
  ('kits', 'Eğitim Kitleri', 'Patentli anatomik büyütülmüş eğitim parmağı ve 4 formlu modüler sistem.', '/assets/naillabs/screen.png', true, 2),
  ('bits', 'Freze Uçları', 'Clinical grade elektro-kaplamalı elmas ve karbid Rus manikür uçları.', '/assets/naillabs/screen-1.png', true, 1),
  ('forms', 'Tırnak Formları', 'Doğal Kare, Badem, Kemerli C-Curve ve Oval klinik polimer yataklar.', '/assets/naillabs/screen.png', true, 3),
  ('accessories', 'Ekipmanlar', 'Ağır paslanmaz çelik manyetik tablalar, cerrahi pensler ve iticiler.', '/assets/naillabs/screen-2.png', true, 4),
  ('care', 'Bakım & Jel', 'Organik kütikül yağları, protez tırnak bazı ve klinikal solüsyonlar.', '/assets/ecommerce/beauty-1.jpg', false, 6),
  ('academy', 'Akademi', 'Sertifikalı eğitmen eğitimi, Rus manikürü ve protez tırnak masterclass.', '/assets/ecommerce/background.jpg', true, 5)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION public.save_product_category(
  p_id uuid,
  p_slug text,
  p_title text,
  p_description text,
  p_image_url text,
  p_is_featured boolean,
  p_sort_order integer
)
RETURNS public.product_categories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  saved_category public.product_categories;
  old_slug text;
  clean_slug text := lower(trim(p_slug));
  clean_title text := trim(p_title);
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Bu işlem için yönetici yetkisi gerekir.';
  END IF;

  IF p_title IS NULL OR clean_title = '' OR p_slug IS NULL
    OR clean_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR p_image_url IS NULL OR trim(p_image_url) = '' THEN
    RAISE EXCEPTION 'Kategori adı, geçerli URL uyumlu slug ve görsel zorunludur.';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.product_categories
      (slug, title, description, image_url, is_featured, sort_order)
    VALUES
      (clean_slug, clean_title, COALESCE(trim(p_description), ''), trim(p_image_url),
       COALESCE(p_is_featured, false), COALESCE(p_sort_order, 0))
    RETURNING * INTO saved_category;
  ELSE
    SELECT slug INTO old_slug
    FROM public.product_categories
    WHERE id = p_id
    FOR UPDATE;

    IF old_slug IS NULL THEN
      RAISE EXCEPTION 'Kategori bulunamadı.';
    END IF;

    IF old_slug <> clean_slug THEN
      UPDATE public.products SET category = clean_slug WHERE category = old_slug;
    END IF;

    UPDATE public.product_categories
    SET slug = clean_slug,
        title = clean_title,
        description = COALESCE(trim(p_description), ''),
        image_url = trim(p_image_url),
        is_featured = COALESCE(p_is_featured, false),
        sort_order = COALESCE(p_sort_order, 0),
        updated_at = now()
    WHERE id = p_id
    RETURNING * INTO saved_category;
  END IF;

  RETURN saved_category;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_product_category(p_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  category_slug text;
  deactivated_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Bu işlem için yönetici yetkisi gerekir.';
  END IF;

  SELECT slug INTO category_slug
  FROM public.product_categories
  WHERE id = p_id
  FOR UPDATE;

  IF category_slug IS NULL THEN
    RAISE EXCEPTION 'Kategori bulunamadı.';
  END IF;

  UPDATE public.products
  SET is_active = false
  WHERE category = category_slug AND is_active = true;
  GET DIAGNOSTICS deactivated_count = ROW_COUNT;

  DELETE FROM public.product_categories WHERE id = p_id;
  RETURN deactivated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.save_product_category(uuid, text, text, text, text, boolean, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product_category(uuid, text, text, text, text, boolean, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.delete_product_category(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_product_category(uuid) TO authenticated;

DROP POLICY IF EXISTS "admins_read_all_academy_courses" ON public.academy_courses;
CREATE POLICY "admins_read_all_academy_courses" ON public.academy_courses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins_insert_academy_courses" ON public.academy_courses;
CREATE POLICY "admins_insert_academy_courses" ON public.academy_courses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins_update_academy_courses" ON public.academy_courses;
CREATE POLICY "admins_update_academy_courses" ON public.academy_courses
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins_delete_academy_courses" ON public.academy_courses;
CREATE POLICY "admins_delete_academy_courses" ON public.academy_courses
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

GRANT INSERT, UPDATE, DELETE ON public.academy_courses TO authenticated;
