import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { register as apiRegister, login as apiLogin } from '../api/backend';

function Auth({ mode }) {
  const { setUser, flash } = useStore();
  const nav = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (isRegister) {
        // 1. Combine first + last name -> "ชื่อ นามสกุล" (backend needs both words)
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        await apiRegister(fullName, email, password);

        // 2. Auto-login right after registering so the user gets their JWT token
        const loginData = await apiLogin(email, password);
        localStorage.setItem('token', loginData.token);

        setUser({
          id: loginData.user.user_id,
          name: loginData.user.full_name,
          email: loginData.user.email,
          role: loginData.user.role,
        });

        flash('สมัครสมาชิกสำเร็จ');
        nav('/');
      } else {
        // 1. Send login request to Go backend
        const data = await apiLogin(email, password);

        // 2. Save JWT token for future authenticated requests
        localStorage.setItem('token', data.token);

        // 3. Store user in React context (mapped to match frontend field names)
        setUser({
          id: data.user.user_id,
          name: data.user.full_name,
          email: data.user.email,
          role: data.user.role,
        });

        flash('เข้าสู่ระบบสำเร็จ');
        nav(data.user.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      // Displays Go's error message (e.g. "email is already registered" or "invalid email or password")
      flash(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">{isRegister ? 'BECOME A MEMBER' : 'WELCOME BACK'}</span>
        <h1>{isRegister ? 'Create account' : 'Login'}</h1>
        <p>{isRegister ? 'สมัครสมาชิกเพื่อบันทึกรายการโปรดและสั่งซื้อสินค้า' : 'เข้าสู่ระบบ Yes, Cloth'}</p>

        {isRegister && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label>FIRST NAME</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ชื่อ"
              />
            </div>
            <div className="field">
              <label>LAST NAME</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="นามสกุล"
              />
            </div>
          </div>
        )}

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
          <label>PASSWORD</label>
          <input
            required
            minLength="6"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
        </div>

        <button className="btn dark full" disabled={loading}>
          {loading ? 'PLEASE WAIT...' : isRegister ? 'CREATE ACCOUNT ↗' : 'LOGIN ↗'}
        </button>

        <p className="auth-switch">
          {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </Link>
        </p>

        {!isRegister && (
          <div className="demo-login">
            <b>บัญชีทดลอง</b>
            <span>Member: member@yescloth.com / member123</span>
            <span>Admin: admin@yescloth.com / admin123</span>
          </div>
        )}
      </form>
    </section>
  );
}

export default Auth;