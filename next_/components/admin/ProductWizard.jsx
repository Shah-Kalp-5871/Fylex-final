"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAdminData } from '@/context/AdminDataContext';
import FormField from './ui/FormField';
import Loader from './ui/Loader';
import ErrorBanner from './ui/ErrorBanner';
import { useRouter } from 'next/navigation';
import * as api from '@/services/adminApi';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { getFileUrl } from '@/lib/utils';

const ProductWizard = () => {
    const router = useRouter();
    const { data: adminData, loading: adminLoading, addRecord, generateVariants, getProductVariants, updateRecord } = useAdminData();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [productId, setProductId] = useState(null);
    const [variants, setVariants] = useState([]);
    
    // Step 1 State: Core Details
    const [coreForm, setCoreForm] = useState({
        name: '',
        subtitle: '',
        tagline: '',
        shortDescription: '',
        description: '',
        heritageText: '',
        price: '0',
        sku: '',
        productCode: '',
        mainCategoryId: '',

        productType: 'configurable',
        // Theme
        bgColor: '#ffffff',
        accentColor: '#000000',
        textColor: '#333333',
        gradient: '',
        mistColor: '#f0f0f0',
        heroImage: null,
        gallery: [],
    });

    const [pickerTarget, setPickerTarget] = useState(null); // 'primary' | 'gallery'

    // Step 2 State: Attribute Selection
    // Structure: { [attributeId]: [valueId1, valueId2] }
    const [selectedAttributes, setSelectedAttributes] = useState({});

    // Step 4 State: Managed variants
    const [editingVariants, setEditingVariants] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ─── Step 1: Create Product ───
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const res = await addRecord('products', {
            ...coreForm,
            slug: coreForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            heroImageId: coreForm.heroImage?.id,
            galleryIds: coreForm.gallery.map(g => g.id),
            images: [coreForm.heroImage?.url, ...coreForm.gallery.map(g => g.url)].filter(Boolean),
        }, api.createProduct);

        if (res) {
            setProductId(res.id);
            setCurrentStep(2);
        }
        setIsSubmitting(false);
    };

    // ─── Step 2: Attribute Toggle ───
    const toggleAttributeValue = (attrId, valueId) => {
        setSelectedAttributes(prev => {
            const current = prev[attrId] || [];
            if (current.includes(valueId)) {
                return { ...prev, [attrId]: current.filter(id => id !== valueId) };
            } else {
                return { ...prev, [attrId]: [...current, valueId] };
            }
        });
    };

    // ─── Step 3: Generate Variants ───
    const combinationCount = useMemo(() => {
        const counts = Object.values(selectedAttributes).map(v => v.length).filter(c => c > 0);
        if (counts.length === 0) return 0;
        return counts.reduce((acc, curr) => acc * curr, 1);
    }, [selectedAttributes]);

    const handleGenerate = async () => {
        if (combinationCount === 0) return alert('Select at least one value per attribute.');
        if (combinationCount > 100) {
            if (!confirm(`This will generate ${combinationCount} variants. Continue?`)) return;
        }

        setIsSubmitting(true);
        const selections = Object.entries(selectedAttributes)
            .filter(([_, valueIds]) => valueIds.length > 0)
            .map(([attributeId, valueIds]) => ({ attributeId, valueIds }));

        const res = await generateVariants(productId, selections);
        if (res) {
            // Fetch the generated variants
            const variantData = await getProductVariants(productId);
            setVariants(variantData);
            setCurrentStep(4);
        }
        setIsSubmitting(false);
    };

    // ─── Step 4: Update Variants ───
    const handleVariantChange = (vId, field, value) => {
        setEditingVariants(prev => ({
            ...prev,
            [vId]: { ...prev[vId], [field]: value }
        }));
    };

    const saveVariant = async (vId) => {
        const updates = editingVariants[vId];
        if (!updates) return;
        await updateRecord('variants', vId, updates, api.updateVariant);
    };

    const handleVariantMediaUpload = async (vId, type, e) => {
        const files = e.target.files;
        if (!files.length) return;

        const formData = new FormData();
        formData.append('type', type);
        Array.from(files).forEach(file => formData.append('files', file));

        const res = await api.uploadVariantMedia(vId, formData);
        if (res.success) {
            alert('Media uploaded successfully');
            // Optionally refresh variants
            const variantData = await getProductVariants(productId);
            setVariants(variantData);
        }
    };

    const handleFinish = () => {
        router.push('/admin/products');
    };

    // ─── Renderers ───

    const renderStep1 = () => (
        <form onSubmit={handleCreateProduct} className="admin-card">
            <div className="admin-card-header"><h3>Step 1: Product Details & Theme</h3></div>
            <div className="admin-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <FormField label="Product Name" name="name" value={coreForm.name} onChange={e => setCoreForm({...coreForm, name: e.target.value})} required />
                    <FormField label="Subtitle" name="subtitle" value={coreForm.subtitle} onChange={e => setCoreForm({...coreForm, subtitle: e.target.value})} />
                    <FormField label="Tagline" name="tagline" value={coreForm.tagline} onChange={e => setCoreForm({...coreForm, tagline: e.target.value})} />
                    <FormField label="Product Code (for SKUs)" name="productCode" value={coreForm.productCode} onChange={e => setCoreForm({...coreForm, productCode: e.target.value})} placeholder="e.g. DJ" />
                    <FormField label="Price" type="number" name="price" value={coreForm.price} onChange={e => setCoreForm({...coreForm, price: e.target.value})} />
                    
                    <FormField label="Category" type="select" name="mainCategoryId" value={coreForm.mainCategoryId} 
                        onChange={e => setCoreForm({...coreForm, mainCategoryId: e.target.value})} 
                        options={adminData.categories.map(c => ({ value: c.id, label: c.name }))} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <FormField label="BG Color" type="color" name="bgColor" value={coreForm.bgColor} onChange={e => setCoreForm({...coreForm, bgColor: e.target.value})} />
                        <FormField label="Accent Color" type="color" name="accentColor" value={coreForm.accentColor} onChange={e => setCoreForm({...coreForm, accentColor: e.target.value})} />
                        <FormField label="Text Color" type="color" name="textColor" value={coreForm.textColor} onChange={e => setCoreForm({...coreForm, textColor: e.target.value})} />
                        <FormField label="Mist Color" type="color" name="mistColor" value={coreForm.mistColor} onChange={e => setCoreForm({...coreForm, mistColor: e.target.value})} />
                    </div>
                    <FormField label="Short Description" type="textarea" value={coreForm.shortDescription} onChange={e => setCoreForm({...coreForm, shortDescription: e.target.value})} />
                    <FormField label="Model Stories" type="textarea" value={coreForm.description} onChange={e => setCoreForm({...coreForm, description: e.target.value})} />
                    <FormField label="Heritage Text" type="textarea" value={coreForm.heritageText} onChange={e => setCoreForm({...coreForm, heritageText: e.target.value})} />
                </div>
                
                {/* Default Product Media */}
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #eee', paddingTop: 20 }}>
                    <h4 style={{ marginBottom: 5 }}>Default Product Media</h4>
                    <p style={{ fontSize: 10, color: '#888', marginBottom: 15 }}>Shown on the Discover page before any variant attributes are selected.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Primary Image</label>
                            <div 
                                onClick={() => setPickerTarget('primary')}
                                style={{ 
                                    height: 150, borderRadius: 8, border: '2px dashed #ddd', background: '#f9f9f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden'
                                }}
                            >
                                {coreForm.heroImage ? (
                                    <img src={getFileUrl(coreForm.heroImage.url)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa' }}>
                                        <i className="fas fa-image" style={{ fontSize: 24, marginBottom: 5 }}></i>
                                        <div style={{ fontSize: 10 }}>SELECT</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Gallery</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {coreForm.gallery.map((img, i) => (
                                    <div key={i} style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #eee', overflow: 'hidden', position: 'relative' }}>
                                        <img src={getFileUrl(img.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery" />
                                        <button 
                                            type="button" 
                                            onClick={() => setCoreForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }))}
                                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 8, cursor: 'pointer' }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    type="button"
                                    onClick={() => setPickerTarget('gallery')}
                                    style={{ 
                                        width: 80, height: 80, borderRadius: 8, border: '2px dashed #ddd', background: '#f9f9f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa'
                                    }}
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="admin-card-footer">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Next: Select Attributes'}
                </button>
            </div>
        </form>
    );

    const renderStep2 = () => (
        <div className="admin-card">
            <div className="admin-card-header"><h3>Step 2: Configure Attributes</h3></div>
            <div className="admin-card-body">
                {adminData.attributes.filter(a => a.isVariant).map(attr => (
                    <div key={attr.id} style={{ marginBottom: 25 }}>
                        <h4 style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 5 }}>{attr.name}</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {attr.values.map(val => (
                                <button 
                                    key={val.id}
                                    type="button"
                                    onClick={() => toggleAttributeValue(attr.id, val.id)}
                                    className={selectedAttributes[attr.id]?.includes(val.id) ? 'btn-primary' : 'btn-secondary'}
                                    style={{ fontSize: 12, padding: '5px 15px' }}
                                >
                                    {val.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="admin-card-footer">
                <button onClick={() => setCurrentStep(3)} className="btn-primary">Review Combinations</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="admin-card animate-scale-in" style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
            <div className="admin-card-body" style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: 40, color: 'var(--admin-primary)', marginBottom: 20 }}>
                    <i className="fas fa-layer-group"></i>
                </div>
                <h2>Ready to Generate?</h2>
                <p style={{ color: '#666', margin: '15px 0 30px' }}>
                    Based on your selections, we will create <strong>{combinationCount}</strong> unique variants for this product.
                </p>
                
                {combinationCount > 0 ? (
                    <button onClick={handleGenerate} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Generating...' : `Generate ${combinationCount} Variants`}
                    </button>
                ) : (
                    <ErrorBanner message="No combinations to generate. Go back and select attributes." />
                )}
                
                <button onClick={() => setCurrentStep(2)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                    Go Back
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3>Step 4: Manage Variant Data</h3>
                <p style={{ fontSize: 12, color: '#666' }}>Set unique prices, stock, and upload images for each combination.</p>
            </div>
            <div className="admin-card-body" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Combination</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Media</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map(v => (
                            <tr key={v.id}>
                                <td style={{ fontSize: 11, fontWeight: 700 }}>
                                    {v.variantAttributes.map(va => va.attributeValue.label).join(' / ')}
                                </td>
                                <td>
                                    <input 
                                        type="text" 
                                        defaultValue={v.sku} 
                                        className="form-control" 
                                        style={{ width: 140, fontSize: 11 }}
                                        onChange={(e) => handleVariantChange(v.id, 'sku', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        defaultValue={v.price} 
                                        className="form-control" 
                                        style={{ width: 100, fontSize: 11 }}
                                        onChange={(e) => handleVariantChange(v.id, 'price', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        defaultValue={v.qty} 
                                        className="form-control" 
                                        style={{ width: 80, fontSize: 11 }}
                                        onChange={(e) => handleVariantChange(v.id, 'qty', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <label className="btn-secondary" style={{ fontSize: 10, padding: '2px 5px', cursor: 'pointer' }}>
                                            Hero <input type="file" hidden onChange={e => handleVariantMediaUpload(v.id, 'HERO', e)} />
                                        </label>
                                        <label className="btn-secondary" style={{ fontSize: 10, padding: '2px 5px', cursor: 'pointer' }}>
                                            Gallery <input type="file" multiple hidden onChange={e => handleVariantMediaUpload(v.id, 'GALLERY', e)} />
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <button onClick={() => saveVariant(v.id)} className="btn-primary" style={{ padding: '2px 10px', fontSize: 10 }}>Save</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="admin-card-footer">
                <button onClick={handleFinish} className="btn-primary">Finish & Go to Products</button>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {[1, 2, 3, 4].map(s => (
                    <div key={s} style={{ 
                        flex: 1, height: 4, borderRadius: 2, 
                        background: currentStep >= s ? 'var(--admin-primary)' : '#ddd',
                        transition: 'all 0.3s ease'
                    }}></div>
                ))}
            </div>
            
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <MediaPickerModal 
                isOpen={!!pickerTarget}
                onClose={() => setPickerTarget(null)}
                onSelect={(selection) => {
                    if (pickerTarget === 'primary') {
                        setCoreForm(prev => ({ ...prev, heroImage: selection[0] }));
                    } else if (pickerTarget === 'gallery') {
                        setCoreForm(prev => {
                            const existingIds = new Set(prev.gallery.map(g => g.id));
                            const heroId = prev.heroImage?.id;
                            const uniqueNew = selection.filter(s => !existingIds.has(s.id) && s.id !== heroId);
                            return { ...prev, gallery: [...prev.gallery, ...uniqueNew] };
                        });
                    }
                    setPickerTarget(null);
                }}
                multiple={pickerTarget === 'gallery'}
            />
        </div>
    );
};

export default ProductWizard;
