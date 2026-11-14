import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import { getMyOrders } from '../api/backend';
import { Empty, LoginRequired } from '../components/Common';

function Account() {
  const { user, orders, setUser, flash } = useStore();
  const nav = useNavigate();
  const [myOrders, setMyOrders] = useState([]);

  // Fetch real order history from database when logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMyOrders(token)
        .then(res => {
          if (Array.isArray(res)) setMyOrders(res);
        })
        .catch(() => {});
    }
  }, []);

  if (!user) return <LoginRequired />;

  // Display orders from DB or fallback to store orders
  const displayOrders =
    myOrders.length > 0
      ? myOrders
      : (orders || []).filter(o => o.userId === user.id || o.customer === user.name);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    flash('ออกจากระบบแล้ว');
    nav('/');
  };

  return (
    <section className="container page-section">
      <div className="page-title">
        <span className="eyebrow">YOUR SPACE</span>
        <h1>My account</h1>
      </div>
      <div className="account-layout">
        <aside className="account-card">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className="admin-role" style={{ display: 'inline-block', marginBottom: '15px' }}>
            {user.role}
          </span>
          <Link to="/wishlist">♡ My wishlist</Link>
          <Link to="/cart">🛍 My cart</Link>
          <button onClick={handleLogout}>Log out</button>
        </aside>

        <div className="account-orders">
          <h2>Order history ({displayOrders.length})</h2>
          {displayOrders.length > 0 ? (
            displayOrders.map(o => (
              <div className="order-card" key={o.id}>
                <div className="summary-row">
                  <b>Order #{o.id}</b>
                  <span className="status confirmed">{o.status || 'Confirmed'}</span>
                </div>
                <p>
                  {new Date(o.date).toLocaleString('th-TH')} · {(o.items || []).length} รายการ
                </p>

                {/* Show items purchased */}
                {Array.isArray(o.items) && o.items.length > 0 && (
                  <div style={{ padding: '8px 0', borderTop: '1px dashed #eee', marginBottom: '8px' }}>
                    {o.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '11px',
                          color: '#666',
                          display: 'flex',
                          justifyContent: 'space-between',
                          margin: '4px 0',
                        }}
                      >
                        <span>
                          {item.name} ({item.color}/{item.size}) × {item.qty}
                        </span>
                        <span>{money(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="summary-row">
                  <span>Total</span>
                  <b>{money(o.total)}</b>
                </div>
              </div>
            ))
          ) : (
            <Empty
              title="ยังไม่มีประวัติคำสั่งซื้อ"
              desc="คำสั่งซื้อของคุณจะแสดงที่นี่หลังจากทำการสั่งซื้อ"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default Account;