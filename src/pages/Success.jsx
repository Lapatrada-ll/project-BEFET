import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../data';

function Success() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = (orders || []).find(o => o.id === id);

  return (
    <section className="success-wrap">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <span className="eyebrow">THANK YOU FOR YOUR ORDER</span>
        <h1>Order success!</h1>
        <p>ขอบคุณที่เลือก Yes, Cloth คำสั่งซื้อของคุณถูกบันทึกเรียบร้อยแล้ว</p>

        <div className="success-details">
          <div>
            <span>Order number</span>
            <b>{id}</b>
          </div>
          <div>
            <span>Total</span>
            <b>{money(order?.total || 0)}</b>
          </div>
          <div>
            <span>Status</span>
            <b className="status confirmed">{order?.status || 'Confirmed'}</b>
          </div>
        </div>

        <Link className="btn dark full" to="/account" style={{ marginBottom: '10px' }}>
          VIEW MY ORDERS ↗
        </Link>
        <Link className="back-link" to="/shop">
          ← Continue shopping
        </Link>
      </div>
    </section>
  );
}

export default Success;