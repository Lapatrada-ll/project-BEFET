import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
function Auth({ mode }) {
  const { users, setUsers, setUser, flash } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = mode === 'register';
  const submit = e => {
    e.preventDefault();
    if (register) {
      if (users.some(u => u.email === email))
        return flash('อีเมลนี้ถูกใช้งานแล้ว');
      const u = { id: Date.now(), name, email, password, role: 'member' };
      setUsers(old => [...old, u]);
      setUser({ id: u.id, name, email, role: 'member' });
      flash('สมัครสมาชิกสำเร็จ'); nav('/');
    } else {
      const u = users.find(x => x.email === email && x.password === password);
      if (!u) return flash('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setUser({ id: u.id, name: u.name, email: u.email, role: u.role });
      flash('เข้าสู่ระบบสำเร็จ'); nav(u.role === 'admin' ? '/admin' : '/');
    }
  };
  return <section className="auth-wrap">
    <form className="auth-card" onSubmit={submit}>
      <span className="eyebrow">{register ? 'BECOME A MEMBER' : 'WELCOME BACK'}</span>
      <h1>{register ? 'Create account' : 'Login'}</h1>
      <p>{register ? 'สมัครสมาชิกเพื่อบันทึกรายการโปรดและสั่งซื้อสินค้า' : 'เข้าสู่ระบบ Yes, Cloth'}</p>
      {register && <div className="field">
        <label>FULL NAME</label>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ-นามสกุล" /></div>}
      <div className="field"><label>EMAIL</label>
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div className="field"><label>PASSWORD</label>
        <input required minLength="6" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" /></div>
      <button className="btn dark full">{register ? 'CREATE ACCOUNT' : 'LOGIN'} ↗</button>
      <p className="auth-switch">{register ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'} <Link to={register ? '/login' : '/register'}>{register ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Link></p>
      {!register && <div className="demo-login">
        <b>บัญชีทดลอง</b>
        <span>Member: member@yescloth.com / member123</span>
        <span>Admin: admin@yescloth.com / admin123</span></div>}</form></section>;
}

export default Auth;
