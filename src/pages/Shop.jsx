import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getCategories } from '../api/backend';
import ProductCard from '../components/ProductCard';
import { Empty } from '../components/Common';

function Shop() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    getCategories()
      .then(list => setCategories(['All', ...list.map(c => c.category_name)]))
      .catch(() => setCategories(['All']));
  }, []);

  const selectCategory = (cat) => {
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const countForCategory = (cat) => {
    if (cat.toLowerCase() === 'all') return products.length;
    return products.filter(
      p => (p.category || '').trim().toLowerCase() === cat.trim().toLowerCase()
    ).length;
  };

  const shown = useMemo(() => {
    const selected = category.trim().toLowerCase();
    const keyword = search.trim().toLowerCase();
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
          {categories.map(c => (
            <button
              type="button"
              key={c}
              className={category.toLowerCase() === c.toLowerCase() ? 'active' : ''}
              onClick={() => selectCategory(c)}
            >
              {c} ({countForCategory(c)})
            </button>
          ))}
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
        Showing {shown.length} {shown.length === 1 ? 'product' : 'products'}
        {category !== 'All' ? ` in ${category}` : ''}
      </p>
      {shown.length ? (
        <div className="product-grid">
          {shown.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Empty title="ไม่พบสินค้า" desc="ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่ใหม่" />
      )}
    </section>
  );
}

export default Shop;