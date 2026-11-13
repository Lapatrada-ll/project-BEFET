import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.8 20c.5-3.6 3.3-5.7 7.2-5.7s6.7 2.1 7.2 5.7"/></svg>;
}
function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.7Z"/></svg>;
}
function BasketIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 2 11h14l2-11H3Z"/><path d="m8 9 4-6 4 6M9 12v5m6-5v5"/></svg>;
}

function Header() {
  const { user, cart, favorites, setUser, flash } = useStore();
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const logout = () => { setUser(null); flash('ออกจากระบบแล้ว'); navigate('/'); };
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  return <header className="site-header">
    <div className="topbar">
      <button className="hamburger" onClick={() => setMenu(!menu)} aria-label="เปิดเมนู">☰</button>
      <Link to="/" className="logo">YES, CLOTH<span>.</span></Link>
      <nav className={menu ? 'main-nav open' : 'main-nav'}>
        <NavLink to="/" onClick={() => setMenu(false)}>HOME</NavLink>
        <NavLink to="/shop" onClick={() => setMenu(false)}>SHOP</NavLink>
      </nav>
      <div className="header-actions">
        {!user ? (
          <Link className="login-link" to="/login">เข้าสู่ระบบ</Link>
        ) : (
          <>
            <Link className="header-icon-link" to="/account" title="บัญชีของฉัน" aria-label="บัญชีของฉัน"><UserIcon /></Link>
            {user.role === 'member' && <>
              <Link className="header-icon-link" to="/wishlist" title="รายการโปรด" aria-label="รายการโปรด"><HeartIcon /><i>{favorites.length || ''}</i></Link>
              <Link className="header-icon-link" to="/cart" title="ตะกร้าสินค้า" aria-label="ตะกร้าสินค้า"><BasketIcon /><i>{cartCount || ''}</i></Link>
            </>}
            {user.role === 'admin' && <Link className="admin-nav-link" to="/admin">หลังบ้าน</Link>}
            <button className="logout-mini" onClick={logout}>ออกจากระบบ</button>
          </>
        )}
      </div>
    </div>
  </header>;
}

export default Header;
