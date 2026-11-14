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

  // Initial category from URL or default to 'All'
  const urlCategory = new URLSearchParams(location.search).get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(['All']);

  // Sync if user navigated from another page (like Home page banner click)
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('category') || 'All';
    setSelectedCategory(fromUrl);
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

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
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
    const activeCat = selectedCategory.trim().toLowerCase();
    const keyword = search.trim().toLowerCase();
    return products.filter(p => {
      const matchCat =
        activeCat === 'all' ||
        (p.category || '').trim().toLowerCase() === activeCat;
      const matchSearch =
        !keyword || (p.name || '').toLowerCase().includes(keyword);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <section className="container page-section">
      <div className="page-title">
        <span className="eyebrow">THE COLLECTION</span>
        <h1>{selectedCategory === 'All' ? 'Shop all' : selectedCategory}</h1>
      </div>
      <div className="shop-tools">
        <div className="filter-pills">
          {categories.map(c => {
            const isActive = selectedCategory.toLowerCase() === c.toLowerCase();
            return (
              <button
                type="button"
                key={c}
                className={isActive ? 'active' : ''}
                onClick={() => handleSelectCategory(c)}
              >
                <span>{c}</span> <span translate="no">({countForCategory(c)})</span>
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

      <p className="result-count" key={`${selectedCategory}-${shown.length}`} translate="no">
        Showing {shown.length} {shown.length === 1 ? 'product' : 'products'}
        {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
      </p>

      <div key={selectedCategory} className="shop-content-area">
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