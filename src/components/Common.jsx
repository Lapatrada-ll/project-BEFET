import React from 'react';
import { Link } from 'react-router-dom';
function LoginRequired({admin=false}) { return <section className="auth-wrap"><div className="auth-card"><span className="eyebrow">MEMBER AREA</span><h1>{admin?'Admin access':'Please login'}</h1><p>{admin?'กรุณาเข้าสู่ระบบด้วยบัญชี Admin':'กรุณาเข้าสู่ระบบเพื่อใช้งานส่วนนี้'}</p><Link className="btn dark full" to="/login">GO TO LOGIN ↗</Link></div></section>; }
function Empty({title,desc}) { return <div className="empty-state"><div>♡</div><h2>{title}</h2><p>{desc}</p><Link className="btn dark" to="/shop">EXPLORE SHOP ↗</Link></div>; }
function NotFound() { return <section className="auth-wrap"><div className="auth-card"><h1>Page not found</h1><Link className="btn dark full" to="/">Back to home</Link></div></section>; }


export { LoginRequired, Empty, NotFound };
