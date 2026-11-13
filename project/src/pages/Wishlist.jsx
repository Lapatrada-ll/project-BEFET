import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import ProductCard from '../components/ProductCard';
import { Empty, LoginRequired } from '../components/Common';
function Wishlist() {
  const {user,favorites,products}=useStore(); if(!user)return <LoginRequired/>; const items=products.filter(p=>favorites.includes(p.id));
  return <section className="container page-section"><div className="page-title"><span className="eyebrow">SAVED FOR LATER</span><h1>My wishlist ♡</h1></div>{items.length?<div className="product-grid">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<Empty title="ยังไม่มีรายการโปรด" desc="กดหัวใจบนสินค้าที่ชอบเพื่อบันทึกไว้"/>}</section>;
}

export default Wishlist;
