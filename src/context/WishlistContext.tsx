import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { STORE_PRODUCTS, type StoreProduct } from '../lib/ecommerceData';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistProducts: StoreProduct[];
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecom_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Only keep valid existing store product IDs
          return parsed.filter((id) => STORE_PRODUCTS.some((p) => p.id === id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ecom_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const wishlistProducts = STORE_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, toggleWishlist, isWishlisted, wishlistProducts }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
