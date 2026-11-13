import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
function ProductCard({ product }) {
  const { user, favorites, setFavorites, flash } = useStore();
  const liked = favorites.includes(product.id);
  const toggle = () => {
    if (!user) return flash('กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด');
    setFavorites(old => liked ? old.filter(id => id !== product.id) : [...old, product.id]);
    flash(liked ? 'นำออกจากรายการโปรดแล้ว' : 'เพิ่มในรายการโปรดแล้ว');
  };
  return <article className="product-card">
    <div className="product-image-wrap"><Link to={`/product/${product.id}`}><img src={product.image} alt={product.name} /></Link>
      {product.isNew && <span className="tag">NEW</span>}
      <button className={`heart-btn ${liked ? 'liked' : ''}`} onClick={toggle} aria-label="favorite">{liked ? '♥' : '♡'}</button>
    </div>
    <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
    <div className="product-price">{money(product.price)}</div>
  </article>;
}

export default ProductCard;
