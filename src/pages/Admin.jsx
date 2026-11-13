import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { categories, money } from '../data';
import { LoginRequired } from '../components/Common';

const emptyForm = { name: '', category: 'Tops', price: '', stock: '', image: '', description: '' };

function Admin() {
  const { user, products, setProducts, orders, users, reviews, flash } = useStore();
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageError, setImageError] = useState(false);
  const memberCount = users.filter(item => item.role === 'member').length;
  const totalSales = orders.filter(item => item.status !== 'Cancelled').reduce((sum, item) => sum + item.total, 0);
  const title = { overview: 'ภาพรวมร้านค้า', products: 'จัดการสินค้า', categories: 'หมวดหมู่สินค้า', orders: 'คำสั่งซื้อ', users: 'สมาชิก', reviews: 'รีวิวสินค้า' };

  if (user?.role !== 'admin') return <LoginRequired admin />;

  const resetForm = () => { setEditing(null); setForm(emptyForm); setImageError(false); };
  const saveProduct = event => {
    event.preventDefault();
    const productData = { ...form, price: Number(form.price), stock: Number(form.stock), colors: editing ? (products.find(p => p.id === editing)?.colors || ['White','Black']) : ['White','Black'], sizes: editing ? (products.find(p => p.id === editing)?.sizes || ['S','M','L']) : ['S','M','L'], isNew: !editing };
    if (editing) {
      setProducts(old => old.map(item => item.id === editing ? { ...item, ...productData } : item));
      flash('บันทึกการแก้ไขสินค้าแล้ว');
    } else {
      setProducts(old => [{ ...productData, id: Date.now() }, ...old]);
      flash('เพิ่มสินค้าใหม่เรียบร้อยแล้ว');
    }
    resetForm();
  };
  const editProduct = product => {
    setEditing(product.id);
    setForm({ name: product.name, category: product.category, price: product.price, stock: product.stock, image: product.image, description: product.description });
    setImageError(false);
    document.getElementById('admin-product-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  const removeProduct = id => {
    if (window.confirm('ต้องการลบสินค้านี้หรือไม่?')) {
      setProducts(old => old.filter(item => item.id !== id));
      flash('ลบสินค้าแล้ว');
    }
  };

  return <section className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="logo light">YES, CLOTH<span>.</span></Link>
      <div className="admin-side-caption">STORE MANAGEMENT</div>
      <div className="admin-menu">
        {[
          ['overview','▦','ภาพรวม'], ['products','▧','สินค้า'], ['categories','◫','หมวดหมู่'],
          ['orders','▤','คำสั่งซื้อ'], ['users','♙','สมาชิก'], ['reviews','☆','รีวิว']
        ].map(([key, icon, label]) => <button key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}><span>{icon}</span>{label}</button>)}
      </div>
      <Link className="admin-back-store" to="/">← กลับไปหน้าร้าน</Link>
    </aside>

    <div className="admin-main">
      <header className="admin-top">
        <div><span className="eyebrow">YES, CLOTH / ADMIN</span><h1>{title[tab]}</h1><p>จัดการร้านค้าและตรวจสอบข้อมูลได้จากที่นี่</p></div>
        <div className="admin-profile"><div className="admin-avatar">{user.name?.[0]?.toUpperCase()}</div><div><b>{user.name}</b><span>Administrator</span></div></div>
      </header>

      {tab === 'overview' && <>
        <div className="admin-stats">
          <article><span>สินค้าทั้งหมด</span><b>{products.length}</b><small>รายการสินค้าในร้าน</small></article>
          <article><span>คำสั่งซื้อ</span><b>{orders.length}</b><small>รายการที่ลูกค้าสั่งซื้อ</small></article>
          <article><span>สมาชิก</span><b>{memberCount}</b><small>บัญชีสมาชิก</small></article>
          <article><span>ยอดขายที่บันทึก</span><b>{money(totalSales)}</b><small>ไม่รวมคำสั่งซื้อที่ยกเลิก</small></article>
        </div>
        <section className="admin-panel admin-welcome-panel">
          <div className="admin-panel-heading"><div><h2>ยินดีต้อนรับสู่ระบบจัดการร้านค้า</h2><p>เลือกเมนูที่ต้องการเพื่อจัดการข้อมูลของ Yes, Cloth</p></div></div>
          <div className="admin-quick-actions">
            <button onClick={() => setTab('products')}><span>＋</span><b>เพิ่มสินค้า</b><small>จัดการสินค้าและรูปภาพ</small></button>
            <button onClick={() => setTab('categories')}><span>▦</span><b>หมวดหมู่สินค้า</b><small>ดูหมวดหมู่ทั้งหมด</small></button>
            <button onClick={() => setTab('users')}><span>♙</span><b>จัดการสมาชิก</b><small>ตรวจสอบบัญชีผู้ใช้</small></button>
            <button onClick={() => setTab('reviews')}><span>☆</span><b>รีวิวสินค้า</b><small>อ่านความคิดเห็นลูกค้า</small></button>
          </div>
        </section>
      </>}

      {tab === 'products' && <>
        <form id="admin-product-form" className="admin-form" onSubmit={saveProduct}>
          <div className="admin-panel-heading"><div><h2>{editing ? 'แก้ไขสินค้า' : 'Add new product'}</h2><p>กรอกรายละเอียดและรูปภาพสินค้าที่ต้องการลงขาย</p></div>{editing && <button type="button" className="admin-text-button" onClick={resetForm}>ยกเลิก</button>}</div>
          <div className="admin-product-editor">
            <div className="admin-product-fields">
              <label>ชื่อสินค้า<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="เช่น Everyday Oversized Shirt"/></label>
              <div className="admin-form-row"><label>หมวดหมู่<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.filter(item => item !== 'All').map(item => <option key={item}>{item}</option>)}</select></label><label>ราคา (บาท)<input required type="number" min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="390"/></label></div>
              <label>จำนวนสินค้า<input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="20"/></label>
              <label>ลิงก์รูปภาพสินค้า<input value={form.image} onChange={e => { setForm({ ...form, image: e.target.value }); setImageError(false); }} placeholder="https://example.com/product.jpg"/></label>
              <label>รายละเอียดสินค้า<textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียดสินค้า..."/></label>
              <button className="btn dark" type="submit">{editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
            </div>
            <div className="admin-image-preview"><span>ตัวอย่างรูปสินค้า</span>{form.image && !imageError ? <img src={form.image} alt="ตัวอย่างสินค้า" onError={() => setImageError(true)}/> : <div className="admin-image-placeholder"><b>＋</b><span>{imageError ? 'ไม่สามารถโหลดรูปภาพได้' : 'ใส่ URL รูปภาพเพื่อดูตัวอย่าง'}</span></div>}</div>
          </div>
        </form>
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2>รายการสินค้า</h2><p>{products.length} รายการ</p></div></div><div className="table-wrap"><table><thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>คงเหลือ</th><th>จัดการ</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><div className="admin-product-cell"><img src={product.image} alt=""/><b>{product.name}</b></div></td><td>{product.category}</td><td>{money(product.price)}</td><td>{product.stock}</td><td><button className="table-action" onClick={() => editProduct(product)}>แก้ไข</button><button className="table-action danger" onClick={() => removeProduct(product.id)}>ลบ</button></td></tr>)}</tbody></table></div></section>
      </>}

      {tab === 'categories' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>หมวดหมู่สินค้า</h2><p>รายการหมวดหมู่และจำนวนสินค้าในแต่ละหมวดหมู่</p></div></div><div className="table-wrap"><table><thead><tr><th>หมวดหมู่สินค้า</th><th>จำนวนสินค้า</th></tr></thead><tbody>{categories.filter(item => item !== 'All').map(category => <tr key={category}><td><b>{category}</b></td><td>{products.filter(product => product.category === category).length} รายการ</td></tr>)}</tbody></table></div></section>}

      {tab === 'orders' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>รายการคำสั่งซื้อ</h2><p>รายการคำสั่งซื้อทั้งหมดของร้านค้า</p></div></div><div className="table-wrap"><table><thead><tr><th>เลขที่คำสั่งซื้อ</th><th>ลูกค้า</th><th>ยอดรวม</th><th>วันที่</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td>{order.id}</td><td>{order.customer}</td><td>{money(order.total)}</td><td>{new Date(order.date).toLocaleDateString('th-TH')}</td></tr>)}</tbody></table>{!orders.length && <div className="admin-empty">ยังไม่มีคำสั่งซื้อ</div>}</div></section>}

      {tab === 'users' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>ข้อมูลสมาชิก</h2><p>บัญชีผู้ใช้งานทั้งหมด</p></div></div><div className="table-wrap"><table><thead><tr><th>ชื่อ</th><th>อีเมล</th><th>ประเภทบัญชี</th></tr></thead><tbody>{users.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.email}</td><td><span className="admin-role">{item.role}</span></td></tr>)}</tbody></table></div></section>}

      {tab === 'reviews' && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>รีวิวจากสมาชิก</h2><p>ความคิดเห็นและคะแนนสินค้าทั้งหมด</p></div></div><div className="table-wrap"><table><thead><tr><th>สมาชิก</th><th>สินค้า</th><th>คะแนน</th><th>ความคิดเห็น</th></tr></thead><tbody>{reviews.map(review => <tr key={review.id}><td>{review.name}</td><td>{products.find(product => product.id === review.productId)?.name || '—'}</td><td><span className="rating-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span></td><td>{review.comment}</td></tr>)}</tbody></table>{!reviews.length && <div className="admin-empty">ยังไม่มีรีวิว</div>}</div></section>}
    </div>
  </section>;
}

export default Admin;
