import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Store } from './context/StoreContext';
import {
  getProducts,
  getReviews,
  getFavorites,
  addFavorite,
  removeFavorite,
} from './api/backend';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Account from './pages/Account';
import { NotFound } from './components/Common';
import { getCart } from './api/backend';
import ForgotPassword from './pages/ForgotPassword';

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(() => load('yc_user', null));
  
  // Load initial cart specifically for current logged-in user
  const [cart, setCart] = useState(() => {
    const savedUser = load('yc_user', null);
    return savedUser?.id ? load(`yc_cart_${savedUser.id}`, []) : [];
  });

  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState(() => load('yc_orders', []));
  const [reviews, setReviews] = useState([]);
  const [notice, setNotice] = useState('');

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (user?.id && token) {
      getCart(token)
        .then(items => {
          if (Array.isArray(items) && items.length > 0) {
            setCart(items.map(it => ({
              key: `${it.productId}-${it.size}-${it.color}`,
              productId: it.productId,
              variant_id: it.variant_id,
              size: it.size,
              color: it.color,
              qty: it.qty,
            })));
          } else {
            setCart(load(`yc_cart_${user.id}`, []));
          }
        })
        .catch(() => setCart(load(`yc_cart_${user.id}`, [])));
    } else {
      setCart([]);
    }
  }, [user?.id]);
  // Load products & reviews from Go backend -> Supabase
  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
    getReviews().then(setReviews).catch(() => setReviews([]));
    localStorage.removeItem('yc_products');
    localStorage.removeItem('yc_reviews');
    localStorage.removeItem('yc_users');
    localStorage.removeItem('yc_cart'); // Clean up old global cart
  }, []);

  // When user logs in, logs out, or switches accounts -> switch to their specific cart
  useEffect(() => {
    if (user?.id) {
      setCart(load(`yc_cart_${user.id}`, []));
    } else {
      setCart([]);
    }
  }, [user?.id]);

  // Save cart items per member
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`yc_cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user?.id]);

  // Load user's wishlist from database when logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setFavorites([]);
      return;
    }
    getFavorites(token)
      .then(setFavorites)
      .catch(() => setFavorites([]));
    localStorage.removeItem('yc_favorites');
  }, [user]);

  const toggleFavorite = async (productId) => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      flash('กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด');
      return;
    }
    const liked = favorites.includes(productId);
    setFavorites(old => liked ? old.filter(id => id !== productId) : [...old, productId]);
    try {
      if (liked) {
        await removeFavorite(productId, token);
        flash('นำออกจากรายการโปรดแล้ว');
      } else {
        await addFavorite(productId, token);
        flash('เพิ่มในรายการโปรดแล้ว');
      }
    } catch (err) {
      setFavorites(old => liked ? [...old, productId] : old.filter(id => id !== productId));
      flash(err.message || 'ไม่สามารถบันทึกรายการโปรดได้');
    }
  };

  useEffect(() => { localStorage.setItem('yc_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('yc_orders', JSON.stringify(orders)); }, [orders]);

  const flash = message => {
    setNotice(message);
    window.clearTimeout(window.__ycTimer);
    window.__ycTimer = window.setTimeout(() => setNotice(''), 2600);
  };

  const value = {
    products, setProducts,
    users, setUsers,
    user, setUser,
    cart, setCart,
    favorites, setFavorites,
    toggleFavorite,
    orders, setOrders,
    reviews, setReviews,
    flash,
  };

  return (
    <Store.Provider value={value}>
      <div className="app-shell">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success/:id" element={<Success />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </main>
        <Footer />
        {notice && <div className="toast">{notice}</div>}
      </div>
    </Store.Provider>
  );
}

export default App;