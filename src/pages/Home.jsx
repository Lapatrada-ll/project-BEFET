import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/backend';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80';

function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return <>
    <section className="hero">
      <div className="hero-copy">
        <h1>Dress your<br /><em>way.</em></h1>
        <p>เสื้อผ้าที่ใช่ สำหรับทุกวันในแบบของคุณ</p>
        <Link className="btn dark" to="/shop">SHOP COLLECTION <span>↗</span></Link>
      </div>
      <div className="hero-photo"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1300&q=85" onError={e => e.currentTarget.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1300&q=85'} alt="Fashion collection" /></div>
      <div className="hero-side">LESS, BUT BETTER. &nbsp; / &nbsp; YES, CLOTH.</div>
    </section>
    <section className="section container">
      <div className="section-heading"><div>
        <span className="eyebrow">FIND YOUR STYLE</span>
        <h2>Shop by category</h2>
      </div>
        <Link className="text-link" to="/shop">VIEW ALL ↗</Link>
      </div>
      {loading ? <p>Loading...</p> :
        <div className="category-grid">{categories.map(c =>
          <Link to={`/shop?category=${encodeURIComponent(c.category_name)}`} className="category-tile" key={c.category_id}>
            <img src={c.image_url || FALLBACK_IMG} alt={c.category_name} />
            <span>{c.category_name.toUpperCase()} <b>↗</b></span>
          </Link>)}
        </div>}
    </section>
    <section className="statement">
      <h2>Good clothes.<br /><em>Good mood.</em></h2>
      <Link className="btn outline" to="/shop">EXPLORE THE STORE ↗</Link></section>
  </>;
}

export default Home;