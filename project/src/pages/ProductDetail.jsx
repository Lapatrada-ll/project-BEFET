import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import { NotFound } from '../components/Common';
function ProductDetail() {
  const { id } = useParams(); const { products, cart, setCart, user, favorites, setFavorites, reviews, setReviews, flash } = useStore();
  const p = products.find(x => x.id === Number(id)); const [size, setSize] = useState('M'); const [color, setColor] = useState('White'); const [qty, setQty] = useState(1); const [rating, setRating] = useState(5); const [comment, setComment] = useState('');
  if (!p) return <NotFound />;
  const add = () => { if (!user) return flash('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า'); if (qty > p.stock) return flash('สินค้าในสต็อกไม่เพียงพอ'); const key = `${p.id}-${size}-${color}`; setCart(old => { const found = old.find(x => x.key === key); return found ? old.map(x => x.key === key ? { ...x, qty: x.qty + qty } : x) : [...old, { key, productId: p.id, size, color, qty }]; }); flash('เพิ่มสินค้าลงตะกร้าแล้ว'); };
  const submitReview = e => { e.preventDefault(); if (!user) return flash('กรุณาเข้าสู่ระบบก่อนรีวิว'); if (!comment.trim()) return; setReviews(old => [{ id: Date.now(), productId: p.id, name: user.name, rating, comment }, ...old]); setComment(''); flash('เพิ่มรีวิวเรียบร้อย'); };
  const liked = favorites.includes(p.id);
  return <section className="container detail-layout page-section">
    <div className="detail-photo">
      <img src={p.image} alt={p.name} /></div>
    <div className="detail-info">
      <span className="eyebrow">{p.category.toUpperCase()} / YES, CLOTH</span>
      <h1>{p.name}</h1>
      <div className="detail-price">{money(p.price)}</div>
      <p>{p.description}</p>
      <div className="field">
        <label>COLOR — {color}</label>
        <div className="choice-row">{p.colors.map(c =>
          <button key={c} className={color === c ? 'choice selected' : 'choice'} onClick={() => setColor(c)}>{c}</button>)}</div></div>
      <div className="field"><label>SIZE</label>
        <div className="choice-row">{p.sizes.map(s => <button key={s} className={size === s ? 'size-choice selected' : 'size-choice'} onClick={() => setSize(s)}>{s}</button>)}</div></div>
      <div className="field"><label>QUANTITY</label>
        <div className="quantity"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span>{qty}</span>
          <button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
          <small>{p.stock} in stock</small></div></div>
      <div className="detail-actions">
        <button className="btn dark grow" onClick={add}>ADD TO CART ↗</button>
        <button className={`btn icon-btn ${liked ? 'liked' : ''}`} onClick={() => {
          if (!user) return flash('กรุณาเข้าสู่ระบบก่อน'); setFavorites(old => liked ? old.filter(x => x !== p.id) : [...old, p.id]);
        }}>{liked ? '♥' : '♡'}</button></div>
      <div className="detail-note"><span>SKU: YC-{p.id.toString().padStart(4, '0')}</span></div></div>
    <div className="reviews-block">
      <div className="section-heading">
        <div>
          <h2>Customer reviews</h2>
        </div>
        <span className="rating-stars">★★★★★</span>
      </div>{reviews.filter(r => r.productId === p.id).map(r => <div className="review" key={r.id}><b>{r.name}</b>
        <span className="rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
        <p>{r.comment}</p></div>)}<form className="review-form" onSubmit={submitReview}>
        <h3>Write a review</h3>
        <label>Rating</label><div className="rating-picker" role="group" aria-label="เลือกคะแนน">{[1, 2, 3, 4, 5].map(n =>
          <button type="button" key={n} className={n <= rating ? 'active' : ''} onClick={() => setRating(n)} aria-label={`${n} ดาว`}>★</button>)}</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="แชร์ความคิดเห็นของคุณ..." rows="3" />
        <button className="btn dark" type="submit">SUBMIT REVIEW</button></form></div>
  </section>;
}

export default ProductDetail;
