import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getCategories } from '../api/backend';
import ProductCard from '../components/ProductCard';
import { Empty } from '../components/Common';

function Shop() {
  const { products } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Read category directly from URL query param (?category=...)
  const queryParam = new URLSearchParams(location.search).get('category');
  const currentCategory = queryParam || 'All';

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    getCategories()
      .then(list => {
        if (Array.isArray(list)) {
          setCategories(['All', ...list.map(c => c.category_name)]);
        }
      })
      .catch(() => setCategories(['All']));
  }, []);

  const handleSelectCategory = (cat) => {
    if (cat.toLowerCase() === 'all') {
      navigate('/shop', { replace: true });
    } else {
      navigate(`/shop?category=${encodeURIComponent(cat)}`, { replace: true });
    }
  };

  const countForCategory = (cat) => {
    if (!Array.isArray(products)) return 0;
    if (cat.toLowerCase() === 'all') return products.length;
    return products.filter(
      p => (p.category || '').trim().toLowerCase() === cat.trim().toLowerCase()
    ).length;
  };

  const shown = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const selected = currentCategory.trim().toLowerCase();
    const keyword = search.trim().toLowerCase();
    return products.filter(p => {
      const matchCat =
        selected === 'all' ||
        (p.category || '').trim().toLowerCase() === selected;
      const matchSearch =
        !keyword || (p.name || '').toLowerCase().includes(keyword);
      return matchCat && matchSearch;
    });
  }, [products, currentCategory, search]);

  return (
    <section className="container page-section">
      <div className="page-title">
        <span className="eyebrow">THE COLLECTION</span>
        <h1>{currentCategory === 'All' ? 'Shop all' : currentCategory}</h1>
      </div>
      <div className="shop-tools">
        <div className="filter-pills">
          {categories.map(c => {
            const isActive = currentCategory.toLowerCase() === c.toLowerCase();
            return (
              <button
                type="button"
                key={c}
                className={isActive ? 'active' : ''}
                onClick={() => handleSelectCategory(c)}
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
        {currentCategory.toLowerCase() !== 'all' && <span> in {currentCategory}</span>}
      </p>

      <div key={currentCategory} className="shop-content-area">
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