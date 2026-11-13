import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import ProductCard from '../components/ProductCard';
import { Empty, LoginRequired } from '../components/Common';
function Account() {
  const {user,orders,setUser,flash}=useStore(); const nav=useNavigate(); if(!user)return <LoginRequired/>; const mine=orders.filter(o=>o.userId===user.id);
  return <section className="container page-section"><div className="page-title"><span className="eyebrow">YOUR SPACE</span><h1>My account</h1></div><div className="account-layout"><aside className="account-card"><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><h3>{user.name}</h3><p>{user.email}</p><Link to="/wishlist">♡ My wishlist</Link><button onClick={()=>{setUser(null);flash('ออกจากระบบแล้ว');nav('/');}}>Log out</button></aside>{user.role !== 'admin' && <div className="account-orders"><h2>Order history</h2>{mine.length?mine.map(o=><div className="order-card" key={o.id}><div className="summary-row"><b>{o.id}</b><span className="status confirmed">{o.status}</span></div><p>{new Date(o.date).toLocaleString('th-TH')} · {o.items.length} รายการ</p><div className="summary-row"><span>Total</span><b>{money(o.total)}</b></div></div>):<Empty title="ยังไม่มีประวัติคำสั่งซื้อ" desc="คำสั่งซื้อของคุณจะแสดงที่นี่"/>}</div>}</div></section>;
}

export default Account;
