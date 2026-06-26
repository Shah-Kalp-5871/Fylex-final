"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import { useToast } from '@/context/ToastContext';
import { getFileUrl } from '@/lib/utils';
import '@/app/admin/css/custom.css';

const ProductEditPageContent = () => {
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const { data, loading, updateRecord } = useAdminData();

    const categories = data.categories || [];

    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [form, setForm] = useState({
        name: '', slug: '', tagline: '', subtitle: '',
        shortDesc: '', longDesc: '', heritageText: '',
        sku: '', basePrice: '', stock: '',
        categoryId: '', isActive: true,
        heroImage: null, 
        gallery: [],
        bgColor: '#ffffff', accentColor: '#6366f1', textColor: '#1e293b', 
        gradient: '', mistColor: '#f8fafc'
    });
    const [availableTags, setAvailableTags] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [pickerTarget, setPickerTarget] = useState(null);
    const [variantImageModal, setVariantImageModal] = useState(null);

    useEffect(() => {
        if (productId && data.products && data.products.length > 0) {
            const p = data.products.find(item => item.id.toString() === productId);
            if (p) {
                setForm({
                    name: p.name || '',
                    slug: p.slug || '',
                    tagline: p.tagline || '',
                    subtitle: p.subtitle || '',
                    shortDesc: p.shortDescription || '',
                    longDesc: p.description || '',
                    heritageText: p.heritageText || '',
                    sku: p.sku || '',
                    basePrice: p.price?.toString() || '',
                    stock: p.qty?.toString() || '0',

                    categoryId: p.mainCategoryId?.toString() || '',
                    isActive: p.status === 'active',
                    heroImage: p.heroImage ? { url: p.heroImage } : (p.images?.length > 0 ? { url: p.images[0] } : null),
                    gallery: p.images?.slice(1).map(url => ({ url })) || [],
                    bgColor: p.bgColor || '#ffffff',
                    accentColor: p.accentColor || '#6366f1',
                    textColor: p.textColor || '#1e293b',
                    gradient: p.gradient || '',
                    mistColor: p.mistColor || '#f8fafc',
                    tagIds: p.tags ? p.tags.map(t => (t.id || t.tagId || t).toString()) : [],
                    isFeatured: !!p.isFeatured
                });
            }
        }
    }, [productId, data.products]);

    const handleMediaSelect = (selection) => {
        if (pickerTarget === 'primary') {
            setForm(prev => ({ ...prev, heroImage: selection[0] }));
        } else if (pickerTarget === 'gallery') {
            setForm(prev => ({
                ...prev,
                gallery: [...prev.gallery, ...selection].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i)
            }));
        }
        setPickerTarget(null);
    };

    const moveGalleryImage = (index, direction) => {
        const newGallery = [...form.gallery];
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < newGallery.length) {
            [newGallery[index], newGallery[targetIndex]] = [newGallery[targetIndex], newGallery[index]];
            setForm(prev => ({ ...prev, gallery: newGallery }));
        }
    };

    useEffect(() => {
        const fetchTags = async () => {
            const res = await api.getTags();
            if (res.success) setAvailableTags(res.data);
        };
        fetchTags();
    }, []);

    const handleAddTag = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.target.value.trim();
            if (!value) return;

            const existingTag = availableTags.find(t => t.name.toLowerCase() === value.toLowerCase());
            if (existingTag) {
                if (!form.tagIds.includes(existingTag.id.toString())) {
                    setForm(prev => ({
                        ...prev,
                        tagIds: [...prev.tagIds, existingTag.id.toString()]
                    }));
                }
            } else {
                toast.error(`Tag "${value}" not found`);
            }
            e.target.value = '';
        }
    };

    const removeTag = (index) => {
        setForm(prev => ({
            ...prev,
            tagIds: prev.tagIds.filter((_, i) => i !== index)
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'isActive' ? value === 'active' : value),
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
        }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const steps = ['basic', 'desc', 'taxonomy', 'theme'];

    const validateStep = (step) => {
        const errs = {};
        if (step === 'basic') {
            if (!form.name.trim()) errs.name = 'Product name is required';
            if (!form.basePrice || isNaN(form.basePrice)) errs.basePrice = 'Valid price is required';
        }
        if (step === 'taxonomy') {
            if (!form.categoryId) errs.categoryId = 'Category is required';

        }
        return errs;
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        const currentIndex = steps.indexOf(activeTab);
        const errs = validateStep(activeTab);

        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            toast.error("Please fix the errors before continuing.");
            return;
        }

        if (currentIndex < steps.length - 1) {
            setActiveTab(steps[currentIndex + 1]);
        } else {
            handleFinalUpdate();
        }
    };

    const handleFinalUpdate = async () => {
        setSubmitting(true);
        const payload = {
            name: form.name,
            slug: form.slug,
            sku: form.sku,
            price: parseFloat(form.basePrice) || 0,
            qty: parseInt(form.stock) || 0,
            productType: 'configurable',

            mainCategoryId: form.categoryId,
            shortDescription: form.shortDesc,
            description: form.longDesc,
            tagline: form.tagline,
            subtitle: form.subtitle,
            heritageText: form.heritageText,
            heroImage: form.heroImage?.url,
            images: [form.heroImage?.url, ...form.gallery.map(g => g.url)].filter(Boolean),
            bgColor: form.bgColor,
            accentColor: form.accentColor,
            textColor: form.textColor,
            gradient: form.gradient,
            mistColor: form.mistColor,
            status: form.isActive ? 'active' : 'inactive',
            tagIds: form.tagIds,
            isFeatured: form.isFeatured
        };

        await updateRecord('products', productId, payload, api.updateProduct);
        setSubmitting(false);
        router.push('/admin/products');
    };

    if (loading.categories || (productId && loading.products)) {
        return <Loader message="Loading product record..." />;
    }

    const getButtonText = () => {
        if (submitting) return "Updating Product...";
        switch (activeTab) {
            case 'basic': return "Update Basic Info (Go to Story)";
            case 'desc': return "Update Story (Go to Taxonomy)";
            case 'taxonomy': return "Update Taxonomy (Go to Visuals)";
            case 'theme': return "Confirm & Update Product in DB";
            default: return "Update Product";
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 pb-20 animate-fade-in">
            <PageHeader
                title="Edit Product"
                subtitle={`Modifying: ${form.name || productId}`}
            />

            <div className="admin-card admin-card-wide">
                <div className="admin-card-header">
                    <h3 className="flex items-center gap-2">
                        <i className="fas fa-edit text-indigo-600"></i>
                        Edit Product Details
                    </h3>
                </div>

                <div className="admin-card-body">
                    <div className="edit-layout">
                        {/* Sidebar Tabs */}
                        <div className="edit-sidebar">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: 'fa-info-circle' },
                                { id: 'desc', label: 'Story & Copy', icon: 'fa-align-left' },
                                { id: 'taxonomy', label: 'Taxonomy', icon: 'fa-tags' },
                                { id: 'theme', label: 'Visual Theme', icon: 'fa-palette' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    disabled={submitting}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                >
                                    <i className={`fas ${tab.icon}`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Form Content */}
                        <div style={{ flex: 1 }}>
                            <form onSubmit={handleNextStep} className="space-y-8">
                                {activeTab === 'basic' && (
                                    <div className="space-y-6 animate-slide-up">
                                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                                            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs">1</span>
                                            Core Specifications
                                        </h4>
                                        <div className="form-grid-2">
                                            <div className="col-span-full">
                                                <FormField label="Product Title" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Fylex Chronograph SE" required error={formErrors.name} />
                                            </div>
                                            <FormField label="Base Price" name="basePrice" type="number" value={form.basePrice} onChange={handleChange} placeholder="15999" required error={formErrors.basePrice} />
                                            <FormField label="Initial Stock Qty" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="50" />
                                            <FormField label="SKU / Model Number" name="sku" value={form.sku} onChange={handleChange} placeholder="FY-CHR-001" />
                                            <FormField label="Publishing Status" name="isActive" type="select" value={form.isActive ? 'active' : 'inactive'} onChange={handleChange} options={[{ value: 'active', label: 'Active (Public)' }, { value: 'inactive', label: 'Inactive (Private)' }]} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'desc' && (
                                    <div className="space-y-6 animate-slide-up">
                                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                                            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs">2</span>
                                            Brand Storytelling
                                        </h4>
                                        <div className="form-grid-2">
                                            <FormField label="Marketing Tagline" name="tagline" value={form.tagline} onChange={handleChange} placeholder="Legacy of Excellence..." />
                                            <FormField label="Product Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Limited Edition / Premium Finish" />
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <FormField label="Short Summary (Hover/Card)" name="shortDesc" type="textarea" value={form.shortDesc} onChange={handleChange} rows={2} />
                                                <FormField label="Main Product Description" name="longDesc" type="textarea" value={form.longDesc} onChange={handleChange} rows={5} />
                                                <FormField label="Heritage Story" name="heritageText" type="textarea" value={form.heritageText} onChange={handleChange} rows={3} placeholder="The legacy behind this craftsmanship..." />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'taxonomy' && (
                                    <div className="space-y-6 animate-slide-up">
                                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                                            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs">3</span>
                                            Classification
                                        </h4>
                                        <div className="form-grid-2">

                                            <FormField
                                                label="Primary Category"
                                                name="categoryId"
                                                type="select"
                                                value={form.categoryId}
                                                onChange={handleChange}
                                                options={[{ value: '', label: 'Select Category' }, ...categories.map(c => ({ value: c.id.toString(), label: c.name }))]}
                                                required
                                                error={formErrors.categoryId}
                                            />
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <FormField label="Primary Display Image URL" name="heroImage" value={form.heroImage} onChange={handleChange} placeholder="https://res.cloudinary.com/..." />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product Tags</label>
                                                <div className="tags-input">
                                                    {form.tagIds.map((id, i) => {
                                                        const tag = availableTags.find(t => t.id.toString() === id);
                                                        return (
                                                            <div key={i} className="tag-chip">
                                                                {tag ? tag.name : id}
                                                                <span onClick={() => removeTag(i)}>&times;</span>
                                                            </div>
                                                        );
                                                    })}
                                                    <input
                                                        type="text"
                                                        placeholder="Type tag name and press Enter..."
                                                        onKeyDown={handleAddTag}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Available tags: {availableTags.map(t => t.name).join(', ')}</p>

                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        id="isFeatured"
                                                        name="isFeatured"
                                                        checked={form.isFeatured}
                                                        onChange={handleChange}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <label htmlFor="isFeatured" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                                        Mark as Featured Product
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'theme' && (
                                    <div className="space-y-6 animate-slide-up">
                                        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                                            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs">4</span>
                                            UI Theme Customization
                                        </h4>
                                        <div className="form-grid-2">
                                            <FormField label="Page Background" name="bgColor" type="color" value={form.bgColor} onChange={handleChange} />
                                            <FormField label="Brand Accent" name="accentColor" type="color" value={form.accentColor} onChange={handleChange} />
                                            <FormField label="Interface Text" name="textColor" type="color" value={form.textColor} onChange={handleChange} />
                                            <FormField label="Surface Tint (Mist)" name="mistColor" type="color" value={form.mistColor} onChange={handleChange} />
                                            <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                            <label className="block text-sm font-bold text-gray-900 mb-3">Background Gradient (Linear)</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Color 1 (Top Left)</label>
                                                    <input 
                                                        type="color" 
                                                        className="w-full h-10 rounded cursor-pointer border border-gray-300"
                                                        onChange={(e) => {
                                                            const c1 = e.target.value;
                                                            const c2 = form.gradient?.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g)?.[1] || '#ffffff';
                                                            setForm(prev => ({ ...prev, gradient: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }));
                                                        }}
                                                        value={form.gradient?.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g)?.[0] || '#f5f7fa'}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Color 2 (Bottom Right)</label>
                                                    <input 
                                                        type="color" 
                                                        className="w-full h-10 rounded cursor-pointer border border-gray-300"
                                                        onChange={(e) => {
                                                            const c1 = form.gradient?.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g)?.[0] || '#f5f7fa';
                                                            const c2 = e.target.value;
                                                            setForm(prev => ({ ...prev, gradient: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }));
                                                        }}
                                                        value={form.gradient?.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g)?.[1] || '#c3cfe2'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <FormField label="Or write custom CSS Gradient" name="gradient" value={form.gradient} onChange={handleChange} placeholder="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" />
                                            </div>
                                            {form.gradient && (
                                                <div className="mt-3 h-12 rounded-lg border border-gray-200 shadow-inner" style={{ background: form.gradient }}></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                )}

                                <div className="admin-modal-footer mt-10">
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i> Updating...</> : <><i className={`fas ${activeTab === 'theme' ? 'fa-save' : 'fa-arrow-right'} mr-2`}></i> {getButtonText()}</>}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => router.push('/admin/products')}
                                    >
                                        Discard Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <MediaPickerModal 
                isOpen={!!pickerTarget} 
                onClose={() => setPickerTarget(null)} 
                onSelect={handleMediaSelect}
                multiple={pickerTarget === 'gallery'}
            />
        </div>
    );
};

const ProductEditPage = () => {
    return (
        <Suspense fallback={<Loader message="Loading Editor..." />}>
            <ProductEditPageContent />
        </Suspense>
    );
};

export default ProductEditPage;
