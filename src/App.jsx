import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Store } from './context/StoreContext';
import { initialProducts, initialReviews } from './data';
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

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [products, setProducts] = useState(() => {
    const savedProducts = load('yc_products', null);

    if (!savedProducts) {
      return initialProducts;
    }

    return savedProducts.map(product => {
      const initialProduct = initialProducts.find(
        item => item.id === product.id
      );

      if (!initialProduct) {
        return product;
      }

      return {
        ...initialProduct,
        ...product,
        name: initialProduct.name,
        image: initialProduct.image,
        description: initialProduct.description
      };
    });
  });
  const [users, setUsers] = useState(() => load('yc_users', [{ id: 1, name: 'Demo Admin', email: 'admin@yescloth.com', password: 'admin123', role: 'admin' }, { id: 2, name: 'Demo Member', email: 'member@yescloth.com', password: 'member123', role: 'member' }]));
  const [user, setUser] = useState(() => load('yc_user', null));
  const [cart, setCart] = useState(() => load('yc_cart', []));
  const [favorites, setFavorites] = useState(() => load('yc_favorites', []));
  const [orders, setOrders] = useState(() => load('yc_orders', []));
  const [reviews, setReviews] = useState(() => load('yc_reviews', initialReviews));
  const [notice, setNotice] = useState('');
  useEffect(() => { localStorage.setItem('yc_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('yc_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('yc_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('yc_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('yc_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('yc_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('yc_reviews', JSON.stringify(reviews)); }, [reviews]);
  const flash = message => { setNotice(message); window.clearTimeout(window.__ycTimer); window.__ycTimer = window.setTimeout(() => setNotice(''), 2600); };
  const value = { products, setProducts, users, setUsers, user, setUser, cart, setCart, favorites, setFavorites, orders, setOrders, reviews, setReviews, flash };
  return <Store.Provider value={value}><div className="app-shell"><Header/><main><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/shop" element={<Shop/>}/>
    <Route path="/product/:id" element={<ProductDetail/>}/>
    <Route path="/login" element={<Auth mode="login"/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/wishlist" element={<Wishlist/>}/>
    <Route path="/cart" element={<Cart/>}/>
    <Route path="/checkout" element={<Checkout/>}/>
    <Route path="/success/:id" element={<Success/>}/>
    <Route path="/account" element={<Account/>}/>
    <Route path="/admin" element={<Admin/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></main><Footer/>
  {notice && <div className="toast">{notice}</div>}</div>
</Store.Provider>;
}
export default App;
