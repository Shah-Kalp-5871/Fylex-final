"use client";
import React, { useState } from 'react';
import '@/app/admin/css/custom.css';

const SupportPage = () => {
    const [tickets] = useState([
        { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', subject: 'Order Delivery Issue', message: 'My order #FLX-1234 has not arrived yet.', status: 'open', created_at: '2024-03-15' },
        { id: 2, name: 'Priya Patel', email: 'priya@email.com', subject: 'Refund Request', message: 'I want a refund for order #FLX-1180.', status: 'resolved', created_at: '2024-03-12' },
        { id: 3, name: 'Amit Kumar', email: 'amit@email.com', subject: 'Product Quality', message: 'Watch glass has a scratch on delivery.', status: 'open', created_at: '2024-03-10' },
    ]);

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h2>Help & Support</h2>
                    <p>Customer contact requests and tickets</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card-header"><h3>Support Tickets</h3></div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b', fontSize: 13 }}>
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="cell-primary">{t.name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="cell-primary">{t.subject}</td>
                                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.message}>{t.message}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`status-pill ${t.status === 'open' ? 'pill-warning' : 'pill-active'}`}>{t.status}</span>
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>{t.created_at}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            <button className="btn-icon btn-icon-edit"><i className="fas fa-eye"></i></button>
                                            <button className="btn-icon btn-icon-delete"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
