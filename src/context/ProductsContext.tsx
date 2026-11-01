import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { StoreProduct } from '../lib/ecommerceData';

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
    typeof product.priceFormatted === 'string' &&
    typeof product.image === 'string' &&
    typeof product.description === 'string' &&
    typeof product.rating === 'number' &&
    typeof product.reviews === 'number' &&
    typeof product.stock === 'number' &&
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
    const controller = new AbortController();

    fetch('/api/products', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const contentType = response.headers.get('content-type') ?? '';
        const responseText = await response.text();
        let body: unknown;
        if (contentType.includes('application/json')) {
          try {
            body = JSON.parse(responseText);
          } catch {
            throw new Error('Ürün kataloğu API yanıtı geçerli JSON değil.');
          }
        } else {
          const detail = responseText.trim();
          throw new Error(
            detail
              ? `Ürün API hatası (${response.status}): ${detail.slice(0, 240)}`
              : `Ürün API hatası (${response.status}); Vercel Function loglarını kontrol edin.`
          );
        }
        if (!response.ok) {
          const message =
            typeof body === 'object' &&
            body !== null &&
            'error' in body &&
            typeof body.error === 'string'
              ? body.error
              : 'Ürün kataloğu yüklenemedi.';
          throw new Error(message);
        }
        if (
          typeof body !== 'object' ||
          body === null ||
          !('products' in body) ||
          !Array.isArray(body.products) ||
          !body.products.every(isStoreProduct)
        ) {
          throw new Error('Ürün kataloğu beklenen biçimde değil veya geçersiz ürün içeriyor.');
        }
        setProducts(body.products);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Ürün kataloğu yüklenemedi.');
        setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
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
