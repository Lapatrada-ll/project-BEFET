import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { categories } from '../data';
import ProductCard from '../components/ProductCard';
import { Empty } from '../components/Common';
function Shop() {
  const { products } = useStore();
  const params = new URLSearchParams(useLocation().search);
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [search, setSearch] = useState('');
  const shown = useMemo(() => {
    let list = products.filter(p => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, category, search]);
  return <section className="container page-section"><div className="page-title"><span className="eyebrow">THE COLLECTION</span><h1>Shop all</h1></div>
    <div className="shop-tools">
      <div className="filter-pills">{categories.map(c => 
        <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <div className="shop-controls">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาสินค้า..." /></div>
        </div>
    <p className="result-count">{shown.length} products</p>
    {shown.length ? <div className="product-grid">{shown.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="ไม่พบสินค้า" desc="ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่ใหม่" />}
  </section>;
}

export default Shop;
