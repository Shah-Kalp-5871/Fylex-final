"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import { useToast } from '@/context/ToastContext';
import { getFileUrl } from '@/lib/utils';
import '@/app/admin/css/custom.css';

const EditProductPage = () => {
    const toast = useToast();
    const router = useRouter();
    const params = useParams();
    const productId = params?.id;

    const { data, loading, updateRecord } = useAdminData();

    const categories = data.categories || [];
    const taxClasses = data.taxClasses || [];
    const [tags, setTags] = useState([]);

    const [processing, setProcessing] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        name: '', slug: '', productCode: '',
        shortDesc: '', description: '',
        status: 'draft', productType: 'configurable',

        heroImage: null, // {id, url}
        gallery: [], // [{id, url}]
        tagIds: [],
        specifications: {}, // specId: value
        sku: '',
        price: '',
        qty: '',
        subtitle: '',
        tagline: '',
        bgColor: '#ffffff',
        accentColor: '#c4a35a',
        textColor: '#1a1a1a',
        gradient: '',
        mistColor: '#f8fafc',
        videoUrl: '',
        discoverHeroBgImage: '',
        isFeatured: false
    });

    const [categoryDetails, setCategoryDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedAttributeValues, setSelectedAttributeValues] = useState({}); // attrId: [valIds]
    const [variants, setVariants] = useState([]);
    const [pickerTarget, setPickerTarget] = useState(null); // 'primary' | 'gallery' | {variantIndex, type}
    const [variantImageModal, setVariantImageModal] = useState(null); // { index, name }

    const moveGalleryImage = (index, direction) => {
        const newGallery = [...form.gallery];
        const targetIndex = index + direction;
        if (targetIndex >= 0 && targetIndex < newGallery.length) {
            [newGallery[index], newGallery[targetIndex]] = [newGallery[targetIndex], newGallery[index]];
            setForm(prev => ({ ...prev, gallery: newGallery }));
        }
    };

    const moveVariantGalleryImage = (vIdx, gIdx, direction) => {
        setVariants(prev => {
            const newVariants = [...prev];
            const variant = { ...newVariants[vIdx] };
            const newGallery = [...(variant.gallery || [])];
            const targetIndex = gIdx + direction;
            if (targetIndex >= 0 && targetIndex < newGallery.length) {
                [newGallery[gIdx], newGallery[targetIndex]] = [newGallery[targetIndex], newGallery[gIdx]];
                variant.gallery = newGallery;
                newVariants[vIdx] = variant;
            }
            return newVariants;
        });
    };

    const fetchProductDetails = useCallback(async () => {
        if (!productId) return;
        setProcessing(true);
        
        try {
            const [prodRes, tagsRes] = await Promise.all([
                api.getProduct(productId),
                api.getTags()
            ]);

            if (tagsRes.success) setTags(tagsRes.data);

            if (prodRes.success) {
                const p = prodRes.data;
                
                // 1. Basic Form
                setForm(prev => ({
                    ...prev,
                    name: p.name || '',
                    slug: p.slug || '',
                    productCode: p.productCode || '',
                    sku: p.sku || '',
                    shortDesc: p.shortDescription || '',
                    description: p.description || '',
                    heritageText: p.heritageText || '',
                    status: p.status || 'draft',
                    productType: p.productType || 'configurable',

                    categoryId: p.mainCategoryId?.toString() || '',
                    taxClassId: p.taxClassId?.toString() || '',
                    price: p.price?.toString() || '',
                    qty: p.qty?.toString() || '0',
                    subtitle: p.subtitle || '',
                    tagline: p.tagline || '',
                    bgColor: p.bgColor || '#ffffff',
                    accentColor: p.accentColor || '#c4a35a',
                    textColor: p.textColor || '#1a1a1a',
                    gradient: p.gradient || '',
                    mistColor: p.mistColor || '#f8fafc',
                    videoUrl: p.videoUrl || '',
                    discoverHeroBgImage: p.discoverHeroBgImage || '',
                    isFeatured: p.isFeatured || false,
                    // Hero Image: Prioritize MAIN media from ProductMedia table
                    heroImage: (p.productMedia?.find(pm => pm.type === 'MAIN'))
                        ? { 
                            id: p.productMedia.find(pm => pm.type === 'MAIN').mediaId.toString(),
                            url: p.productMedia.find(pm => pm.type === 'MAIN').media?.url || (p.productMedia.find(pm => pm.type === 'MAIN').media?.fileName ? `/uploads/${p.productMedia.find(pm => pm.type === 'MAIN').media.fileName}` : '')
                          }
                        : (p.heroImage ? { url: p.heroImage.startsWith('http') || p.heroImage.startsWith('/') ? p.heroImage : `/uploads/${p.heroImage}` } : null),
                    // Gallery: Only include GALLERY media from ProductMedia table
                    gallery: (p.productMedia?.length > 0) 
                        ? p.productMedia.filter(pm => pm.type === 'GALLERY').map(pm => ({ 
                            id: pm.mediaId.toString(), 
                            url: pm.media?.url || (pm.media?.fileName ? `/uploads/${pm.media.fileName}` : '')
                        })) 
                        : (p.images || []).filter(img => img !== p.heroImage).map((img, idx) => ({
                            id: `img-${idx}`,
                            url: img.startsWith('http') || img.startsWith('/') ? img : `/uploads/${img}`
                        })),
                    tagIds: p.tags?.map(t => t.tagId.toString()) || [],
                    specifications: p.specifications?.reduce((acc, s) => {
                        acc[s.specificationId.toString()] = s.specificationValueId ? s.specificationValueId.toString() : s.value;
                        return acc;
                    }, {}) || {}
                }));

                // 2. Fetch Category Details
                if (p.mainCategoryId) {
                    const catRes = await api.getCategory(p.mainCategoryId);
                    if (catRes.success) setCategoryDetails(catRes.data);
                }

                // 3. Hydrate Variants
                if (p.variants?.length > 0) {
                    setVariants(p.variants.map(v => ({
                        id: v.id,
                        sku: v.sku,
                        comparePrice: v.comparePrice?.toString() || '',
                        price: v.price?.toString(),
                        stock: v.qty?.toString(),
                        name: v.variantAttributes?.map(va => va.attributeValue?.label || va.attributeValue?.value).join(', ') || v.sku,
                        attributeValues: v.variantAttributes?.map(va => ({
                            attributeId: va.attributeId.toString(),
                            attributeValueId: va.attributeValueId.toString()
                        })) || [],
                        heroImage: v.variantImages?.find(vi => vi.type === 'MAIN')?.media ? {
                            id: v.variantImages.find(vi => vi.type === 'MAIN').mediaId.toString(),
                            url: v.variantImages.find(vi => vi.type === 'MAIN').media.url || `/uploads/${v.variantImages.find(vi => vi.type === 'MAIN').media.fileName}`
                        } : null,
                        gallery: v.variantImages?.filter(vi => vi.type === 'GALLERY').map(vi => ({
                            id: vi.mediaId.toString(),
                            url: vi.media.url || `/uploads/${vi.media.fileName}`
                        })) || [],
                        heroBgImage: v.variantImages?.find(vi => vi.type === 'HERO_BG')?.media ? {
                            id: v.variantImages.find(vi => vi.type === 'HERO_BG').mediaId.toString(),
                            url: v.variantImages.find(vi => vi.type === 'HERO_BG').media.url || `/uploads/${v.variantImages.find(vi => vi.type === 'HERO_BG').media.fileName}`
                        } : null,
                        isSoldConfiguration: v.isSoldConfiguration || false,
                    })));

                    // Hydrate selectedAttributeValues
                    const attrMap = {};
                    p.variants.forEach(v => {
                        v.variantAttributes?.forEach(va => {
                            const aid = va.attributeId.toString();
                            const avid = va.attributeValueId.toString();
                            if (!attrMap[aid]) attrMap[aid] = [];
                            if (!attrMap[aid].includes(avid)) attrMap[aid].push(avid);
                        });
                    });
                    setSelectedAttributeValues(attrMap);
                }
            }
        } catch (err) {
            console.error("Hydration Error:", err);
            toast.error("Failed to load product details.");
        } finally {
            setProcessing(false);
        }
    }, [productId, toast]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryChange = async (e) => {
        const catId = e.target.value;
        setForm(prev => ({ ...prev, categoryId: catId, specifications: {} }));
        setSelectedAttributeValues({});
        setVariants([]);
        
        if (catId) {
            const res = await api.getCategory(catId);
            if (res.success) setCategoryDetails(res.data);
        } else {
            setCategoryDetails(null);
        }
    };

    const handleSpecChange = (specId, value) => {
        setForm(prev => ({
            ...prev,
            specifications: { ...prev.specifications, [specId]: value }
        }));
    };

    const toggleAttributeValue = (attrId, valId) => {
        setSelectedAttributeValues(prev => {
            const current = prev[attrId] || [];
            const valIdStr = valId.toString();
            if (current.includes(valIdStr)) {
                return { ...prev, [attrId]: current.filter(id => id !== valIdStr) };
            } else {
                return { ...prev, [attrId]: [...current, valIdStr] };
            }
        });
    };

    const generateVariants = async () => {
        if (!form.categoryId) return toast.error("Select category first");
        
        const selectedAttrs = [];
        categoryDetails?.attributes?.forEach(attrWrapper => {
            const attr = attrWrapper.attribute;
            const selectedValIds = selectedAttributeValues[attr.id.toString()] || [];
            if (selectedValIds.length > 0) {
                const vals = attr.values.filter(v => selectedValIds.includes(v.id.toString()));
                selectedAttrs.push({
                    attrId: attr.id.toString(),
                    attrName: attr.name,
                    values: vals
                });
            }
        });

        if (selectedAttrs.length === 0) return toast.error("Select at least one attribute value");

        const cartesian = (arrays) => arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);
        const valueArrays = selectedAttrs.map(a => a.values.map(v => ({ attrId: a.attrId, val: v })));
        const combinations = cartesian(valueArrays);

        const newVariants = [];
        
        combinations.forEach((combo, idx) => {
            const comboIds = combo.map(c => c.val.id.toString()).sort().join(',');
            
            const exists = variants.find(v => {
                const vComboIds = v.attributeValues.map(av => av.attributeValueId.toString()).sort().join(',');
                return vComboIds === comboIds;
            });

            if (!exists) {
                const name = combo.map(c => c.val.label || c.val.value).join(', ');
                const skuCodes = combo.map(c => (c.val.code || (c.val.label || c.val.value).substring(0,3).toUpperCase()));
                newVariants.push({
                    id: `new-${Date.now()}-${idx}`,
                    sku: `${form.sku || form.productCode || 'PROD'}-${skuCodes.join('-')}`,
                    comparePrice: '',
                    price: '', 
                    stock: '',
                    name: name,
                    attributeValues: combo.map(c => ({
                        attributeId: c.attrId,
                        attributeValueId: c.val.id.toString()
                    })),
                    heroImage: null,
                    heroBgImage: null,
                    gallery: []
                });
            }
        });

        if (newVariants.length > 0) {
            setVariants(prev => [...prev, ...newVariants]);
            toast.success(`Generated ${newVariants.length} variants`);
        } else {
            toast.info("No new variants to generate");
        }
    };

    const updateVariantField = (idx, field, value) => {
        setVariants(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const removeVariant = (idx) => {
        setVariants(prev => prev.filter((_, i) => i !== idx));
    };

    const handleMediaSelect = (selection) => {
        if (pickerTarget === 'primary') {
            setForm(prev => ({ ...prev, heroImage: selection[0] }));
        } else if (pickerTarget === 'discoverHeroBgImage') {
            setForm(prev => ({ ...prev, discoverHeroBgImage: selection[0]?.url || selection[0] }));
        } else if (pickerTarget === 'gallery') {
            setForm(prev => {
                const existingIds = new Set(prev.gallery.map(g => g.id.toString()));
                const heroId = prev.heroImage?.id?.toString();
                const uniqueNew = selection.filter(s => {
                    const sid = s.id.toString();
                    return !existingIds.has(sid) && sid !== heroId;
                });
                return {
                    ...prev,
                    gallery: [...prev.gallery, ...uniqueNew]
                };
            });
        } else if (typeof pickerTarget === 'object') {
            const { variantIndex, type } = pickerTarget;
            setVariants(prev => {
                const next = [...prev];
                if (type === 'primary') {
                    next[variantIndex].heroImage = selection[0];
                } else if (type === 'background') {
                    next[variantIndex].heroBgImage = selection[0];
                } else {
                    const currentGallery = next[variantIndex].gallery || [];
                    const existingIds = new Set(currentGallery.map(g => g.id.toString()));
                    const heroId = next[variantIndex].heroImage?.id?.toString();
                    const uniqueNew = selection.filter(s => {
                        const sid = s.id.toString();
                        return !existingIds.has(sid) && sid !== heroId;
                    });
                    next[variantIndex].gallery = [...currentGallery, ...uniqueNew];
                }
                return next;
            });
        }
        setPickerTarget(null);
    };

    const removeVariantImage = (vIdx, imgId) => {
        setVariants(prev => {
            const next = [...prev];
            next[vIdx].gallery = next[vIdx].gallery.filter(img => img.id !== imgId);
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.categoryId) return toast.error("Please fill required fields.");

        setSubmitting(true);
        const payload = {
            ...form,
            shortDescription: form.shortDesc,
            videoUrl: form.videoUrl,
            discoverHeroBgImage: form.discoverHeroBgImage,
            mainCategoryId: form.categoryId,
            sku: form.sku || form.productCode || `SKU-${Date.now()}`,
            price: variants.length > 0 
                ? Math.min(...variants.map(v => parseFloat(v.price) || Infinity)).toString()
                : (form.price || '0'),
            qty: variants.length > 0 
                ? variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)
                : (parseInt(form.qty) || 0),
            isFeatured: form.isFeatured,
            tagIds: form.tagIds,
            heroImage: form.heroImage?.url,
            heroImageId: form.heroImage?.id,
            galleryIds: form.gallery.map(g => g.id),
            images: [form.heroImage?.url, ...form.gallery.map(g => g.url)].filter(Boolean),
            specifications: Object.entries(form.specifications).map(([id, val]) => {
                const specItem = categoryDetails?.specGroups?.flatMap(sg => sg.specGroup.specifications).find(s => s.specification.id.toString() === id);
                const isDropdown = specItem?.specification.type === 'select';
                return {
                    specificationId: id,
                    value: isDropdown ? (specItem.specification.values.find(v => v.id.toString() === val)?.value || '') : (val || ''),
                    specificationValueId: isDropdown ? val : null
                };
            }),
            variants: variants.map(v => ({
                ...(v.id?.toString().startsWith('new') ? {} : { id: v.id }),
                sku: v.sku,
                comparePrice: parseFloat(v.comparePrice) || null,
                price: parseFloat(v.price) || 0,
                stock: parseInt(v.stock) || 0,
                attributeValues: v.attributeValues,
                heroImageId: v.heroImage?.id || undefined,
                heroBgImageId: v.heroBgImage?.id || undefined,
                isSoldConfiguration: v.isSoldConfiguration || false,
                galleryIds: v.gallery?.map(g => g.id).filter(id => id != null) || []
            }))
        };

        const success = await updateRecord('products', productId, payload, api.updateProduct);
        setSubmitting(false);
        if (success) {
            toast.success("Product updated successfully!");
            router.push('/admin/products');
        }
    };

    if (processing || loading.categories) return <Loader />;

    return (
        <div className="!mx-auto !px-1 !py-1">
            <div className="!mb-1">
                <PageHeader title="Edit Product" />
            </div>

            <form onSubmit={handleSubmit} className="!space-y-2">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex flex-col md:flex-row min-h-[600px]">
                        {/* Sidebar Tabs */}
                        <div className="w-full md:w-50 bg-gray-50 border-r border-gray-200 !px-2">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: 'fa-info-circle' },
                                { id: 'story', label: 'Story & Copy', icon: 'fa-align-left' },
                                { id: 'taxonomy', label: 'Taxonomy', icon: 'fa-tags' },
                                { id: 'theme', label: 'Visual Theme', icon: 'fa-palette' },
                                { id: 'variants', label: 'Variants', icon: 'fa-cubes' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 !px-2 !py-5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <i className={`fas ${tab.icon} w-5`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 !p-2">
                            {/* 1. Basic Information */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-xl font-bold text-gray-900 border-b !pb-2 !mb-2">Core Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <FormField label="Product Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Fylex Chronograph X" required />
                                        </div>
                                        <FormField label="Slug" name="slug" value={form.slug} onChange={handleChange} placeholder="fylex-chronograph-x" />
                                        <FormField label="Product Code" name="productCode" value={form.productCode} onChange={handleChange} placeholder="FY-CHR-001" />
                                        <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} options={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' },
                                            { value: 'draft', label: 'Draft' }
                                        ]} />
                                        <FormField label="Product Type" name="productType" type="select" value={form.productType} onChange={handleChange} options={[
                                            { value: 'configurable', label: 'Configurable (Variants)' }
                                        ]} />
                                        {form.productType === 'simple' && (
                                            <>
                                                <FormField label="Base Price *" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" required />
                                                <FormField label="Inventory (Qty) *" name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="0" required />
                                            </>
                                        )}
                                        <div className="md:col-span-2 flex items-center gap-2 bg-indigo-50/50 !p-4 rounded-xl border border-indigo-100">
                                            <input 
                                                type="checkbox" 
                                                id="isFeatured" 
                                                name="isFeatured" 
                                                checked={form.isFeatured} 
                                                onChange={handleChange} 
                                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <label htmlFor="isFeatured" className="text-sm font-bold text-indigo-900 cursor-pointer">
                                                Featured Product (Show on Homepage)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Story & Copy */}
                            {activeTab === 'story' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-xl font-bold text-gray-900 border-b !pb-2 !mb-2">Brand Storytelling</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField label="Marketing Tagline" name="tagline" value={form.tagline} onChange={handleChange} placeholder="e.g. A Legacy of Distinction" />
                                        <FormField label="Product Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Exceptional Timepieces" />
                                        <div className="md:col-span-2">
                                            <FormField label="Short Description" name="shortDesc" type="textarea" value={form.shortDesc} onChange={handleChange} rows={1} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField label="Model Stories" name="description" type="textarea" value={form.description} onChange={handleChange} rows={4} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField label="Heritage Story" name="heritageText" type="textarea" value={form.heritageText} onChange={handleChange} rows={3} placeholder="The legacy behind this craftsmanship..." />
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* 3. Taxonomy & Media */}
                            {activeTab === 'taxonomy' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-xl font-bold text-gray-900 border-b !pb-2 !mb-2">Classification & Media</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField label="Main Category *" name="categoryId" type="select" value={form.categoryId} onChange={handleCategoryChange} options={[
                                            { value: '', label: 'Select Category' },
                                            ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
                                        ]} required />

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 !mb-2">Tags</label>
                                            <div className=" flex flex-wrap gap-2 !px-3 bg-gray-50  border border-gray-200 !min-h-[50px]">
                                                {tags.map(tag => (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() => setForm(prev => ({
                                                            ...prev,
                                                            tagIds: prev.tagIds.includes(tag.id.toString())
                                                                ? prev.tagIds.filter(id => id !== tag.id.toString())
                                                                : [...prev.tagIds, tag.id.toString()]
                                                        }))}
                                                        className={`!px-3  rounded-lg text-xs font-medium transition-all ${form.tagIds.includes(tag.id.toString())
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
                                                            }`}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                         {/* Default Product Media */}
                                         <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t pt-6">
                                             <div className="md:col-span-2">
                                                 <label className="block text-sm font-bold text-gray-900 mb-1">Default Product Media</label>
                                                 <p className="text-[10px] text-gray-500 italic mb-4">Images shown on the Discover page before any variant attributes are selected.</p>
                                             </div>
                                             <div>
                                                 <label className="block text-sm font-medium text-gray-700 mb-3">Primary Image</label>
                                                    <div
                                                        onClick={() => setPickerTarget('primary')}
                                                        className="h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-400 transition-all shadow-inner"
                                                    >
                                                        {form.heroImage ? (
                                                            <img src={getFileUrl(form.heroImage.url)} className="w-full h-full object-contain" alt="Preview" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <i className="fas fa-image text-gray-400 text-2xl mb-2"></i>
                                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Select Image</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">Gallery</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {form.gallery.map((img, i) => (
                                                            <div key={i} className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative group">
                                                                <img src={getFileUrl(img.url)} className="w-full h-full object-cover" alt="Gallery" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveGalleryImage(i, -1)}
                                                                        disabled={i === 0}
                                                                        className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                                                                    >
                                                                        <i className="fas fa-chevron-left text-[10px]"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setForm(prev => ({ ...prev, gallery: prev.gallery.filter(g => g.id !== img.id) }))}
                                                                        className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                                                                    >
                                                                        <i className="fas fa-trash-alt text-[10px]"></i>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveGalleryImage(i, 1)}
                                                                        disabled={i === form.gallery.length - 1}
                                                                        className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-700 disabled:opacity-30 hover:bg-gray-100"
                                                                    >
                                                                        <i className="fas fa-chevron-right text-[10px]"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => setPickerTarget('gallery')}
                                                            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:border-indigo-400 transition-all"
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                         </div>

                                    {/* Specifications */}
                                    {categoryDetails && (
                                        <div className="mt-8 border-t pt-8">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                    <i className="fas fa-list-ul text-indigo-600"></i> Category Specifications
                                                </h4>
                                                <p className="text-sm text-gray-500 mb-6 mt-1">
                                                    These specifications are dynamically loaded based on the selected category. You can create or manage them by editing the category in <a href="/admin/categories" target="_blank" className="text-indigo-600 hover:underline">Categories</a>.
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {categoryDetails.specGroups?.map((group) =>
                                                    group.specGroup.specifications?.map((spec, sIdx) => {
                                                        const s = spec.specification;
                                                        return (
                                                            <div key={sIdx}>
                                                                {s.type === 'select' ? (
                                                                    <FormField
                                                                        label={s.name}
                                                                        type="select"
                                                                        value={form.specifications[s.id.toString()] || ''}
                                                                        onChange={(e) => handleSpecChange(s.id.toString(), e.target.value)}
                                                                        options={[{ value: '', label: `Select ${s.name}` }, ...s.values.map(v => ({ value: v.id.toString(), label: v.label || v.value }))]}
                                                                    />
                                                                ) : (
                                                                    <FormField
                                                                        label={s.name}
                                                                        value={form.specifications[s.id.toString()] || ''}
                                                                        onChange={(e) => handleSpecChange(s.id.toString(), e.target.value)}
                                                                        placeholder={s.name}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 4. Visual Theme */}
                            {activeTab === 'theme' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-xl font-bold text-gray-900 border-b !pb-2 !mb-2">UI Theme Customization</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField label="Fonts color (primary)" name="textColor" type="color" value={form.textColor} onChange={handleChange} />
                                        <FormField label="Fonts color (secondary)" name="accentColor" type="color" value={form.accentColor} onChange={handleChange} />
                                        <FormField label="Product Details Page bg color" name="bgColor" type="color" value={form.bgColor} onChange={handleChange} />
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
                                        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Discover Hero Background Image</label>
                                            <p className="text-[10px] text-gray-400 font-medium italic mb-4">Optional background image used only on the Discover hero section. If empty, the system falls back to Page Background color.</p>
                                            <div
                                                onClick={() => setPickerTarget('discoverHeroBgImage')}
                                                className="h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-400 transition-all shadow-inner relative group"
                                            >
                                                {form.discoverHeroBgImage ? (
                                                    <>
                                                        <img src={getFileUrl(form.discoverHeroBgImage)} className="w-full h-full object-cover" alt="Discover Hero Background Preview" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPickerTarget('discoverHeroBgImage');
                                                                }}
                                                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                                                                title="Replace Image"
                                                            >
                                                                <i className="fas fa-exchange-alt text-xs"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setForm(prev => ({ ...prev, discoverHeroBgImage: '' }));
                                                                }}
                                                                className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                                                                title="Remove Image"
                                                            >
                                                                <i className="fas fa-trash-alt text-xs"></i>
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <i className="fas fa-image text-gray-400 text-2xl mb-2"></i>
                                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Select Image</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 5. Variants */}
                            {activeTab === 'variants' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-xl font-bold text-gray-900 border-b !pb-2 !mb-2">Product Variants</h3>
                                    {form.productType === 'configurable' && categoryDetails ? (
                                        <div className="!space-y-6">
                                            <div className="grid grid-cols-1 !gap-4">
                                                {categoryDetails.attributes?.map((attrWrapper, idx) => {
                                                    const attr = attrWrapper.attribute;
                                                    return (
                                                        <div key={idx} className="!p-4 rounded-lg border border-gray-200 bg-white">
                                                            <label className="font-bold text-gray-700 !mb-3 block">{attr.name}</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {attr.values?.map(val => (
                                                                    <button
                                                                        key={val.id}
                                                                        type="button"
                                                                        onClick={() => toggleAttributeValue(attr.id, val.id)}
                                                                        className={`!px-4 !py-2 rounded-lg text-xs font-bold transition-all border ${selectedAttributeValues[attr.id.toString()]?.includes(val.id.toString())
                                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-400'
                                                                            }`}
                                                                    >
                                                                        {val.label || val.value}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={generateVariants}
                                                className="!px-6 !py-3 bg-gray-900 text-white rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
                                            >
                                                <i className="fas fa-magic"></i> Update Configurations
                                            </button>

                                            {variants.length > 0 && (
                                                <div className="mt-8 overflow-x-auto rounded-xl border border-gray-100">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variant</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actual Price</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selling Price</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Media</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sold Config</th>
                                                                <th className="!px-4 !py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {variants.map((variant, vIdx) => (
                                                                <tr key={vIdx} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="!px-4 !py-4 text-sm font-bold text-gray-900">{variant.name}</td>
                                                                    <td className="!px-4 !py-4">
                                                                        <input type="text" value={variant.sku} onChange={(e) => updateVariantField(vIdx, 'sku', e.target.value)} className="w-full bg-white border border-gray-200 rounded !px-2 !py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                                                                    </td>
                                                                    <td className="!px-4 !py-4">
                                                                        <input type="number" value={variant.comparePrice} onChange={(e) => updateVariantField(vIdx, 'comparePrice', e.target.value)} className="w-20 bg-white border border-gray-200 rounded !px-2 !py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                                                                    </td>
                                                                    <td className="!px-4 !py-4">
                                                                        <input type="number" value={variant.price} onChange={(e) => updateVariantField(vIdx, 'price', e.target.value)} className="w-20 bg-white border border-gray-200 rounded !px-2 !py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                                                                    </td>
                                                                    <td className="!px-4 !py-4">
                                                                        <input type="number" value={variant.stock} onChange={(e) => updateVariantField(vIdx, 'stock', e.target.value)} className="w-16 bg-white border border-gray-200 rounded !px-2 !py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                                                                    </td>
                                                                    <td className="!px-4 !py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            {variant.heroImage ? (
                                                                                <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden shrink-0">
                                                                                    <img src={getFileUrl(variant.heroImage?.url || variant.heroImage)} className="w-full h-full object-cover" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
                                                                                    <i className="fas fa-image text-xs"></i>
                                                                                </div>
                                                                            )}
                                                                            <button type="button" onClick={() => setVariantImageModal({ index: vIdx, name: variant.name })} className="!px-3 !py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap">Manage</button>
                                                                        </div>
                                                                    </td>
                                                                    <td className="!px-4 !py-4">
                                                                        <input type="checkbox" checked={variant.isSoldConfiguration || false} onChange={(e) => updateVariantField(vIdx, 'isSoldConfiguration', e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                                                    </td>
                                                                    <td className="!px-4 !py-4 text-right">
                                                                        <button type="button" onClick={() => removeVariant(vIdx)} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fas fa-trash-alt"></i></button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                <i className="fas fa-cubes text-2xl"></i>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Configuration Required</h4>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                                                Select &quot;Configurable&quot; in Basic Info and choose a category with attributes to manage variants.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Footer */}
                    <div className="bg-gray-50 border-t border-gray-200 !px-2 flex items-center justify-between">
                        <div className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                            <i className="fas fa-shield-alt text-indigo-500"></i>
                            All luxury details will be saved securely
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/products')}
                                className="!px-8 !py-4 bg-white text-gray-700 border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="!px-8 !py-4 bg-indigo-600 text-white rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-check-circle"></i> Finalize Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <MediaPickerModal
                isOpen={!!pickerTarget}
                onClose={() => setPickerTarget(null)}
                onSelect={handleMediaSelect}
                multiple={pickerTarget === 'gallery' || (pickerTarget && typeof pickerTarget === 'object' && pickerTarget.type === 'gallery')}
            />

            {/* Variant Image Type Selection Modal */}
            {variantImageModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50" onClick={() => setVariantImageModal(null)}>
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 !p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="!px-6 !py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Manage Variant Images</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Configure media for <span className="text-indigo-600 font-semibold">{variantImageModal.name}</span></p>
                            </div>
                            <button type="button" onClick={() => setVariantImageModal(null)} className="!w-8 !h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {variants[variantImageModal.index]?.heroImage && (
                                <div className="!mb-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest !mb-2 block">Primary Image</label>
                                    <div className="flex gap-2.5">
                                        <div className="relative flex-none !w-24 !h-24 rounded-xl border-2 border-indigo-200 overflow-hidden shadow-sm group/main">
                                            <img src={getFileUrl(variants[variantImageModal.index].heroImage.url || variants[variantImageModal.index].heroImage)} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[9px] font-bold !px-1.5 !py-0.5 rounded shadow-sm group-hover/main:hidden">MAIN</div>
                                            <button type="button" onClick={() => updateVariantField(variantImageModal.index, 'heroImage', null)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-lg hidden group-hover/main:flex items-center justify-center text-white hover:bg-red-600 shadow-sm transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hero Background Preview */}
                            {variants[variantImageModal.index]?.heroBgImage && (
                                <div className="!mb-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest !mb-2 block">Variant Background</label>
                                    <div className="flex gap-2.5">
                                        <div className="relative flex-none !w-24 !h-24 rounded-xl border-2 border-emerald-200 overflow-hidden shadow-sm group/bg">
                                            <img src={getFileUrl(variants[variantImageModal.index].heroBgImage.url || variants[variantImageModal.index].heroBgImage)} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold !px-1.5 !py-0.5 rounded shadow-sm group-hover/bg:hidden">BG</div>
                                            <button type="button" onClick={() => updateVariantField(variantImageModal.index, 'heroBgImage', null)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-lg hidden group-hover/bg:flex items-center justify-center text-white hover:bg-red-600 shadow-sm transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Variant Gallery Preview & Reorder */}
                            {variants[variantImageModal.index]?.gallery?.length > 0 && (
                                <div className="!mb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest !mb-3 block">Display Order</label>
                                    <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-thin">
                                        {variants[variantImageModal.index].gallery.map((img, gIdx) => (
                                            <div key={gIdx} className="relative flex-none !w-16 !h-16 rounded-xl border border-gray-200 overflow-hidden group/item shadow-sm">
                                                <img src={getFileUrl(img.url)} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover/item:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveVariantGalleryImage(variantImageModal.index, gIdx, -1)}
                                                            disabled={gIdx === 0}
                                                            className="!w-5 !h-5 bg-white rounded-lg flex items-center justify-center text-indigo-600 disabled:opacity-30 hover:bg-indigo-50 cursor-pointer shadow-sm"
                                                        ><i className="fas fa-chevron-left text-[8px]"></i></button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariantImage(variantImageModal.index, img.id)}
                                                            className="!w-5 !h-5 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600 cursor-pointer shadow-sm"
                                                        ><i className="fas fa-trash-alt text-[8px]"></i></button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveVariantGalleryImage(variantImageModal.index, gIdx, 1)}
                                                            disabled={gIdx === variants[variantImageModal.index].gallery.length - 1}
                                                            className="!w-5 !h-5 bg-white rounded-lg flex items-center justify-center text-indigo-600 disabled:opacity-30 hover:bg-indigo-50 cursor-pointer shadow-sm"
                                                        ><i className="fas fa-chevron-right text-[8px]"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setPickerTarget({ variantIndex: variantImageModal.index, type: 'primary' });
                                    setVariantImageModal(null);
                                }}
                                className="w-full flex items-center gap-4 !p-4 rounded-xl border border-gray-100 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group/btn cursor-pointer"
                            >
                                <div className="!w-12 !h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition-all">
                                    <i className="fas fa-star text-lg"></i>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Primary Image</div>
                                    <div className="text-xs text-gray-500">Main image for this variant</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setPickerTarget({ variantIndex: variantImageModal.index, type: 'gallery' });
                                    setVariantImageModal(null);
                                }}
                                className="w-full flex items-center gap-4 !p-4 rounded-xl border border-gray-100 hover:border-purple-400 hover:bg-purple-50/50 transition-all group/btn cursor-pointer"
                            >
                                <div className="!w-12 !h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover/btn:bg-purple-600 group-hover/btn:text-white transition-all">
                                    <i className="fas fa-images text-lg"></i>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Add to Gallery</div>
                                    <div className="text-xs text-gray-500">Upload lifestyle or angle shots</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setPickerTarget({ variantIndex: variantImageModal.index, type: 'background' });
                                    setVariantImageModal(null);
                                }}
                                className="w-full flex items-center gap-4 !p-4 rounded-xl border border-gray-100 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group/btn cursor-pointer"
                            >
                                <div className="!w-12 !h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/btn:bg-emerald-600 group-hover/btn:text-white transition-all">
                                    <i className="fas fa-mountain text-lg"></i>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900">Variant Hero Background</div>
                                    <div className="text-xs text-gray-500">Specific backdrop for this variant</div>
                                </div>
                            </button>
                        </div>
                        <div className="!p-4 bg-gray-50/80 border-t border-gray-100 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVariantImageModal(null)}
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest cursor-pointer"
                            >
                                Close Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProductPage;
;
