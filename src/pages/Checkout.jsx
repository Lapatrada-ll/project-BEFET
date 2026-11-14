import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';
import { Empty, LoginRequired } from '../components/Common';
import { placeOrder, getProducts } from '../api/backend';

function Checkout() {
  const { user, cart, setCart, products, setOrders, setProducts, flash } = useStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!user) return <LoginRequired />;

  const lines = cart
    .map(x => ({ ...x, product: (products || []).find(p => p.id === x.productId) }))
    .filter(x => x.product);
  const total = lines.reduce((s, x) => s + x.product.price * x.qty, 0);

  const place = async () => {
    if (!lines.length) return;
    if (lines.some(x => x.qty > x.product.stock))
      return flash('มีสินค้าบางรายการไม่เพียงพอ');

    setBusy(true);
    const token = localStorage.getItem('token');

    const checkoutItems = lines.map(x => ({
      variant_id: x.variant_id || (x.product.variants?.[0]?.variant_id ?? x.product.id),
      productId: x.product.id,
      qty: x.qty,
      price: x.product.price,
    }));

    try {
      let orderId = 'YC-' + Date.now().toString().slice(-8);
      if (token) {
        const res = await placeOrder(checkoutItems, '', token);
        if (res.order_id) orderId = res.order_id;
      }

      const order = {
        id: orderId,
        userId: user.id,
        customer: user.name,
        items: lines.map(x => ({
          name: x.product.name,
          productId: x.product.id,
          size: x.size,
          color: x.color,
          qty: x.qty,
          price: x.product.price,
        })),
        total,
        status: 'Confirmed',
        date: new Date().toISOString(),
      };

      setOrders(old => [order, ...old]);
      setCart([]);

      // Fetch fresh products with updated stocks directly from Supabase
      try {
        const fresh = await getProducts();
        if (Array.isArray(fresh)) setProducts(fresh);
      } catch (e) {}

      nav(`/success/${orderId}`);
    } catch (err) {
      flash(err.message || 'ไม่สามารถทำการสั่งซื้อได้');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container page-section narrow">
      <div className="page-title">
        <span className="eyebrow">ONE LAST LOOK</span>
        <h1>Confirm your order</h1>
        <p>ตรวจสอบรายการสินค้าก่อนยืนยันคำสั่งซื้อ</p>
      </div>
      {lines.length ? (
        <>
          <div className="checkout-list">
            {lines.map(x => (
              <div className="summary-row" key={x.key}>
                <span>
                  {x.product.name} · {x.color} / {x.size} × {x.qty}
                </span>
                <b>{money(x.product.price * x.qty)}</b>
              </div>
            ))}
          </div>
          <div className="summary-row total">
            <b>Total</b>
            <b>{money(total)}</b>
          </div>
          <div className="notice-box">
            <b>Order confirmation</b>
          </div>
          <button className="btn dark full" disabled={busy} onClick={place}>
            {busy ? 'PROCESSING...' : 'CONFIRM ORDER ↗'}
          </button>
          <Link className="back-link" to="/cart">
            ← Back to cart
          </Link>
        </>
      ) : (
        <Empty title="ไม่มีสินค้าให้สั่งซื้อ" desc="กรุณาเลือกสินค้าก่อน" />
      )}
    </section>
  );
}

export default Checkout;