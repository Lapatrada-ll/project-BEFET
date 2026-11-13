import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import {
  getCategories,
  getProducts,
  getReviews,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  updateReview,
  deleteReview,
} from '../api/backend';
import { LoginRequired } from '../components/Common';

const emptyProductForm = { name: '', category: 'Tops', price: '', stock: '', image: '', description: '' };
const emptyMemberForm = { name: '', email: '', role: 'customer', shippingAddress: '' };
const emptyReviewForm = { rating: 5, comment: '' };

function Admin() {
  const { user, products, setProducts, orders, setOrders, users, setUsers, reviews, setReviews, flash } = useStore();
  const [tab, setTab] = useState('overview');

  // Product editor state
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [imageError, setImageError] = useState(false);
  const [categoryList, setCategoryList] = useState(['Tops', 'Bottoms', 'Dresses', 'Accessories']);

  // Member editor state
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);

  // Review editor state
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);

  // Fetch live data from database when Admin opens or switches tabs
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user?.role !== 'admin' || !token) return;

    getCategories()
      .then(list => {
        if (list.length) setCategoryList(list.map(c => c.category_name));
      })
      .catch(() => {});

    getAdminUsers(token).then(setUsers).catch(() => {});
    getAdminOrders(token).then(setOrders).catch(() => {});
    getReviews().then(setReviews).catch(() => {});
  }, [user, tab, setUsers, setOrders, setReviews]);

  const memberCount = users.filter(item => item.role !== 'admin').length;
  const totalSales = orders
    .filter(item => item.status?.toLowerCase() !== 'cancelled')
    .reduce((sum, item) => sum + Number(item.total || 0), 0);

  const title = {
    overview: 'ภาพรวมร้านค้า',
    products: 'จัดการสินค้า',
    categories: 'หมวดหมู่สินค้า',
    orders: 'คำสั่งซื้อ',
    users: 'สมาชิก',
    reviews: 'รีวิวสินค้า',
  };

  if (user?.role !== 'admin') return <LoginRequired admin />;

  // ---------- Product handlers ----------
  const resetForm = () => {
    setEditing(null);
    setForm(emptyProductForm);
    setImageError(false);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      colors: editing ? (products.find(p => p.id === editing)?.colors || ['White', 'Black']) : ['White', 'Black'],
      sizes: editing ? (products.find(p => p.id === editing)?.sizes || ['S', 'M', 'L']) : ['S', 'M', 'L'],
      isNew: !editing,
    };

    try {
      if (editing) {
        await updateProduct(editing, productData, token);
        flash('บันทึกการแก้ไขสินค้าแล้ว');
      } else {
        await createProduct(productData, token);
        flash('เพิ่มสินค้าใหม่เรียบร้อยแล้ว');
      }
      const freshProducts = await getProducts();
      setProducts(freshProducts);
      resetForm();
    } catch (err) {
      flash(err.message || 'ไม่สามารถบันทึกสินค้าได้');
    }
  };

  const editProduct = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      description: product.description,
    });
    setImageError(false);
    document.getElementById('admin-product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeProduct = async (id) => {
    if (!window.confirm('ต้องการลบสินค้านี้หรือไม่?')) return;
    const token = localStorage.getItem('token');
    try {
      await deleteProduct(id, token);
      setProducts(old => old.filter(item => item.id !== id));
      flash('ลบสินค้าแล้ว');
    } catch (err) {
      flash(err.message || 'ไม่สามารถลบสินค้าได้');
    }
  };

  // ---------- Member handlers ----------
  const startEditMember = (member) => {
    setEditingMember(member.id);
    setMemberForm({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'customer',
      shippingAddress: member.shippingAddress || '',
    });
    document.getElementById('admin-member-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    const token = localStorage.getItem('token');
    try {
      await updateAdminUser(editingMember, memberForm, token);
      const freshUsers = await getAdminUsers(token);
      setUsers(freshUsers);
      setEditingMember(null);
      setMemberForm(emptyMemberForm);
      flash('บันทึกข้อมูลสมาชิกเรียบร้อยแล้ว');
    } catch (err) {
      flash(err.message || 'ไม่สามารถแก้ไขข้อมูลสมาชิกได้');
    }
  };

  const removeMember = async (id) => {
    if (!window.confirm('ต้องการลบบัญชีสมาชิกนี้หรือไม่?')) return;
    const token = localStorage.getItem('token');
    try {
      await deleteAdminUser(id, token);
      setUsers(old => old.filter(u => u.id !== id));
      if (editingMember === id) setEditingMember(null);
      flash('ลบบัญชีสมาชิกแล้ว');
    } catch (err) {
      flash(err.message || 'ไม่สามารถลบสมาชิกได้');
    }
  };

  // ---------- Review handlers ----------
  const startEditReview = (rv) => {
    setEditingReview(rv.id);
    setReviewForm({
      rating: rv.rating || 5,
      comment: rv.comment || '',
    });
    document.getElementById('admin-review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    const token = localStorage.getItem('token');
    try {
      await updateReview(editingReview, { rating: Number(reviewForm.rating), comment: reviewForm.comment }, token);
      const freshReviews = await getReviews();
      setReviews(freshReviews);
      setEditingReview(null);
      setReviewForm(emptyReviewForm);
      flash('บันทึกการแก้ไขรีวิวแล้ว');
    } catch (err) {
      flash(err.message || 'ไม่สามารถแก้ไขรีวิวได้');
    }
  };

  const removeReview = async (id) => {
    if (!window.confirm('ต้องการลบรีวิวนี้หรือไม่?')) return;
    const token = localStorage.getItem('token');
    try {
      await deleteReview(id, token);
      setReviews(old => old.filter(r => r.id !== id));
      if (editingReview === id) setEditingReview(null);
      flash('ลบรีวิวเรียบร้อยแล้ว');
    } catch (err) {
      flash(err.message || 'ไม่สามารถลบรีวิวได้');
    }
  };

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="logo light">YES, CLOTH<span>.</span></Link>
        <div className="admin-side-caption">STORE MANAGEMENT</div>
        <div className="admin-menu">
          {[
            ['overview', '▦', 'ภาพรวม'],
            ['products', '▧', 'สินค้า'],
            ['categories', '◫', 'หมวดหมู่'],
            ['orders', '▤', 'คำสั่งซื้อ'],
            ['users', '♙', 'สมาชิก'],
            ['reviews', '☆', 'รีวิว'],
          ].map(([key, icon, label]) => (
            <button key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
        <Link className="admin-back-store" to="/">← กลับไปหน้าร้าน</Link>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div>
            <span className="eyebrow">YES, CLOTH / ADMIN</span>
            <h1>{title[tab]}</h1>
            <p>จัดการร้านค้าและตรวจสอบข้อมูลได้จากที่นี่</p>
          </div>
          <div className="admin-profile">
            <div className="admin-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div><b>{user.name}</b><span>Administrator</span></div>
          </div>
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
            <div className="admin-panel-heading">
              <div><h2>{editing ? 'แก้ไขสินค้า' : 'Add new product'}</h2><p>กรอกรายละเอียดและรูปภาพสินค้าที่ต้องการลงขาย</p></div>
              {editing && <button type="button" className="admin-text-button" onClick={resetForm}>ยกเลิก</button>}
            </div>
            <div className="admin-product-editor">
              <div className="admin-product-fields">
                <label>ชื่อสินค้า<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="เช่น Everyday Oversized Shirt" /></label>
                <div className="admin-form-row">
                  <label>หมวดหมู่
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {categoryList.map(item => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>ราคา (บาท)<input required type="number" min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="390" /></label>
                </div>
                <label>จำนวนสินค้า<input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="20" /></label>
                <label>ลิงก์รูปภาพสินค้า<input value={form.image} onChange={e => { setForm({ ...form, image: e.target.value }); setImageError(false); }} placeholder="https://example.com/product.jpg" /></label>
                <label>รายละเอียดสินค้า<textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียดสินค้า..." /></label>
                <button className="btn dark" type="submit">{editing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</button>
              </div>
              <div className="admin-image-preview">
                <span>ตัวอย่างรูปสินค้า</span>
                {form.image && !imageError
                  ? <img src={form.image} alt="ตัวอย่างสินค้า" onError={() => setImageError(true)} />
                  : <div className="admin-image-placeholder"><b>＋</b><span>{imageError ? 'ไม่สามารถโหลดรูปภาพได้' : 'ใส่ URL รูปภาพเพื่อดูตัวอย่าง'}</span></div>}
              </div>
            </div>
          </form>
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>รายการสินค้า</h2><p>{products.length} รายการ</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>คงเหลือ</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td><div className="admin-product-cell"><img src={product.image} alt="" /><b>{product.name}</b></div></td>
                      <td>{product.category}</td>
                      <td>{money(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <button className="table-action" onClick={() => editProduct(product)}>แก้ไข</button>
                        <button className="table-action danger" onClick={() => removeProduct(product.id)}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>}

        {tab === 'categories' && (
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>หมวดหมู่สินค้า</h2><p>รายการหมวดหมู่และจำนวนสินค้าในแต่ละหมวดหมู่</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>หมวดหมู่สินค้า</th><th>จำนวนสินค้า</th></tr></thead>
                <tbody>
                  {categoryList.map(category => (
                    <tr key={category}>
                      <td><b>{category}</b></td>
                      <td>{products.filter(product => product.category === category).length} รายการ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'orders' && (
          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>รายการคำสั่งซื้อ</h2><p>รายการคำสั่งซื้อทั้งหมดของร้านค้า</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>เลขที่คำสั่งซื้อ</th><th>ลูกค้า</th><th>ยอดรวม</th><th>วันที่</th></tr></thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{money(order.total)}</td>
                      <td>{new Date(order.date).toLocaleDateString('th-TH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!orders.length && <div className="admin-empty">ยังไม่มีคำสั่งซื้อ</div>}
            </div>
          </section>
        )}

        {tab === 'users' && <>
          {editingMember && (
            <form id="admin-member-form" className="admin-form" onSubmit={saveMember}>
              <div className="admin-panel-heading">
                <div><h2>แก้ไขข้อมูลสมาชิก #{editingMember}</h2><p>ปรับปรุงชื่อ อีเมล สิทธิ์การใช้งาน และที่อยู่จัดส่ง</p></div>
                <button type="button" className="admin-text-button" onClick={() => setEditingMember(null)}>ยกเลิก</button>
              </div>
              <div className="admin-product-fields">
                <div className="admin-form-row">
                  <label>ชื่อ-นามสกุล
                    <input required value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                  </label>
                  <label>อีเมล
                    <input required type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />
                  </label>
                </div>
                <div className="admin-form-row">
                  <label>ประเภทบัญชี (Role)
                    <select value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </label>
                  <label>ที่อยู่จัดส่ง
                    <input value={memberForm.shippingAddress} onChange={e => setMemberForm({ ...memberForm, shippingAddress: e.target.value })} placeholder="ที่อยู่จัดส่งของสมาชิก" />
                  </label>
                </div>
                <button className="btn dark" type="submit">บันทึกข้อมูลสมาชิก</button>
              </div>
            </form>
          )}

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>ข้อมูลสมาชิก</h2><p>บัญชีผู้ใช้งานทั้งหมด ({users.length} บัญชี)</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>ที่อยู่จัดส่ง</th><th>ประเภทบัญชี</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {users.map(item => (
                    <tr key={item.id}>
                      <td><b>{item.name}</b></td>
                      <td>{item.email}</td>
                      <td>{item.shippingAddress || '—'}</td>
                      <td><span className="admin-role">{item.role}</span></td>
                      <td>
                        <button className="table-action" onClick={() => startEditMember(item)}>แก้ไข</button>
                        {item.id !== user.id && (
                          <button className="table-action danger" onClick={() => removeMember(item.id)}>ลบ</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!users.length && <div className="admin-empty">ยังไม่มีสมาชิก</div>}
            </div>
          </section>
        </>}

        {tab === 'reviews' && <>
          {editingReview && (
            <form id="admin-review-form" className="admin-form" onSubmit={saveReview}>
              <div className="admin-panel-heading">
                <div><h2>แก้ไขรีวิว #{editingReview}</h2><p>ปรับคะแนนหรือข้อความรีวิว</p></div>
                <button type="button" className="admin-text-button" onClick={() => setEditingReview(null)}>ยกเลิก</button>
              </div>
              <div className="admin-product-fields">
                <label>คะแนน (1-5 ดาว)
                  <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ดาว ({'★'.repeat(n)})</option>)}
                  </select>
                </label>
                <label>ความคิดเห็น
                  <textarea rows="3" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                </label>
                <button className="btn dark" type="submit">บันทึกการแก้ไขรีวิว</button>
              </div>
            </form>
          )}

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>รีวิวจากสมาชิก</h2><p>ความคิดเห็นและคะแนนสินค้าทั้งหมด ({reviews.length} รายการ)</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>สมาชิก</th><th>สินค้า</th><th>คะแนน</th><th>ความคิดเห็น</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {reviews.map(review => (
                    <tr key={review.id}>
                      <td><b>{review.name}</b></td>
                      <td>{products.find(product => product.id === review.productId)?.name || `#${review.productId}`}</td>
                      <td><span className="rating-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></td>
                      <td>{review.comment}</td>
                      <td>
                        <button className="table-action" onClick={() => startEditReview(review)}>แก้ไข</button>
                        <button className="table-action danger" onClick={() => removeReview(review.id)}>ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!reviews.length && <div className="admin-empty">ยังไม่มีรีวิว</div>}
            </div>
          </section>
        </>}
      </div>
    </section>
  );
}

export default Admin;