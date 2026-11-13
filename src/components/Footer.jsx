import React from 'react';
import { Link } from 'react-router-dom';
function Footer() {
    return <footer className="footer">
        <div className="footer-inner"><div>
            <div className="logo light">YES, CLOTH V.151</div>
        </div>
            <div><b>EXPLORE</b><Link to="/shop">Shop all</Link>
                <Link to="/account">My account</Link>
                <Link to="/cart">Shopping cart</Link>
            </div>
            <div><b>ABOUT</b>
                <span>TEAM เทอมนี้ขอ A</span>
                <p>670710211 ลภัสรดา เกษรบัว</p>
                <p>670710723 นาธาน เมธาวีวรโชติ</p>
            </div>
        </div>
    </footer>;
}

export default Footer;
