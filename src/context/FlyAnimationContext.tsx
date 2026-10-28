import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

type FlyingItem = {
  id: number;
  type: 'heart' | 'product';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  image?: string;
};

type FlyAnimationContextType = {
  registerWishlistTarget: (el: HTMLElement | null) => void;
  registerCartTarget: (el: HTMLElement | null) => void;
  flyToWishlist: (sourceEl: HTMLElement) => void;
  flyToCart: (sourceEl: HTMLElement, imageUrl?: string) => void;
  isWishlistPopping: boolean;
  isCartPopping: boolean;
};

const FlyAnimationContext = createContext<FlyAnimationContextType | null>(null);

export function useFlyAnimation() {
  const ctx = useContext(FlyAnimationContext);
  if (!ctx) {
    throw new Error('useFlyAnimation must be used within FlyAnimationProvider');
  }
  return ctx;
}

export function FlyAnimationProvider({ children }: { children: React.ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isWishlistPopping, setIsWishlistPopping] = useState(false);
  const [isCartPopping, setIsCartPopping] = useState(false);

  const wishlistTargetRef = useRef<HTMLElement | null>(null);
  const cartTargetRef = useRef<HTMLElement | null>(null);
  const nextIdRef = useRef(1);

  const registerWishlistTarget = useCallback((el: HTMLElement | null) => {
    wishlistTargetRef.current = el;
  }, []);

  const registerCartTarget = useCallback((el: HTMLElement | null) => {
    cartTargetRef.current = el;
  }, []);

  const flyToWishlist = useCallback((sourceEl: HTMLElement) => {
    const target = wishlistTargetRef.current;
    if (!target) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const id = nextIdRef.current++;
    setFlyingItems((prev) => [
      ...prev,
      { id, type: 'heart', startX, startY, endX, endY },
    ]);

    // Trigger pop at target when arrival completes
    setTimeout(() => {
      setIsWishlistPopping(true);
      setTimeout(() => setIsWishlistPopping(false), 450);
    }, 650);

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  }, []);

  const flyToCart = useCallback((sourceEl: HTMLElement, imageUrl?: string) => {
    const target = cartTargetRef.current;
    if (!target) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const id = nextIdRef.current++;
    setFlyingItems((prev) => [
      ...prev,
      { id, type: 'product', startX, startY, endX, endY, image: imageUrl },
    ]);

    // Trigger pop at target when arrival completes
    setTimeout(() => {
      setIsCartPopping(true);
      setTimeout(() => setIsCartPopping(false), 450);
    }, 650);

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  }, []);

  return (
    <FlyAnimationContext.Provider
      value={{
        registerWishlistTarget,
        registerCartTarget,
        flyToWishlist,
        flyToCart,
        isWishlistPopping,
        isCartPopping,
      }}
    >
      {children}

      {/* Portal overlay for flying items */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          overflow: 'hidden',
        }}
      >
        {flyingItems.map((item) => (
          <FlyingNode key={item.id} item={item} />
        ))}
      </Box>
    </FlyAnimationContext.Provider>
  );
}

function FlyingNode({ item }: { item: FlyingItem }) {
  const [active, setActive] = useState(false);

  React.useEffect(() => {
    // Start animation on next tick
    const r = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const deltaX = item.endX - item.startX;
  const deltaY = item.endY - item.startY;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: item.startX,
        top: item.startY,
        transform: active
          ? `translate(${deltaX}px, ${deltaY}px) scale(${item.type === 'heart' ? 0.4 : 0.3})`
          : 'translate(-50%, -50%) scale(1.3)',
        opacity: active ? 0.15 : 1,
        transition: 'transform 0.72s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.72s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {item.type === 'heart' ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 59, 48, 0.2)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 0 16px rgba(255, 59, 48, 0.8)',
          }}
        >
          <FavoriteIcon sx={{ color: '#FF3B30', fontSize: 26 }} />
        </Box>
      ) : (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #FFFFFF',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(208, 177, 152, 0.8)',
            bgcolor: '#000000',
          }}
        >
          <Box
            component="img"
            src={item.image || '/assets/naillabs/logo.png'}
            alt="product"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}
    </Box>
  );
}
