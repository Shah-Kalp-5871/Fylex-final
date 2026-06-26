"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import '@/app/admin/css/custom.css';

const ProductEditPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const { data, addRecord, updateRecord } = useAdminData();
    
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        category: 'Analog',
        description: '',
        stock: 0,
        status: 'active',
        seoTitle: '',
        seoDesc: '',
        images: ''
    });

    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        if (productId && data.products) {
            const product = data.products.find(p => p.id.toString() === productId);
            if (product) {
                setFormData({
                    name: product.name || '',
                    sku: product.sku || '',
                    price: product.price || '',
                    category: product.category || 'Analog',
                    description: product.description || '',
                    stock: product.stock || 0,
                    status: product.status || 'active',
                    seoTitle: product.seoTitle || '',
                    seoDesc: product.seoDesc || '',
                    images: product.images || ''
                });
                setIsEdit(true);
            }
        }
    }, [productId, data.products]);

    const handleSave = () => {
        if (!formData.name) {
            alert("Product name is required.");
            return;
        }

        if (isEdit) {
            updateRecord('products', parseInt(productId), {
                ...formData,
                price: Number(formData.price)
            });
        } else {
            addRecord('products', {
                ...formData,
                price: Number(formData.price),
                type: 'Physical'
            });
        }
        
        router.push('/admin/products');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button 
                        onClick={() => router.push('/admin/products')}
                        style={{ 
                            width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'
                        }}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                            {isEdit ? `Modifying: ${formData.name}` : 'Fill in the details to create a new product listing'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-secondary" onClick={() => router.push('/admin/products')}>Discard</button>
                    <button className="btn-primary" onClick={handleSave}>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                        {isEdit ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-card">
                        <div className="admin-card-header"><h3>General Information</h3></div>
                        <div className="admin-card-body" style={{ padding: 24 }}>
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input 
                                        type="text" className="form-control" placeholder="e.g. Luxury Watch Alpha"
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        className="form-control" rows="6" placeholder="Write a detailed product description..."
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header"><h3>Pricing & Inventory</h3></div>
                        <div className="admin-card-body" style={{ padding: 24 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label>Base Price (₹)</label>
                                    <input 
                                        type="number" className="form-control" placeholder="0.00"
                                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SKU (Stock Keeping Unit)</label>
                                    <input 
                                        type="text" className="form-control" placeholder="e.g. WATCH-BLK-42"
                                        value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Initial Stock</label>
                                    <input 
                                        type="number" className="form-control" placeholder="0"
                                        value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select 
                                        className="form-control" 
                                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header"><h3>Search Engine Optimization</h3></div>
                        <div className="admin-card-body" style={{ padding: 24 }}>
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label>SEO Meta Title</label>
                                    <input 
                                        type="text" className="form-control" placeholder="SEO optimized title"
                                        value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SEO Meta Description</label>
                                    <textarea 
                                        className="form-control" rows="3" placeholder="SEO meta description..."
                                        value={formData.seoDesc} onChange={e => setFormData({...formData, seoDesc: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="admin-card">
                        <div className="admin-card-header"><h3>Organization</h3></div>
                        <div className="admin-card-body" style={{ padding: 24 }}>
                            <div className="form-group">
                                <label>Category</label>
                                <select 
                                    className="form-control"
                                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option>Analog</option>
                                    <option>Smartwatch</option>
                                    <option>Digital</option>
                                    <option>Accessories</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header"><h3>Media</h3></div>
                        <div className="admin-card-body" style={{ padding: 24 }}>
                            <div className="form-group">
                                <label>Image URLs</label>
                                <textarea 
                                    className="form-control" rows="4" placeholder="One URL per line..."
                                    value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})}
                                ></textarea>
                                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Multiple images will be added to the product gallery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                <button className="btn-secondary" onClick={() => router.push('/admin/products')}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>
                    <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                    {isEdit ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </div>
    );
};

const ProductEditPage = () => {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading editor...</div>}>
            <ProductEditPageContent />
        </Suspense>
    );
};

export default ProductEditPage;
