import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import ProductCard from '../components/ProductCard';
import { Empty, LoginRequired } from '../components/Common';
function Cart() {
  const { user, cart, setCart, products } = useStore(); if (!user) return <LoginRequired />; const lines = cart.map(line => ({ ...line, product: products.find(p => p.id === line.productId) })).filter(x => x.product); const total = lines.reduce((s, x) => s + x.product.price * x.qty, 0);
  const change = (key, qty) => setCart(old => old.map(x => x.key === key ? { ...x, qty } : x).filter(x => x.qty > 0));
  return <section className="container page-section">
    <div className="page-title">
      <span className="eyebrow">YOUR SELECTION</span>
      <h1>Shopping cart</h1></div>{lines.length ? <div className="cart-layout">
        <div className="cart-lines">{lines.map(x => <div className="cart-line" key={x.key}><img src={x.product.image} />
          <div className="cart-line-info">
            <Link to={`/product/${x.product.id}`}><b>{x.product.name}</b></Link>
            <span>Color: {x.color} / Size: {x.size}</span>
            <strong>{money(x.product.price)}</strong>
            <div className="quantity">
              <button onClick={() => change(x.key, x.qty - 1)}>−</button>
              <span>{x.qty}</span><button onClick={() => change(x.key, x.qty + 1)}>+</button></div></div>
          <button className="remove" onClick={() => change(x.key, 0)}>×</button></div>)}</div>
        <aside className="summary"><h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><b>{money(total)}</b></div>
          <div className="summary-row total"><b>Total</b><b>{money(total)}</b></div>
          <Link className="btn dark full" to="/checkout">PROCEED TO CHECKOUT ↗</Link>
          <Link className="back-link" to="/shop">← Continue shopping</Link></aside>
      </div> : <Empty title="ตะกร้ายังว่างอยู่" desc="เลือกไอเทมที่ชอบแล้วกลับมาที่นี่ได้เลย" />}</section>;
}

export default Cart;
