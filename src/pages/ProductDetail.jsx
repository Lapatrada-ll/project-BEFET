import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import { NotFound } from '../components/Common';
import { createReview, addToCart } from '../api/backend';

function ProductDetail() {
  const { id } = useParams();
  const {
    products,
    cart,
    setCart,
    user,
    favorites,
    toggleFavorite,
    reviews,
    setReviews,
    flash,
  } = useStore();

  const p = (products || []).find(x => x.id === Number(id));

  const [color, setColor] = useState(() => p?.colors?.[0] || 'White');
  const [size, setSize] = useState(() => p?.sizes?.[0] || 'M');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!p) return <NotFound />;

  // Helper: Find variant for a specific size & color
  const getVariant = (s, c) => {
    return (p.variants || []).find(
      v =>
        (v.size || '').toLowerCase() === (s || '').toLowerCase() &&
        (v.color || '').toLowerCase() === (c || '').toLowerCase()
    );
  };

  // Stock for the currently selected Color & Size
  const currentVariant = getVariant(size, color);
  const variantStock = currentVariant ? currentVariant.stock_quantity : (p.stock || 0);

  const add = async () => {
    if (!user) return flash('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
    if (variantStock <= 0) return flash('สินค้ารายการนี้หมดสต็อกแล้ว');
    if (qty > variantStock) return flash('สินค้าในสต็อกไม่เพียงพอ');

    const variantId = currentVariant?.variant_id || (p.variants?.[0]?.variant_id ?? p.id);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await addToCart(variantId, qty, token);
      } catch (err) {
        console.error('Failed to sync cart to server:', err);
      }
    }

    const key = `${p.id}-${size}-${color}`;
    setCart(old => {
      const found = old.find(x => x.key === key);
      return found
        ? old.map(x => (x.key === key ? { ...x, qty: x.qty + qty } : x))
        : [...old, { key, productId: p.id, variant_id: variantId, size, color, qty }];
    });
    flash('เพิ่มสินค้าลงตะกร้าแล้ว');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!user || !token) return flash('กรุณาเข้าสู่ระบบก่อนรีวิว');
    if (!comment.trim()) return;
    try {
      const saved = await createReview(p.id, rating, comment, token);
      setReviews(old => [saved, ...old]);
      setComment('');
      flash('เพิ่มรีวิวเรียบร้อย');
    } catch (err) {
      flash(err.message || 'ไม่สามารถส่งรีวิวได้');
    }
  };

  const liked = (favorites || []).includes(p.id);

  return (
    <section className="container detail-layout page-section">
      <div className="detail-photo">
        <img src={p.image} alt={p.name} />
      </div>
      <div className="detail-info">
        <span className="eyebrow">{p.category?.toUpperCase()} / YES, CLOTH</span>
        <h1>{p.name}</h1>
        <div className="detail-price">{money(p.price)}</div>
        <p>{p.description}</p>

        {/* Color Selection */}
        <div className="field">
          <label>COLOR — {color}</label>
          <div className="choice-row">
            {(p.colors || []).map(c => (
              <button
                key={c}
                type="button"
                className={color === c ? 'choice selected' : 'choice'}
                onClick={() => setColor(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection with Out-of-Stock Disabled & Transparency */}
        <div className="field">
          <label>SIZE — {size}</label>
          <div className="choice-row">
            {(p.sizes || []).map(s => {
              const v = getVariant(s, color);
              const isOutOfStock = v ? v.stock_quantity <= 0 : false;
              const isSelected = size === s;

              return (
                <button
                  key={s}
                  type="button"
                  disabled={isOutOfStock}
                  className={`size-choice ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (!isOutOfStock) {
                      setSize(s);
                      setQty(1);
                    }
                  }}
                  style={{
                    opacity: isOutOfStock ? 0.35 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    textDecoration: isOutOfStock ? 'line-through' : 'none',
                    position: 'relative',
                  }}
                  title={isOutOfStock ? `${s} (หมด)` : `${s} (${v?.stock_quantity ?? p.stock} ชิ้น)`}
                >
                  {s} {isOutOfStock ? '(หมด)' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="field">
          <label>QUANTITY</label>
          <div className="quantity">
            <button
              type="button"
              disabled={variantStock <= 0}
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>
            <span>{variantStock > 0 ? qty : 0}</span>
            <button
              type="button"
              disabled={variantStock <= 0 || qty >= variantStock}
              onClick={() => setQty(Math.min(variantStock, qty + 1))}
            >
              +
            </button>
            <small style={{ color: variantStock <= 0 ? '#b33' : '#888' }}>
              {variantStock > 0 ? `${variantStock} in stock (${color} / ${size})` : 'สินค้าหมด'}
            </small>
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="btn dark grow"
            disabled={variantStock <= 0}
            onClick={add}
            style={{
              opacity: variantStock <= 0 ? 0.5 : 1,
              cursor: variantStock <= 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {variantStock > 0 ? 'ADD TO CART ↗' : 'OUT OF STOCK'}
          </button>
          <button
            type="button"
            className={`btn icon-btn ${liked ? 'liked' : ''}`}
            onClick={() => toggleFavorite(p.id)}
            aria-label="favorite"
          >
            {liked ? '♥' : '♡'}
          </button>
        </div>

        <div className="detail-note">
          <span>SKU: YC-{p.id.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Reviews Block */}
      <div className="reviews-block">
        <div className="section-heading">
          <div>
            <h2>Customer reviews</h2>
          </div>
          <span className="rating-stars">★★★★★</span>
        </div>
        {(reviews || [])
          .filter(r => r.productId === p.id)
          .map(r => (
            <div className="review" key={r.id}>
              <b>{r.name}</b>
              <span className="rating-stars">
                {'★'.repeat(r.rating)}
                {'☆'.repeat(5 - r.rating)}
              </span>
              <p>{r.comment}</p>
            </div>
          ))}
        <form className="review-form" onSubmit={submitReview}>
          <h3>Write a review</h3>
          <label>Rating</label>
          <div className="rating-picker" role="group" aria-label="เลือกคะแนน">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                type="button"
                key={n}
                className={n <= rating ? 'active' : ''}
                onClick={() => setRating(n)}
                aria-label={`${n} ดาว`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="แชร์ความคิดเห็นของคุณ..."
            rows="3"
          />
          <button className="btn dark" type="submit">
            SUBMIT REVIEW
          </button>
        </form>
      </div>
    </section>
  );
}

export default ProductDetail;