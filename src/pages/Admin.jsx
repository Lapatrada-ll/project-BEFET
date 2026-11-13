import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getReviews,
  getAdminUsers,
  createAdminUser,
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
const emptyCategoryForm = { category_name: '', image_url: '' };
const emptyMemberForm = { name: '', email: '', password: '', role: 'customer', shippingAddress: '' };
const emptyReviewForm = { rating: 5, comment: '' };

function Admin() {
  const { user, products, setProducts, orders, setOrders, users, setUsers, reviews, setReviews, flash } = useStore();
  const [tab, setTab] = useState('overview');

  // Product editor state
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [imageError, setImageError] = useState(false);

  // Category editor state
  const [categoriesData, setCategoriesData] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);

  // Member editor state
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);

  // Review editor state
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);

  const categoryList = categoriesData.length
    ? categoriesData.map(c => c.category_name)
    : ['Tops', 'Bottoms', 'Dresses', 'Accessories'];

  // Fetch live data from database when Admin opens or switches tabs
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user?.role !== 'admin' || !token) return;

    getCategories().then(setCategoriesData).catch(() => {});
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

  // ---------- Category handlers ----------
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingCategory) {
        await updateCategory(editingCategory, categoryForm, token);
        flash('แก้ไขหมวดหมู่เรียบร้อยแล้ว');
      } else {
        await createCategory(categoryForm, token);
        flash('เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว');
      }
      const fresh = await getCategories();
      setCategoriesData(fresh);
      resetCategoryForm();
    } catch (err) {
      flash(err.message || 'ไม่สามารถบันทึกหมวดหมู่ได้');
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat.category_id);
    setCategoryForm({
      category_name: cat.category_name || '',
      image_url: cat.image_url || '',
    });
    document.getElementById('admin-category-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeCategory = async (id) => {
    if (!window.confirm('ต้องการลบหมวดหมู่นี้หรือไม่?')) return;
    const token = localStorage.getItem('token');
    try {
      await deleteCategory(id, token);
      setCategoriesData(old => old.filter(c => c.category_id !== id));
      if (editingCategory === id) resetCategoryForm();
      flash('ลบหมวดหมู่แล้ว');
    } catch (err) {
      flash(err.message || 'ไม่สามารถลบหมวดหมู่ได้');
    }
  };

  // ---------- Member handlers ----------
  const resetMemberForm = () => {
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
  };

  const startEditMember = (member) => {
    setEditingMember(member.id);
    setMemberForm({
      name: member.name || '',
      email: member.email || '',
      password: '',
      role: member.role || 'customer',
      shippingAddress: member.shippingAddress || '',
    });
    document.getElementById('admin-member-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveMember = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingMember) {
        await updateAdminUser(editingMember, memberForm, token);
        flash('บันทึกการแก้ไขข้อมูลสมาชิกแล้ว');
      } else {
        await createAdminUser(memberForm, token);
        flash('เพิ่มสมาชิกใหม่เรียบร้อยแล้ว');
      }
      const freshUsers = await getAdminUsers(token);
      setUsers(freshUsers);
      resetMemberForm();
    } catch (err) {
      flash(err.message || 'ไม่สามารถบันทึกข้อมูลสมาชิกได้');
    }
  };

  const removeMember = async (id) => {
    if (!window.confirm('ต้องการลบบัญชีสมาชิกนี้หรือไม่?')) return;
    const token = localStorage.getItem('token');
    try {
      await deleteAdminUser(id, token);
      setUsers(old => old.filter(u => u.id !== id));
      if (editingMember === id) resetMemberForm();
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
              <button onClick={() => setTab('categories')}><span>▦</span><b>หมวดหมู่สินค้า</b><small>เพิ่มและแก้ไขหมวดหมู่</small></button>
              <button onClick={() => setTab('users')}><span>♙</span><b>จัดการสมาชิก</b><small>เพิ่มและแก้ไขบัญชีผู้ใช้</small></button>
              <button onClick={() => setTab('reviews')}><span>☆</span><b>รีวิวสินค้า</b><small>จัดการความคิดเห็นลูกค้า</small></button>
            </div>
          </section>
        </>}

        {tab === 'products' && <>
          <form id="admin-product-form" className="admin-form" onSubmit={saveProduct}>
            <div className="admin-panel-heading">
              <div><h2>{editing ? 'Edit Product' : 'Add new product'}</h2><p>กรอกรายละเอียดและรูปภาพสินค้าที่ต้องการลงขาย</p></div>
              {editing && <button type="button" className="admin-text-button" onClick={resetForm}>Cancel</button>}
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
                <button className="btn dark" type="submit">{editing ? 'Save Changes' : 'Add Product'}</button>
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
                        <button className="table-action" onClick={() => editProduct(product)}>Edit</button>
                        <button className="table-action danger" onClick={() => removeProduct(product.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>}

        {tab === 'categories' && <>
          <form id="admin-category-form" className="admin-form" onSubmit={saveCategory}>
            <div className="admin-panel-heading">
              <div>
                <h2>{editingCategory ? `Edit Category #${editingCategory}` : 'Add New Category'}</h2>
                <p>เพิ่มหรือแก้ไขหมวดหมู่สินค้าและลิงก์รูปภาพปกหมวดหมู่</p>
              </div>
              {editingCategory && (
                <button type="button" className="admin-text-button" onClick={resetCategoryForm}>Cancel</button>
              )}
            </div>
            <div className="admin-product-fields">
              <div className="admin-form-row">
                <label>ชื่อหมวดหมู่ (Category Name)
                  <input
                    required
                    value={categoryForm.category_name}
                    onChange={e => setCategoryForm({ ...categoryForm, category_name: e.target.value })}
                    placeholder="เช่น Tops, Outerwear"
                  />
                </label>
                <label>ลิงก์รูปภาพหมวดหมู่ (Image URL)
                  <input
                    value={categoryForm.image_url}
                    onChange={e => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>
              </div>
              <button className="btn dark" type="submit">
                {editingCategory ? 'Save Category' : 'Add Category'}
              </button>
            </div>
          </form>

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><h2>หมวดหมู่สินค้า</h2><p>รายการหมวดหมู่และจำนวนสินค้าในแต่ละหมวดหมู่</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>หมวดหมู่สินค้า</th><th>จำนวนสินค้า</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {categoriesData.map(cat => (
                    <tr key={cat.category_id}>
                      <td>
                        <div className="admin-product-cell">
                          {cat.image_url && <img src={cat.image_url} alt="" />}
                          <b>{cat.category_name}</b>
                        </div>
                      </td>
                      <td>
                        {products.filter(
                          p => (p.category || '').trim().toLowerCase() === (cat.category_name || '').trim().toLowerCase()
                        ).length} รายการ
                      </td>
                      <td>
                        <button className="table-action" onClick={() => startEditCategory(cat)}>Edit</button>
                        <button className="table-action danger" onClick={() => removeCategory(cat.category_id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>}

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
          <form id="admin-member-form" className="admin-form" onSubmit={saveMember}>
            <div className="admin-panel-heading">
              <div>
                <h2>{editingMember ? `Edit Member #${editingMember}` : 'Add New Member'}</h2>
                <p>{editingMember ? 'แก้ไขชื่อ อีเมล สิทธิ์การใช้งาน และที่อยู่จัดส่ง' : 'เพิ่มบัญชีสมาชิกใหม่ลงในฐานข้อมูล'}</p>
              </div>
              {editingMember && (
                <button type="button" className="admin-text-button" onClick={resetMemberForm}>Cancel</button>
              )}
            </div>
            <div className="admin-product-fields">
              <div className="admin-form-row">
                <label>ชื่อ-นามสกุล (Full Name)
                  <input
                    required
                    value={memberForm.name}
                    onChange={e => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="ชื่อ นามสกุล"
                  />
                </label>
                <label>อีเมล (Email)
                  <input
                    required
                    type="email"
                    value={memberForm.email}
                    onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </label>
              </div>
              <div className="admin-form-row">
                {!editingMember && (
                  <label>รหัสผ่าน (Password อย่างน้อย 6 ตัวอักษร)
                    <input
                      required
                      type="password"
                      minLength="6"
                      value={memberForm.password}
                      onChange={e => setMemberForm({ ...memberForm, password: e.target.value })}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                    />
                  </label>
                )}
                <label>ประเภทบัญชี (Role)
                  <select value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
                <label>ที่อยู่จัดส่ง (Shipping Address)
                  <input
                    value={memberForm.shippingAddress}
                    onChange={e => setMemberForm({ ...memberForm, shippingAddress: e.target.value })}
                    placeholder="ที่อยู่จัดส่งของสมาชิก"
                  />
                </label>
              </div>
              <button className="btn dark" type="submit">
                {editingMember ? 'Save Member' : 'Add Member'}
              </button>
            </div>
          </form>

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
                        <button className="table-action" onClick={() => startEditMember(item)}>Edit</button>
                        {item.id !== user.id && (
                          <button className="table-action danger" onClick={() => removeMember(item.id)}>Delete</button>
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
                <div><h2>Edit Review #{editingReview}</h2><p>ปรับคะแนนหรือข้อความรีวิว</p></div>
                <button type="button" className="admin-text-button" onClick={() => setEditingReview(null)}>Cancel</button>
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
                <button className="btn dark" type="submit">Save Review</button>
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
                        <button className="table-action" onClick={() => startEditReview(review)}>Edit</button>
                        <button className="table-action danger" onClick={() => removeReview(review.id)}>Delete</button>
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