import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { resetPassword } from '../api/backend';

function ForgotPassword() {
  const { flash } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (newPassword !== confirmPassword) {
      return flash('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }
    if (newPassword.length < 6) {
      return flash('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      flash('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      nav('/login');
    } catch (err) {
      flash(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">RESET PASSWORD</span>
        <h1>Change password</h1>
        <p>กรอกอีเมลและตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>

        <div className="field">
          <label>EMAIL</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="field">
          <label>NEW PASSWORD</label>
          <input
            required
            minLength="6"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </div>

        <div className="field">
          <label>CONFIRM PASSWORD</label>
          <input
            required
            minLength="6"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
          />
        </div>

        <button className="btn dark full" disabled={loading} style={{ marginTop: '12px' }}>
          {loading ? 'PLEASE WAIT...' : 'CHANGE PASSWORD ↗'}
        </button>

        <p className="auth-switch">
          จำรหัสผ่านได้แล้ว?{' '}
          <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </section>
  );
}

export default ForgotPassword;