"use client";
import React, { useState } from 'react';

export default function PoliciesPage() {
  const [activePolicy, setActivePolicy] = useState(null);

  const policies = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: 'We value your privacy. We collect only the information necessary to provide and improve our services, including processing orders, offering customer support, and enhancing your browsing experience. We do not sell your personal data to third parties. For full details on how we handle and protect your data, please contact our support team.'
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      content: 'By accessing and using Fylex services, you agree to comply with our terms. We reserve the right to update these terms as needed to reflect changes in our services or legal requirements. Use of our website constitutes acceptance of our current Terms of Service. All content, trademarks, and intellectual property remain the property of Fylex.'
    },
    {
      id: 'refund',
      title: 'Refund Policy',
      content: 'We stand by the craftsmanship of our timepieces. If you are not entirely satisfied with your purchase, you may return it within 14 days of delivery for a full refund or exchange, provided the watch remains in unworn, pristine condition with all original packaging and tags intact. Custom configurations or engraved pieces are final sale and cannot be returned.'
    },
    {
      id: 'shipping',
      title: 'Shipping Policy',
      content: 'We offer complimentary expedited shipping on all domestic and international orders. Orders are typically processed within 1-3 business days. Due to the high value of our timepieces, all shipments are fully insured and require a direct signature upon delivery. You will receive tracking details once your order has been dispatched.'
    },
    {
      id: 'guarantee',
      title: 'Guarantee Policy',
      content: 'Every Fylex timepiece is accompanied by a comprehensive 5-year international guarantee covering manufacturing defects. This guarantee applies to the movement and components but excludes normal wear and tear, accidental damage, or unauthorized modifications. To maintain your guarantee, all servicing must be performed by an authorized Fylex service center.'
    }
  ];

  return (
    <div className="policies-root">
      <style>{`
        .policies-root {
          font-family: 'Inter', sans-serif;
          background: #000;
          color: #fff;
          padding: calc(var(--header-h) + 60px) 20px 100px 20px;
          min-height: 100vh;
        }
        
        .policies-header {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 60px auto;
        }
        
        .policies-header h1 {
          font-family: 'Avenir', 'Neue Haas Grotesk Display Pro', 'Inter', sans-serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          margin-bottom: 20px;
          color: #fff;
        }
        
        .policies-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .policies-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .policy-item {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }

        .policy-item:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .policy-header {
          padding: 24px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .policy-header h3 {
          font-size: 1.15rem;
          font-weight: 500;
          color: #fff;
          margin: 0;
        }

        .policy-icon {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.2rem;
          transition: transform 0.3s ease, color 0.3s ease;
        }
        
        .policy-item:hover .policy-icon {
          color: #fff;
        }

        .policy-item.active .policy-icon {
          transform: rotate(90deg);
        }

        .policy-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .policy-item.active .policy-content {
          max-height: 400px;
        }

        .policy-content-inner {
          padding: 0 30px 30px 30px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .policies-header { margin-bottom: 40px; }
          .policy-header { padding: 20px; }
          .policy-content-inner { padding: 0 20px 20px 20px; }
        }
      `}</style>

      <div className="policies-header">
        <h1>Policies</h1>
        <p>Learn about our policies regarding privacy, terms of service, refunds, shipping, and guarantees.</p>
      </div>

      <div className="policies-list">
        {policies.map((policy) => (
          <div 
            key={policy.id} 
            className={`policy-item ${activePolicy === policy.id ? 'active' : ''}`}
          >
            <div 
              className="policy-header" 
              onClick={() => setActivePolicy(activePolicy === policy.id ? null : policy.id)}
            >
              <h3>{policy.title}</h3>
              <div className="policy-icon">❯</div>
            </div>
            <div className="policy-content">
              <div className="policy-content-inner">
                {policy.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
