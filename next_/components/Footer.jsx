"use client";
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <>
      <style>{`
        footer.footer-v1 {
          background: #000000;
          padding: 60px clamp(20px, 5vw, 56px) 30px;
          min-height: 400px;
          border-top: 1px solid var(--gold-dim);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #ffffff;
        }
        .footer-main-v1 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
          flex-grow: 1;
        }
        .footer-col-v1 ul { 
          list-style: none; 
          display: flex; 
          align-items: center; 
          gap: 30px; 
          flex-wrap: wrap; 
          padding: 0;
          margin: 0;
        }
        .footer-col-v1 ul li { margin-bottom: 0; }
        .footer-col-v1 { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .footer-brand-v1 { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
        
        .footer-link-v1 {
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #ffffff; text-decoration: none;
          transition: color 0.3s, transform 0.3s;
          display: inline-block;
          opacity: 0.8;
        }
        .footer-link-v1:hover { color: #ffffff; opacity: 1; transform: translateY(-2px); }
        .footer-brand-v1 p {
          font-size: 0.85rem; line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          max-width: 320px; 
          margin-top: 0;
        }
        .footer-bottom-v1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .footer-bottom-v1 p {
          font-size: 0.6rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255, 255, 255, 0.6);
        }
        .footer-mark-v1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 2rem; font-weight: 400;
          letter-spacing: 0.8em; color: #ffffff; text-transform: uppercase;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
          margin-left: 0.8em;
          opacity: 0.9;
        }
        .footer-logo-v1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 1.8rem; letter-spacing: 0.25em; color: #ffffff;
          text-transform: uppercase; text-decoration: none; display: flex; align-items: center; gap: 10px;
        }
        .footer-logo-v1 img { height: 36px; width: auto; }

        @media (max-width: 992px) {
          footer.footer-v1 { min-height: auto; padding: 40px 20px 20px; }
          .footer-main-v1 { flex-direction: column; align-items: flex-start; justify-content: flex-start; }
          .footer-col-v1 { flex-direction: column; align-items: flex-start; gap: 20px; }
          .footer-col-v1 ul { flex-direction: column; align-items: flex-start; gap: 15px; }
        }
        @media (max-width: 576px) {
          .footer-bottom-v1 { justify-content: center; text-align: center; }
          .footer-mark-v1 { display: none; }
        }
      `}</style>

      <footer className="footer-v1">
        <div className="footer-main-v1">
          <div className="footer-col-v1 footer-brand-v1">
            <Link href="/" className="footer-logo-v1">
              <img src="/footer_logo.jpeg" alt="Fylex" />
            </Link>
            <p>Built On Experience, Designed Around Choice.</p>
          </div>

          <div className="footer-col-v1">
            <ul>
              <li><Link href="/profile" className="footer-link-v1">My Account</Link></li>
              <li><Link href="/care-support" className="footer-link-v1">Watch Care</Link></li>
              <li><Link href="/policies" className="footer-link-v1">Legal</Link></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-link-v1">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom-v1">
          <p>&copy; 2026 <img src="/fylex.png" alt="Fylex" style={{ height: '3.5em', display: 'inline-block', verticalAlign: 'baseline', transform: 'translateY(0.2em)', opacity: 0.8 }} /></p>
          <div className="footer-mark-v1">F · Y · L · E · X</div>
          <p>Crafted with Intention</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
