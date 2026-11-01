import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../lib/supabase';
import { toAppProduct } from '../lib/ecommerceData';
import { useProducts } from './ProductsContext';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  total: number;
  subtotal: number;
  shippingCost: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_COST = 89;

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [savedItems, setSavedItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nailab_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const items = useMemo(() => {
    if (productsLoading || productsError) return savedItems;
    const currentProducts = new Map(products.flatMap((product) => [
      [product.databaseId ?? product.id, product],
      [product.id, product],
    ]));
    return savedItems.flatMap((item) => {
      const currentProduct = currentProducts.get(item.product.id);
      return currentProduct ? [{ ...item, product: toAppProduct(currentProduct) }] : [];
    });
  }, [products, productsError, productsLoading, savedItems]);

  useEffect(() => {
    localStorage.setItem('nailab_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setSavedItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setSavedItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setSavedItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setSavedItems([]);

  const isInCart = (productId: string) => items.some(i => i.product.id === productId);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart, isInCart,
      total, subtotal, shippingCost, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
