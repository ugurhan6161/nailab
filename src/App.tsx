import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { FlyAnimationProvider } from './context/FlyAnimationContext';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderCompletePage from './pages/OrderCompletePage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import TrainerPortalLoginPage from './pages/TrainerPortalLoginPage';
import TrainerPortalPage from './pages/TrainerPortalPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <FlyAnimationProvider>
              <BrowserRouter>
                <Routes>
                  {/* 1. Splash / Landing Page */}
                  <Route path="/" element={<HomePage />} />

                  {/* 2. Shop Page */}
                  <Route path="/magaza" element={<ShopPage />} />
                  <Route path="/shop" element={<ShopPage />} />

                  {/* 3. Category Page */}
                  <Route path="/kategori" element={<CategoryPage />} />
                  <Route path="/kategori/:category" element={<CategoryPage />} />
                  <Route path="/category/:category" element={<CategoryPage />} />

                  {/* 4. Product Details */}
                  <Route path="/urun/:id" element={<ProductDetailPage />} />

                  {/* 5. Complete Shopping Cart Flow */}
                  <Route path="/sepet" element={<CartPage />} />
                  <Route path="/odeme" element={<CheckoutPage />} />
                  <Route path="/siparis-tamamlandi/:orderNumber" element={<OrderCompletePage />} />

                  {/* 6. Customer Account & Auth */}
                  <Route path="/giris" element={<AuthPage />} />
                  <Route path="/hesabim" element={<AccountPage />} />
                  <Route path="/siparislerim" element={<OrdersPage />} />

                  {/* 7. Trainer Portal */}
                  <Route path="/egitmen-giris" element={<TrainerPortalLoginPage />} />
                  <Route path="/egitmen-portal" element={<TrainerPortalPage />} />

                  {/* 8. Admin Management */}
                  <Route path="/admin/giris" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/urunler" element={<AdminProductsPage />} />
                  <Route path="/admin/siparisler" element={<AdminOrdersPage />} />

                  {/* Fallback to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </FlyAnimationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
