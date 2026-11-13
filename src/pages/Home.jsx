import React from 'react';
import { Link } from 'react-router-dom';
function Home() {
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
      <div className="category-grid">{[{ name: 'TOPS', img: 'https://images.unsplash.com/photo-1789110520769-c18355b70c63?auto=format&fit=crop&fm=jpg&q=60&w=900', cat: 'Tops' },
      { name: 'BOTTOMS', img: 'https://images.unsplash.com/photo-1789110520732-77b1e55c32ea?auto=format&fit=crop&fm=jpg&q=80&w=900', cat: 'Bottoms' },
      { name: 'DRESSES', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', cat: 'Dresses' },
      { name: 'ACCESSORIES', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', cat: 'Accessories' }].map(c =>
        <Link to={`/shop?category=${c.cat}`} className="category-tile" key={c.cat}>
          <img src={c.img} alt={c.name} />
          <span>{c.name} <b>↗</b></span>
        </Link>)}
      </div>
    </section>
    <section className="statement">
      <h2>Good clothes.<br /><em>Good mood.</em></h2>
      <Link className="btn outline" to="/shop">EXPLORE THE STORE ↗</Link></section>
  </>;
}

export default Home;
