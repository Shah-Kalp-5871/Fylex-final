"use client";
import React, { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '@/app/admin/css/datatable.css';
import '@/app/admin/css/custom.css';
import * as api from '@/services/adminApi';

const ReportList = () => {
    const tableRef = useRef(null);
    const [table, setTable] = useState(null);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });
    const [activeReport, setActiveReport] = useState('Product Performance');
    const [reportData, setReportData] = useState([]);

    const reports = [
        { title: 'Sales Report', key: 'sales', description: `Total Revenue: ₹${(stats.totalRevenue||0).toLocaleString()}`, icon: 'fas fa-chart-line', color: '#4f46e5', bg: '#eef2ff' },
        { title: 'Product Performance', key: 'product', description: `${stats.totalProducts||0} Active Products`, icon: 'fas fa-box', color: '#059669', bg: '#ecfdf5' },
        { title: 'Customer Analytics', key: 'customer', description: `${stats.totalOrders||0} Total Orders`, icon: 'fas fa-users', color: '#7c3aed', bg: '#faf5ff' },
        { title: 'Inventory Report', key: 'inventory', description: 'Stock levels, dead stock, re-order points', icon: 'fas fa-warehouse', color: '#d97706', bg: '#fffbeb' },
        { title: 'Financial Summary', key: 'financial', description: 'P&L, tax, refunds, and payment breakdown', icon: 'fas fa-coins', color: '#dc2626', bg: '#fef2f2' },
        { title: 'Traffic & SEO', key: 'traffic', description: 'Page views, bounce rate, top landing pages', icon: 'fas fa-globe', color: '#0ea5e9', bg: '#f0f9ff' },
    ];

    useEffect(() => {
        const fetchDashboard = async () => {
            const statRes = await api.getDashboardReports();
            if (statRes.success && statRes.data) {
                setStats(statRes.data);
            }
        };
        fetchDashboard();
    }, []);

    useEffect(() => {
        const fetchActiveReport = async () => {
            let res = null;
            if (activeReport === 'Sales Report') res = await api.getRevenueReport();
            else if (activeReport === 'Product Performance') res = await api.getVariantPerformanceReport();
            else if (activeReport === 'Customer Analytics') res = await api.getOrdersReport();
            else if (activeReport === 'Inventory Report') res = await api.getInventoryReport();
            else if (activeReport === 'Financial Summary') res = await api.getFinancialReport();
            else if (activeReport === 'Traffic & SEO') res = await api.getTrafficReport();
            
            if (res && res.success) {
                setReportData(res.data);
            } else {
                setReportData([]);
            }
        };
        fetchActiveReport();
    }, [activeReport]);

    useEffect(() => {
        let t = null;
        if (tableRef.current) {
            let columns = [];
            
            if (activeReport === 'Product Performance') {
                columns = [
                    { title: "SKU", field: "sku", minWidth: 140, cssClass: "cell-mono" },
                    { 
                        title: "Product / Variant", field: "product", minWidth: 200,
                        formatter: (cell) => {
                            const d = cell.getRow().getData();
                            return `<div style="font-weight:600;color:#0f172a;font-size:13px">${d.product}</div><div style="font-size:11px;color:#64748b">${d.attributes || ''}</div>`;
                        }
                    },
                    { title: "Units Sold", field: "sold", hozAlign: "center", minWidth: 110,
                      formatter: (cell) => `<span style="font-weight:700;color:#0e1726">${cell.getValue()}</span>`
                    },
                    { 
                        title: "Revenue", field: "revenue", hozAlign: "right", minWidth: 120,
                        formatter: (cell) => `<span style="font-weight:700;color:#059669">₹${Number(cell.getValue()||0).toLocaleString()}</span>`
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
                ];
            } else if (activeReport === 'Sales Report') {
                columns = [
                    { title: "Month", field: "month", minWidth: 150 },
                    { title: "Total Orders", field: "orders", hozAlign: "center", minWidth: 150,
                      formatter: (cell) => `<span style="font-weight:700;color:#0e1726">${cell.getValue()}</span>`
                    },
                    { 
                        title: "Revenue", field: "revenue", hozAlign: "right", minWidth: 150,
                        formatter: (cell) => `<span style="font-weight:700;color:#059669">₹${Number(cell.getValue()||0).toLocaleString()}</span>`
                    }
                ];
            } else if (activeReport === 'Customer Analytics') {
                columns = [
                    { title: "Order ID", field: "orderId", minWidth: 120, cssClass: "cell-mono" },
                    { title: "Customer", field: "customer", minWidth: 150,
                      formatter: (cell) => `<div style="font-weight:600;color:#0f172a;font-size:13px">${cell.getValue()}</div>`
                    },
                    { title: "Email", field: "email", minWidth: 180 },
                    { title: "Status", field: "status", minWidth: 120,
                      formatter: (cell) => {
                        const val = cell.getValue() || '';
                        const isPending = val.toLowerCase() === 'pending';
                        const color = isPending ? '#d97706' : '#059669';
                        const bg = isPending ? '#fffbeb' : '#ecfdf5';
                        return `<span style="background:${bg};color:${color};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${val.toUpperCase()}</span>`;
                      }
                    },
                    { title: "Payment", field: "payment", minWidth: 120,
                      formatter: (cell) => {
                        const val = cell.getValue() || '';
                        const isPaid = val.toLowerCase() === 'paid';
                        const color = isPaid ? '#059669' : '#dc2626';
                        const bg = isPaid ? '#ecfdf5' : '#fef2f2';
                        return `<span style="background:${bg};color:${color};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${val.toUpperCase()}</span>`;
                      }
                    },
                    { 
                        title: "Total", field: "total", hozAlign: "right", minWidth: 120,
                        formatter: (cell) => `<span style="font-weight:700;color:#059669">₹${Number(cell.getValue()||0).toLocaleString()}</span>`
                    }
                ];
            } else if (activeReport === 'Inventory Report') {
                columns = [
                    { title: "SKU", field: "sku", minWidth: 140, cssClass: "cell-mono" },
                    { title: "Product", field: "product", minWidth: 200,
                      formatter: (cell) => `<div style="font-weight:600;color:#0f172a;font-size:13px">${cell.getValue()}</div>`
                    },
                    { title: "Category", field: "category", minWidth: 150 },
                    { 
                        title: "Price", field: "price", hozAlign: "right", minWidth: 100,
                        formatter: (cell) => `₹${Number(cell.getValue()||0).toLocaleString()}`
                    },
                    { 
                        title: "Stock", field: "stock", hozAlign: "center", minWidth: 100,
                        formatter: (cell) => {
                            const v = cell.getValue();
                            const bg = v > 20 ? '#ecfdf5' : (v > 0 ? '#fffbeb' : '#fef2f2');
                            const color = v > 20 ? '#059669' : (v > 0 ? '#d97706' : '#dc2626');
                            return `<span style="background:${bg};color:${color};padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700">${v}</span>`;
                        }
                    }
                ];
            } else if (activeReport === 'Financial Summary') {
                columns = [
                    { title: "Metric", field: "metric", minWidth: 200,
                      formatter: (cell) => `<div style="font-weight:600;color:#0f172a;font-size:14px">${cell.getValue()}</div>`
                    },
                    { 
                        title: "Amount", field: "value", hozAlign: "right", minWidth: 150,
                        formatter: (cell) => `<span style="font-weight:700;color:#059669;font-size:14px">₹${Number(cell.getValue()||0).toLocaleString()}</span>`
                    }
                ];
            } else if (activeReport === 'Traffic & SEO') {
                columns = [
                    { title: "Source", field: "source", minWidth: 180,
                      formatter: (cell) => `<div style="font-weight:600;color:#0f172a;font-size:13px">${cell.getValue()}</div>`
                    },
                    { title: "Visitors", field: "visitors", hozAlign: "center", minWidth: 120,
                      formatter: (cell) => `<span style="font-weight:700;color:#0e1726">${cell.getValue()}</span>`
                    },
                    { title: "Bounce Rate", field: "bounceRate", hozAlign: "center", minWidth: 120,
                      formatter: (cell) => `<span style="font-weight:600;color:#ef4444">${cell.getValue()}</span>`
                    }
                ];
            }

            t = new Tabulator(tableRef.current, {
                data: reportData,
                layout: "fitColumns",
                responsiveLayout: false,
                pagination: "local",
                paginationSize: 10,
                columns: columns
            });
            t.on("tableBuilt", () => {
                setTable(t);
            });
        }
        return () => {
            if (t) t.destroy();
        };
    }, [activeReport]); // re-init table completely when activeReport changes

    useEffect(() => {
        if (table) {
            table.replaceData(reportData).catch(() => {});
        }
    }, [reportData, table]);

    const handleViewReport = (reportTitle) => {
        setActiveReport(reportTitle);
        document.getElementById('report-data-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Business intelligence and data insights</p>
                </div>
                <button className="btn-secondary" onClick={() => table && table.download("csv", `report_export.csv`)}><i className="fas fa-download mr-2"></i>Export All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reports.map((r, idx) => (
                    <div key={idx} className={`admin-card ${activeReport === r.title ? 'ring-2 ring-indigo-500' : ''}`} style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleViewReport(r.title)}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: r.bg, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                <i className={r.icon}></i>
                            </div>
                            <div>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{r.title}</h4>
                                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{r.description}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                View Report <i className="fas fa-arrow-right" style={{ fontSize: 10, marginLeft: 4 }}></i>
                            </button>
                            {activeReport === r.title && <span style={{ fontSize: 10, background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>ACTIVE</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div id="report-data-section" className="admin-card" style={{ marginTop: 32 }}>
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16 }}>{activeReport}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Detailed breakdown of your data</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
                            <option>This Month</option>
                            <option>Last 30 Days</option>
                            <option>Year to Date</option>
                        </select>
                        <button className="btn-secondary" onClick={() => table && table.download("csv", `${activeReport.replace(/ /g, '_')}.csv`)}><i className="fas fa-file-export mr-2"></i>Export CSV</button>
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
