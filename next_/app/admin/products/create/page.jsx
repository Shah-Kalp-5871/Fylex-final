"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import * as api from '@/services/adminApi';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import { useToast } from '@/context/ToastContext';
import { getFileUrl } from '@/lib/utils';
import '@/app/admin/css/custom.css';

const AddProductPage = () => {
    const toast = useToast();
    const router = useRouter();
    const { data, loading, addRecord } = useAdminData();
    const categories = data.categories || [];
    const taxClasses = data.taxClasses || [];
    const [tags, setTags] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [form, setForm] = useState({
        name: '', slug: '', tagline: '', subtitle: '',
        shortDesc: '', description: '', heritageText: '',
        status: 'draft', productType: 'configurable',
        brandId: '', categoryId: '', taxClassId: '',
        heroImage: null,
        gallery: [],
        tagIds: [],
        specifications: {},
        price: '', qty: '',
        bgColor: '#ffffff', accentColor: '#c4a35a', textColor: '#1a1a1a',
        gradient: '', mistColor: '#f8fafc', videoUrl: '',
        discoverHeroBgImage: '',
        isFeatured: false
    });

    const [categoryDetails, setCategoryDetails] = useState(null);
    const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
    const [variants, setVariants] = useState([]);
    const [pickerTarget, setPickerTarget] = useState(null);
    const [variantImageModal, setVariantImageModal] = useState(null);

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setIsInitialized(true);
    }, []);

    const handleTabChange = (targetTab) => {
        if (targetTab === activeTab) return;
        
        if (!form.name || !form.categoryId || (form.productType === 'simple' && !form.price)) {
            toast.error("Please fill required fields (Name, Category, and Price for simple products) before proceeding.");
            return;
        }
        
        toast.info("Please click 'Save & Continue' at the bottom to proceed to the next steps.");
    };

    useEffect(() => {
        const fetchTags = async () => {
            const res = await api.getTags();
            if (res.success) setTags(res.data);
        };
        fetchTags();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
        }));
    };

    const handleCategoryChange = async (e) => {
        const catId = e.target.value;
        setForm(prev => ({ ...prev, categoryId: catId, specifications: {} }));
        setSelectedAttributeValues({});
        setVariants([]);

        if (catId) {
            const res = await api.getCategory(catId);
            if (res.success) {
                setCategoryDetails(res.data);
            }
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
            if (current.includes(valId)) {
                return { ...prev, [attrId]: current.filter(id => id !== valId) };
            } else {
                return { ...prev, [attrId]: [...current, valId] };
            }
        });
    };

    const handleMediaSelect = (selection) => {
        if (pickerTarget === 'primary') {
            setForm(prev => ({ ...prev, heroImage: selection[0] }));
        } else if (pickerTarget === 'discoverHeroBgImage') {
            setForm(prev => ({ ...prev, discoverHeroBgImage: selection[0]?.url || selection[0] }));
        } else if (pickerTarget === 'gallery') {
            setForm(prev => ({
                ...prev,
                gallery: [...prev.gallery, ...selection].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
            }));
        } else if (typeof pickerTarget === 'object') {
            const { variantIndex, type } = pickerTarget;
            setVariants(prev => {
                const newVariants = [...prev];
                if (type === 'primary') {
                    newVariants[variantIndex].heroImage = selection[0];
                } else if (type === 'background') {
                    newVariants[variantIndex].heroBgImage = selection[0];
                } else {
                    newVariants[variantIndex].gallery = [...(newVariants[variantIndex].gallery || []), ...selection].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
                }
                return newVariants;
            });
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

    const removeVariantImage = (vIdx, imgId) => {
        setVariants(prev => {
            const next = [...prev];
            next[vIdx].gallery = next[vIdx].gallery.filter(img => img.id !== imgId);
            return next;
        });
    };

    const generateVariants = () => {
        if (!categoryDetails || !categoryDetails.attributes) return;

        const arrays = categoryDetails.attributes
            .filter(ca => selectedAttributeValues[ca.attribute.id]?.length > 0)
            .map(ca => ({
                id: ca.attribute.id,
                name: ca.attribute.name,
                values: ca.attribute.values.filter(v => selectedAttributeValues[ca.attribute.id].includes(v.id))
            }));

        if (arrays.length === 0) {
            toast.error("Please select at least one value for an attribute.");
            return;
        }

        const cartesian = arrays.reduce((acc, curr) => {
            return acc.flatMap(a => curr.values.map(b => [...a, { attrId: curr.id, attrName: curr.name, valId: b.id, valLabel: b.label }]));
        }, [[]]);

        const newVariants = cartesian.map(combo => {
            const name = combo.map(c => c.valLabel).join(' / ');
            const skuSuffix = combo.map(c => c.valLabel.substring(0, 3).toUpperCase()).join('-');
            return {
                name,
                sku: `${form.sku || 'SKU'}-${skuSuffix}`,
                comparePrice: '',
                price: '',
                stock: '0',
                attributeValues: combo.map(c => ({
                    attributeId: c.attrId,
                    attributeValueId: c.valId
                })),
                heroImage: null,
                gallery: [],
                isSoldConfiguration: false,
                id: Math.random().toString(36).substr(2, 9)
            };
        });

        const existingKeys = new Set(variants.map(v => 
            v.attributeValues.map(av => av.attributeValueId).sort().join('-')
        ));
        
        const toAdd = newVariants.filter(v => 
            !existingKeys.has(v.attributeValues.map(av => av.attributeValueId).sort().join('-'))
        );
        
        if (toAdd.length > 0) {
            setVariants(prev => [...prev, ...toAdd]);
            toast.success(`Generated ${toAdd.length} new variants`);
        } else {
            toast.info("No new variants to generate");
        }
    };

    const updateVariantField = (index, field, value) => {
        setVariants(prev => {
            const newVariants = [...prev];
            newVariants[index][field] = value;
            return newVariants;
        });
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.categoryId || (form.productType === 'simple' && !form.price)) {
            toast.error("Please fill required fields: Name, Category, and Price (if simple).");
            return;
        }

        setSubmitting(true);
        const { shortDesc, categoryId, ...formData } = form;
        const payload = {
            ...formData,
            status: 'draft',
            mainCategoryId: form.categoryId,
            sku: form.sku || form.productCode || `SKU-${Date.now()}`,
            price: (parseFloat(form.price) || 0).toString(),
            qty: parseInt(form.qty) || 0,
            isFeatured: form.isFeatured,
            specifications: [],
            variants: []
        };

        const success = await addRecord('products', payload, api.createProduct);
        setSubmitting(false);

        if (success) {
            toast.success("Product draft saved! Redirecting to next step...");
            router.push(`/admin/products/edit/${success.id || success.data?.id}?step=story`);
        }
    };

    if (loading.brands || loading.categories) return <Loader />;

    return (
        <div className="!mx-auto !px-1 !py-1 ">
            <div className="!mb-1">
                <PageHeader title="Add New Product" />
                {/* <PageHeader title="Add New Product" subtitle="Create unique items for your premium catalog" /> */}
            </div>

            <div className="!space-y-2">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex flex-col md:flex-row min-h-[600px]">
                        {/* Sidebar Tabs */}
                        <div className="w-full md:w-50 bg-gray-50 border-r border-gray-200 !px-2">
                            {[
                                { id: 'basic', label: 'Step 1: Basic Info', icon: 'fa-info-circle' },
                                { id: 'story', label: 'Step 2: Story & Copy', icon: 'fa-align-left' },
                                { id: 'taxonomy', label: 'Step 3: Taxonomy', icon: 'fa-tags' },
                                { id: 'theme', label: 'Step 4: Visual Theme', icon: 'fa-palette' },
                                { id: 'variants', label: 'Step 5: Variants', icon: 'fa-cubes' }
                            ].map(tab => {
                                return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center justify-between !px-2 !py-5 rounded-lg text-sm font-semibold transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-400 opacity-60 bg-gray-50' 
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <i className={`fas ${tab.icon} w-5`}></i>
                                        {tab.label}
                                    </div>
                                </button>
                                );
                            })}
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
                                            { value: 'draft', label: 'Draft' },
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' }
                                        ]} />
                                        <FormField label="Main Category *" name="categoryId" type="select" value={form.categoryId} onChange={handleCategoryChange} options={[
                                            { value: '', label: 'Select Category' },
                                            ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
                                        ]} required />
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
                            {/* Global Tab Navigation Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end items-center">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="!px-8 !py-4 bg-indigo-600 text-white rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-check-circle"></i> Save & Continue</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;