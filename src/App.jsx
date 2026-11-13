import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Store } from './context/StoreContext';
import { initialReviews } from './data';
import { getProducts } from './api/backend';
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
import { getProducts, getFavorites, addFavorite, removeFavorite } from './api/backend';

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState(() => load('yc_users', []));
  const [user, setUser] = useState(() => load('yc_user', null));
  const [cart, setCart] = useState(() => load('yc_cart', []));
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState(() => load('yc_orders', []));
  const [reviews, setReviews] = useState(() => load('yc_reviews', initialReviews));
  const [notice, setNotice] = useState('');

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
    // Optimistically update UI
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
      // Revert if server failed
      setFavorites(old => liked ? [...old, productId] : old.filter(id => id !== productId));
      flash(err.message || 'ไม่สามารถบันทึกรายการโปรดได้');
    }
  };
  
  // Load products from Go backend -> Supabase
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
    localStorage.removeItem('yc_products');
  }, []);

  useEffect(() => { localStorage.setItem('yc_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('yc_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('yc_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('yc_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('yc_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('yc_reviews', JSON.stringify(reviews)); }, [reviews]);

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
          </Routes>
        </main>
        <Footer />
        {notice && <div className="toast">{notice}</div>}
      </div>
    </Store.Provider>
  );
}

export default App;