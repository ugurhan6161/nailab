import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { StoreProduct } from '../lib/ecommerceData';
import { supabase } from '../lib/supabase';

type ProductsContextValue = {
  products: StoreProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

function isStoreProduct(value: unknown): value is StoreProduct {
  if (typeof value !== 'object' || value === null) return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === 'string' &&
    typeof product.title === 'string' &&
    typeof product.category === 'string' &&
    typeof product.price === 'number' &&
    Number.isFinite(product.price) &&
    typeof product.image === 'string' &&
    typeof product.description === 'string' &&
    typeof product.rating === 'number' &&
    typeof product.reviews === 'number' &&
    typeof product.stock === 'number' &&
    (product.databaseId === undefined || typeof product.databaseId === 'string') &&
    (product.badge === undefined || typeof product.badge === 'string') &&
    (product.isNew === undefined || typeof product.isNew === 'boolean')
  );
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('products')
          .select('id, slug, name, description, price, image_url, category, badge, stock, rating, review_count, is_active, is_new')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (queryError) throw queryError;
        const mapped = (data ?? []).map((product) => ({
          id: product.slug,
          databaseId: product.id,
          title: product.name,
          category: product.category,
          price: Number(product.price),
          priceFormatted: `${Number(product.price).toLocaleString('tr-TR')} ₺`,
          image: product.image_url ?? '',
          description: product.description ?? '',
          rating: Number(product.rating ?? 0),
          reviews: Number(product.review_count ?? 0),
          stock: Number(product.stock ?? 0),
          ...(product.badge ? { badge: product.badge } : {}),
          ...(product.is_new ? { isNew: true } : {}),
        }));
        if (!mapped.every(isStoreProduct)) throw new Error('Supabase ürün kataloğunda geçersiz ürün verisi var.');
        if (active) setProducts(mapped);
      } catch (fetchError: unknown) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Ürün kataloğu yüklenemedi.');
        setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [refreshVersion]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refresh }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within ProductsProvider');
  return context;
}
