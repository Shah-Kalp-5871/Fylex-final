"use client";
import React, { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';

const ReportList = () => {
    const reports = [
        { title: 'Sales Report', description: 'Revenue, orders, and conversion metrics', icon: 'fas fa-chart-line', color: '#4f46e5', bg: '#eef2ff' },
        { title: 'Product Performance', description: 'Top sellers, low performers, inventory turns', icon: 'fas fa-box', color: '#059669', bg: '#ecfdf5' },
        { title: 'Customer Analytics', description: 'Acquisition, retention, and LTV metrics', icon: 'fas fa-users', color: '#7c3aed', bg: '#faf5ff' },
        { title: 'Inventory Report', description: 'Stock levels, dead stock, re-order points', icon: 'fas fa-warehouse', color: '#d97706', bg: '#fffbeb' },
        { title: 'Financial Summary', description: 'P&L, tax, refunds, and payment breakdown', icon: 'fas fa-coins', color: '#dc2626', bg: '#fef2f2' },
        { title: 'Traffic & SEO', description: 'Page views, bounce rate, top landing pages', icon: 'fas fa-globe', color: '#0ea5e9', bg: '#f0f9ff' },
    ];

    const tableRef = useRef(null);
    const [table, setTable] = useState(null);

    const variantData = [
        { id: 1, sku: 'LWA-001-BLK', product: 'Luxury Chronograph', attributes: 'Black / Leather / 42mm', sold: 124, revenue: 155000, stock: 45, status: 'Healthy' },
        { id: 2, sku: 'LWA-001-SLV', product: 'Luxury Chronograph', attributes: 'Silver / Metal / 42mm', sold: 89, revenue: 111250, stock: 12, status: 'Low Stock' },
        { id: 3, sku: 'CGE-99-GLD', product: 'Classic Gold Edition', attributes: 'Gold / Leather / 40mm', sold: 215, revenue: 182750, stock: 0, status: 'Out of Stock' },
        { id: 4, sku: 'SC-V2-BLU', product: 'Smart Connect V2', attributes: 'Blue / Silicone / 44mm', sold: 56, revenue: 42000, stock: 120, status: 'Healthy' },
        { id: 5, sku: 'SC-V2-BLK', product: 'Smart Connect V2', attributes: 'Black / Silicone / 44mm', sold: 310, revenue: 232500, stock: 8, status: 'Critical' },
    ];

    useEffect(() => {
        if (tableRef.current) {
            const t = new Tabulator(tableRef.current, {
                data: variantData,
                layout: "fitColumns",
                responsiveLayout: false,
                pagination: "local",
                paginationSize: 5,
                columns: [
                    { title: "SKU", field: "sku", minWidth: 140, cssClass: "cell-mono" },
                    { 
                        title: "Product / Variant", field: "product", minWidth: 200,
                        formatter: (cell) => {
                            const d = cell.getRow().getData();
                            return `<div style="font-weight:600;color:#0f172a;font-size:13px">${d.product}</div><div style="font-size:11px;color:#64748b">${d.attributes}</div>`;
                        }
                    },
                    { 
                        title: "Units Sold", field: "sold", hozAlign: "center", minWidth: 110, responsive: 0,
                        formatter: (cell) => `<span style="font-weight:700;color:#0e1726">${cell.getValue()}</span>`
                    },
                    { 
                        title: "Revenue", field: "revenue", hozAlign: "right", minWidth: 120,
                        formatter: (cell) => `<span style="font-weight:700;color:#059669">₹${cell.getValue().toLocaleString()}</span>`
                    },
                    { 
                        title: "Current Stock", field: "stock", hozAlign: "center", minWidth: 150,
                        formatter: (cell) => {
                            const d = cell.getRow().getData();
                            let col = d.stock > 20 ? '#059669' : (d.stock > 0 ? '#d97706' : '#dc2626');
                            let bg = d.stock > 20 ? '#ecfdf5' : (d.stock > 0 ? '#fffbeb' : '#fef2f2');
                            return `<div style="display:flex;align-items:center;justify-content:center;gap:6px"><div style="width:24px;height:24px;border-radius:6px;background:${bg};color:${col};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">${d.stock}</div><span style="font-size:11px;color:#64748b">${d.status}</span></div>`;
                        }
                    }
                ]
            });
            setTable(t);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Business intelligence and data insights</p>
                </div>
                <button className="btn-secondary"><i className="fas fa-download mr-2"></i>Export All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reports.map((r, idx) => (
                    <div key={idx} className="admin-card" style={{ padding: 20, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: r.bg, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                <i className={r.icon}></i>
                            </div>
                            <div>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{r.title}</h4>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{r.description}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <button style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                View Report <i className="fas fa-arrow-right" style={{ fontSize: 10, marginLeft: 4 }}></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-card" style={{ marginTop: 32 }}>
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Variant Performance</h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Detailed breakdown of sales and inventory by specific variant</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
                            <option>This Month</option>
                            <option>Last 30 Days</option>
                            <option>Year to Date</option>
                        </select>
                        <button className="btn-secondary"><i className="fas fa-file-export mr-2"></i>Export CSV</button>
                    </div>
                </div>
                <div style={{ padding: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ minWidth: 720 }}>
                        <div ref={tableRef} style={{ borderRadius: 8, overflow: 'hidden' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportList;
