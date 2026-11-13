import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import ProductCard from '../components/ProductCard';
import { Empty, LoginRequired } from '../components/Common';
function Checkout() {
  const {user,cart,setCart,products,setOrders,setProducts,flash}=useStore();
   const nav=useNavigate();
  const [busy,setBusy]=useState(false);
  if(!user)return <LoginRequired/>;
  const lines=cart.map(x=>({...x,product:products.find(p=>p.id===x.productId)})).filter(x=>x.product);
  const total=lines.reduce((s,x)=>s+x.product.price*x.qty,0);
  const place=()=>{if(!lines.length)return; 
    if(lines.some(x=>x.qty>x.product.stock))
      return flash('มีสินค้าบางรายการไม่เพียงพอ');
    setBusy(true);
    const id='YC-'+Date.now().toString().slice(-8);
    const order={id,userId:user.id,customer:user.name,items:lines.map(x=>({name:x.product.name,productId:x.product.id,size:x.size,color:x.color,qty:x.qty,price:x.product.price})),total,status:'Confirmed',date:new Date().toISOString()};setOrders(old=>[order,...old]);setProducts(old=>old.map(p=>{const sold=lines.filter(x=>x.productId===p.id).reduce((a,x)=>a+x.qty,0);return {...p,stock:p.stock-sold};}))
    ;setCart([]);
    nav(`/success/${id}`);
  };
  return <section className="container page-section narrow">
    <div className="page-title">
      <span className="eyebrow">ONE LAST LOOK</span>
      <h1>Confirm your order</h1>
      <p>ตรวจสอบรายการสินค้าก่อนยืนยันคำสั่งซื้อ</p>
      </div>
      {lines.length?<>
      <div className="checkout-list">{lines.map(x=>
        <div className="summary-row" key={x.key}>
          <span>{x.product.name} · {x.color} / {x.size} × {x.qty}</span>
          <b>{money(x.product.price*x.qty)}</b>
          </div>
        )}</div>
          <div className="summary-row total">
            <b>Total</b>
            <b>{money(total)}</b>
            </div>
            <div className="notice-box">
              <b>Order confirmation</b>
              </div>
              <button className="btn dark full" disabled={busy} onClick={place}>{busy?'PROCESSING...':'CONFIRM ORDER ↗'}</button>
              <Link className="back-link" to="/cart">← Back to cart</Link></>:<Empty title="ไม่มีสินค้าให้สั่งซื้อ" desc="กรุณาเลือกสินค้าก่อน"/>}</section>;
}

export default Checkout;
