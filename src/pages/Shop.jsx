import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getCategories } from '../api/backend';
import ProductCard from '../components/ProductCard';
import { Empty } from '../components/Common';

function Shop() {
  const { products } = useStore();
  const location = useLocation();
  const [category, setCategory] = useState(
    () => new URLSearchParams(location.search).get('category') || 'All'
  );
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(['All']);

  // Sync category if URL query changes
  useEffect(() => {
    const paramCat = new URLSearchParams(location.search).get('category');
    if (paramCat) {
      setCategory(paramCat);
    }
  }, [location.search]);

  useEffect(() => {
    getCategories()
      .then(list => {
        if (Array.isArray(list)) {
          setCategories(['All', ...list.map(c => c.category_name)]);
        }
      })
      .catch(() => setCategories(['All']));
  }, []);

  const countForCategory = (cat) => {
    if (!Array.isArray(products)) return 0;
    if (cat.toLowerCase() === 'all') return products.length;
    return products.filter(
      p => (p.category || '').trim().toLowerCase() === cat.trim().toLowerCase()
    ).length;
  };

  const shown = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const selected = (category || 'All').trim().toLowerCase();
    const keyword = (search || '').trim().toLowerCase();
    return products.filter(p => {
      const matchCat =
        selected === 'all' ||
        (p.category || '').trim().toLowerCase() === selected;
      const matchSearch =
        !keyword || (p.name || '').toLowerCase().includes(keyword);
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  return (
    <section className="container page-section">
      <div className="page-title">
        <span className="eyebrow">THE COLLECTION</span>
        <h1>{category === 'All' ? 'Shop all' : category}</h1>
      </div>
      <div className="shop-tools">
        <div className="filter-pills">
          {categories.map(c => {
            const isActive = category.toLowerCase() === c.toLowerCase();
            return (
              <button
                type="button"
                key={c}
                className={isActive ? 'active' : ''}
                onClick={() => setCategory(c)}
              >
                <span>{c}</span> <span>({countForCategory(c)})</span>
              </button>
            );
          })}
        </div>
        <div className="shop-controls">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
          />
        </div>
      </div>

      <p className="result-count">
        <span>Showing {shown.length} {shown.length === 1 ? 'product' : 'products'}</span>
        {category !== 'All' && <span> in {category}</span>}
      </p>

      <div key={category} className="shop-content-area">
        {shown.length > 0 ? (
          <div className="product-grid">
            {shown.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <Empty title="ไม่พบสินค้า" desc="ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่ใหม่" />
        )}
      </div>
    </section>
  );
}

export default Shop;