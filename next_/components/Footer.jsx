"use client";
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <>
      <style>{`
        footer.footer-v1 {
          background: #000000;
          padding: clamp(20px, 4vw, 40px) clamp(20px, 5vw, 56px) clamp(20px, 4vw, 30px);
          border-top: 1px solid var(--gold-dim);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: clamp(15px, 4vw, 30px);
          overflow: hidden;
          color: #ffffff;
        }
        .footer-main-v1 {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: clamp(20px, 4vw, 40px);
        }
        .footer-col-v1 h4 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 0.9rem; font-weight: 400;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #ffffff; margin-bottom: 24px;
        }
        .footer-col-v1 ul { list-style: none; }
        .footer-col-v1 ul li { margin-bottom: 12px; }
        .footer-link-v1 {
          font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #ffffff; text-decoration: none;
          transition: color 0.3s, transform 0.3s;
          display: inline-block;
        }
        .footer-link-v1:hover { color: #cccccc; transform: translateX(4px); }
        .footer-brand-v1 p {
          font-size: 0.75rem; line-height: 1.8;
          color: #ffffff; max-width: 280px; margin-top: 16px;
        }
        .footer-bottom-v1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: clamp(20px, 4vw, 40px);
          border-top: 1px solid rgba(201,169,110,0.1);
        }
        .footer-bottom-v1 p {
          font-size: 0.55rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #ffffff;
        }
        .footer-mark-v1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 1.6rem; font-weight: 400;
          letter-spacing: 0.6em; color: #ffffff; text-transform: uppercase;
          text-shadow: 0 0 2px rgba(161, 139, 78, 0.3);
          margin-left: 0.6em;
        }
        .footer-logo-v1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: 1.5rem; letter-spacing: 0.25em; color: #ffffff;
          text-transform: uppercase; text-decoration: none; display: flex; align-items: center; gap: 10px;
        }
        .footer-logo-v1 img { height: 28px; width: auto; }

        @media (max-width: 992px) {
          .footer-main-v1 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 576px) {
          .footer-main-v1 { grid-template-columns: 1fr; }
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
            <h4>Client Services</h4>
            <ul>
              <li><Link href="/profile" className="footer-link-v1">My Account</Link></li>
              <li><Link href="/care-support" className="footer-link-v1">Watch Care</Link></li>
              <li><Link href="/policies" className="footer-link-v1">Legal</Link></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-link-v1">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom-v1">
          <p>&copy; 2026 <img src="/fylex.png" alt="Fylex" style={{ height: '3em', display: 'inline-block', verticalAlign: 'baseline', transform: 'translateY(0.2em)' }} /></p>
          <div className="footer-mark-v1">F · Y · L · E · X</div>
          <p>Crafted with Intention</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
