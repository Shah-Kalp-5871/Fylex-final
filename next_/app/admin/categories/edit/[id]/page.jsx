"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import * as api from '@/services/adminApi';
import FormField from '@/components/admin/ui/FormField';
import Loader from '@/components/admin/ui/Loader';
import { useToast } from '@/context/ToastContext';

const EditCategoryPage = () => {
    const toast = useToast();
    const router = useRouter();
    const params = useParams();
    const categoryId = params.id;

    const { data, loading, updateRecord } = useAdminData();
    const categories = data.categories || [];
    const allAttributes = data.attributes || [];
    const allSpecGroups = data.specificationGroups || [];

    const [fetching, setFetching] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '', slug: '', description: '',
        parentId: '', imageId: '', image: '',
        metaTitle: '', metaDescription: '', metaKeywords: '',
        sortOrder: 0,
        status: 1,
        featured: 0,
        showInNav: 1
    });

    const [selectedSpecGroups, setSelectedSpecGroups] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState([]);

    const [specSearch, setSpecSearch] = useState('');
    const [attrSearch, setAttrSearch] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [showSEO, setShowSEO] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!categoryId) return;
        const loadCategory = async () => {
            const res = await api.getCategory(categoryId);
            if (res.success && res.data) {
                const cat = res.data;
                setForm({
                    name: cat.name || '',
                    slug: cat.slug || '',
                    description: cat.description || '',
                    parentId: cat.parentId ? cat.parentId.toString() : '',
                    imageId: cat.imageId || '',
                    image: cat.image || cat.image_url || '',
                    metaTitle: cat.metaTitle || '',
                    metaDescription: cat.metaDescription || '',
                    metaKeywords: cat.metaKeywords || '',
                    sortOrder: cat.sortOrder || 0,
                    status: cat.status !== undefined ? cat.status : (cat.isActive ? 1 : 0),
                    featured: cat.featured ? 1 : 0,
                    showInNav: cat.showInNav !== undefined ? cat.showInNav : 1
                });

                if (cat.specificationGroups) {
                    setSelectedSpecGroups(cat.specificationGroups.map(g => g.id));
                }

                if (cat.attributes) {
                    setSelectedAttributes(cat.attributes.map(a => ({
                        attributeId: a.attributeId || a.id,
                        isRequired: !!a.isRequired,
                        isFilterable: !!a.isFilterable,
                        sortOrder: a.sortOrder || 0
                    })));
                }
            } else {
                toast.error("Failed to load category details");
                router.push('/admin/categories');
            }
            setFetching(false);
        };
        loadCategory();
    }, [categoryId, router, toast]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 150);
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSubmit(new Event('submit'));
            }
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [form, selectedSpecGroups, selectedAttributes]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
            ...(name === 'name' ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
        }));
    };

    const handleToggle = (name) => {
        setForm(prev => ({ ...prev, [name]: prev[name] === 1 ? 0 : 1 }));
    };

    const filteredSpecGroups = useMemo(() => {
        if (!specSearch) return allSpecGroups;
        return allSpecGroups.filter(g => g.name.toLowerCase().includes(specSearch.toLowerCase()));
    }, [allSpecGroups, specSearch]);

    const filteredAttributes = useMemo(() => {
        if (!attrSearch) return allAttributes;
        return allAttributes.filter(a => a.name.toLowerCase().includes(attrSearch.toLowerCase()));
    }, [allAttributes, attrSearch]);

    const toggleSpecGroup = (id) => {
        setSelectedSpecGroups(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAttribute = (attrId) => {
        setSelectedAttributes(prev => {
            const exists = prev.find(a => a.attributeId === attrId);
            if (exists) {
                return prev.filter(a => a.attributeId !== attrId);
            } else {
                return [...prev, { attributeId: attrId, isRequired: false, isFilterable: true, sortOrder: 0 }];
            }
        });
    };

    const updateAttrSetting = (attrId, key, value) => {
        setSelectedAttributes(prev => prev.map(a =>
            a.attributeId === attrId ? { ...a, [key]: value } : a
        ));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!form.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        setSubmitting(true);
        const payload = {
            ...form,
            parentId: form.parentId || null,
            imageId: form.imageId || null,
            specificationGroupIds: selectedSpecGroups.filter(id => id !== null && id !== undefined && id !== ''),
            attributeIds: selectedAttributes
                .filter(a => a.attributeId && !isNaN(parseInt(a.attributeId)))
                .map(a => ({
                    attributeId: parseInt(a.attributeId),
                    isRequired: !!a.isRequired,
                    isFilterable: !!a.isFilterable,
                    sortOrder: parseInt(a.sortOrder) || 0
                }))
        };

        const success = await updateRecord('categories', categoryId, payload, api.updateCategory);
        setSubmitting(false);

        if (success) {
            toast.success("Category updated successfully");
            router.push('/admin/categories');
        }
    };

    if (fetching || loading.categories || loading.attributes || loading.specificationGroups) {
        return <Loader message="Accessing taxonomy catalog..." />;
    }

    return (
        <div className="max-w-[2000px] space-y-6 animate-fade-in pb-24 xl:pb-20 px-4 sm:px-6">
            {/* Desktop Sticky Header */}
            <div className={`fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-200 py-3 px-8 transform transition-all duration-300 hidden xl:flex items-center justify-between shadow-sm ${scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <i className="fas fa-folder-open"></i>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 leading-none mb-1">{form.name || 'Edit Category'}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Editing Category</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/categories')} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        Cancel Changes
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
                    >
                        {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                        Update Category (Ctrl+S)
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 !mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/categories')}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
                            <span>Admin</span>
                            <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                            <span className="text-slate-400">Products</span>
                            <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                            <span className="text-slate-900">Categories</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Edit Category</h1>
                        <p className="text-slate-500 text-sm font-medium">Update category details and taxonomy structure</p>
                    </div>
                </div>
                <button onClick={() => router.push('/admin/categories')} className="btn-secondary rounded-xl">
                    <i className="fas fa-list-ul mr-2"></i> View All
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Basic Information */}
                    <div className="admin-card !p-6">
                        <h3 className="text-lg font-bold text-slate-800 !mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm">
                                <i className="fas fa-info-circle"></i>
                            </span>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Category Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Men's Clothing" required />
                            <FormField label="Slug" name="slug" value={form.slug} onChange={handleChange} placeholder="e.g., mens-clothing" />
                            <div className="md:col-span-2">
                                <FormField
                                    label="Parent Category"
                                    name="parentId"
                                    type="select"
                                    value={form.parentId}
                                    onChange={handleChange}
                                    options={[{ value: '', label: 'No Parent (Main Category)' }, ...categories.filter(c => c.id.toString() !== categoryId.toString()).map(c => ({ value: c.id.toString(), label: c.name }))]}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} rows={4} placeholder="Describe this category..." />
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="admin-card !p-6">
                        <button
                            type="button"
                            onClick={() => setShowSEO(!showSEO)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm">
                                    <i className="fas fa-search"></i>
                                </span>
                                SEO Settings
                            </h3>
                            <i className={`fas fa-chevron-${showSEO ? 'up' : 'down'} text-slate-400 transition-transform`}></i>
                        </button>

                        {showSEO && (
                            <div className="space-y-6 mt-6 animate-slide-down">
                                <FormField label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="Title for search engines" hint="Title for search engines (optional)" />
                                <FormField label="Meta Description" name="metaDescription" type="textarea" value={form.metaDescription} onChange={handleChange} rows={3} placeholder="Description for search engines" hint="Description for search engines (optional)" />
                                <FormField label="Meta Keywords" name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="keyword1, keyword2, keyword3" hint="Comma-separated keywords (optional)" />
                            </div>
                        )}
                    </div>

                    {/* Specification Groups */}
                    <div className="admin-card !p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-sm">
                                <i className="fas fa-layer-group"></i>
                            </span>
                            Specification Groups
                        </h3>
                        <p className="text-slate-400 text-sm !mb-6 ml-11">Select specification groups to assign to this category</p>

                        <div className="relative mb-6">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input
                                type="text"
                                className="admin-input w-full !pl-12"
                                placeholder="Search specification groups..."
                                value={specSearch}
                                onChange={(e) => setSpecSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto !pr-2 custom-scrollbar">
                            {filteredSpecGroups.map(group => (
                                <label
                                    key={group.id}
                                    className={`flex items-center gap-4 !p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedSpecGroups.includes(group.id) ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 '}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="!w-5 !h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedSpecGroups.includes(group.id)}
                                        onChange={() => toggleSpecGroup(group.id)}
                                    />
                                    <span className="font-bold text-slate-700">{group.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Attributes */}
                    <div className="admin-card !p-6">
                        <h3 className="text-lg font-bold text-slate-800 !mb-2 flex items-center gap-3">
                            <span className="!w-8 !h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm">
                                <i className="fas fa-tags"></i>
                            </span>
                            Attributes
                        </h3>
                        <p className="text-slate-400 text-sm !mb-6 !ml-11">Select attributes for variant creation (size, color, etc.)</p>

                        <div className="relative !mb-6">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input
                                type="text"
                                className="admin-input w-full !pl-12"
                                placeholder="Search attributes..."
                                value={attrSearch}
                                onChange={(e) => setAttrSearch(e.target.value)}
                            />
                        </div>

                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-[700px] w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10"></th>
                                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attribute</th>
                                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Required</th>
                                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Filterable</th>
                                            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center w-32">Sort Order</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAttributes.map(attr => {
                                            const selected = selectedAttributes.find(a => a.attributeId === attr.id);
                                            return (
                                                <tr key={attr.id} className={`${selected ? 'bg-indigo-50/10' : ''}`}>
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600"
                                                            checked={!!selected}
                                                            onChange={() => toggleAttribute(attr.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-700">{attr.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">({attr.code})</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!selected}
                                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 disabled:opacity-30"
                                                            checked={selected?.isRequired || false}
                                                            onChange={(e) => updateAttrSetting(attr.id, 'isRequired', e.target.checked)}
                                                        />
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!selected}
                                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 disabled:opacity-30"
                                                            checked={selected?.isFilterable || false}
                                                            onChange={(e) => updateAttrSetting(attr.id, 'isFilterable', e.target.checked)}
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            disabled={!selected}
                                                            className="admin-input h-9 text-center font-bold disabled:opacity-30"
                                                            value={selected?.sortOrder || 0}
                                                            onChange={(e) => updateAttrSetting(attr.id, 'sortOrder', e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {filteredAttributes.map(attr => {
                                    const selected = selectedAttributes.find(a => a.attributeId === attr.id);
                                    return (
                                        <div key={attr.id} className={`p-4 ${selected ? 'bg-indigo-50/30' : 'bg-white'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600"
                                                        checked={!!selected}
                                                        onChange={() => toggleAttribute(attr.id)}
                                                    />
                                                    <div>
                                                        <div className="font-bold text-slate-700">{attr.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">{attr.code}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {selected && (
                                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100/50">
                                                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Required</span>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                                            checked={selected.isRequired || false}
                                                            onChange={(e) => updateAttrSetting(attr.id, 'isRequired', e.target.checked)}
                                                        />
                                                    </label>
                                                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Filterable</span>
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                                            checked={selected.isFilterable || false}
                                                            onChange={(e) => updateAttrSetting(attr.id, 'isFilterable', e.target.checked)}
                                                        />
                                                    </label>
                                                    <div className="col-span-2">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Sort Order</div>
                                                        <input
                                                            type="number"
                                                            className="admin-input h-10 w-full font-bold"
                                                            value={selected.sortOrder || 0}
                                                            onChange={(e) => updateAttrSetting(attr.id, 'sortOrder', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="xl:col-span-4">
                    <div className="xl:sticky xl:top-6 space-y-6">
                        {/* Category Image */}
                        <div className="admin-card !p-6">
                            <h3 className="text-lg font-bold text-slate-800 !mb-6 flex items-center gap-3">
                                <span className="!w-8 !h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm">
                                    <i className="fas fa-image"></i>
                                </span>
                                Category Image
                            </h3>

                            <div
                                onClick={() => setIsPickerOpen(true)}
                                className="group relative w-full aspect-square max-h-[220px] sm:max-h-[260px] xl:max-h-none rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden"
                            >
                                {form.image ? (
                                    <>
                                        <img src={form.image.url || form.image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <span className="text-white font-bold text-sm bg-indigo-500 px-4 py-2 rounded-xl">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 mb-4 group-hover:text-indigo-400 transition-all">
                                            <i className="fas fa-image text-3xl"></i>
                                        </div>
                                        <p className="text-slate-400 font-bold text-sm">No image selected</p>
                                    </>
                                )}
                            </div>

                            <div className="!mt-6 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPickerOpen(true)}
                                    className="w-full !py-3 rounded-xl bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                                >
                                    <i className="fas fa-images"></i>
                                    Select from Media Library
                                </button>
                                {form.image && (
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, image: '', imageId: '' }))}
                                        className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
                                    >
                                        <i className="fas fa-times-circle mr-2"></i>
                                        Remove Image
                                    </button>
                                )}
                                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest !mt-4">Recommended size: 800x800px</p>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="admin-card !p-6">
                            <h3 className="text-lg font-bold text-slate-800 !mb-6 flex items-center gap-3">
                                <span className="!w-8 !h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm">
                                    <i className="fas fa-cog"></i>
                                </span>
                                Settings
                            </h3>
                            <div className="space-y-6">
                                <FormField label="Sort Order" name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} placeholder="0" hint="Lower numbers appear first" />

                                <div className="pt-4 border-t border-slate-50 grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">Status</div>
                                            <div className="text-[10px] text-slate-400 font-bold">Category visibility</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={form.status === 1} onChange={() => handleToggle('status')} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">Featured</div>
                                            <div className="text-[10px] text-slate-400 font-bold">Show in featured sections</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={form.featured === 1} onChange={() => handleToggle('featured')} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between xl:col-span-2">
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">Show in Navigation</div>
                                            <div className="text-[10px] text-slate-400 font-bold">Display in main navigation</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={form.showInNav === 1} onChange={() => handleToggle('showInNav')} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Publish */}
                        <div className="admin-card !p-6">
                            <h3 className="text-lg font-bold text-slate-800 !mb-6">Publish</h3>
                            <div className="!p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium !mb-6 flex gap-3">
                                <i className="fas fa-info-circle mt-0.5"></i>
                                <span>Review all information before updating</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin/categories')}
                                    className="flex-1 !py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[1.5] !py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
                                >
                                    {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save font-light"></i>}
                                    Update Category
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-400 font-bold !mt-4 uppercase">Click "Update Category" to save changes</p>
                        </div>
                    </div>
                </div>
            </form>

            {/* Mobile Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 xl:hidden z-50 animate-slide-up">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                    {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save font-light"></i>}
                    Update Category
                </button>
            </div>

            <MediaPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={(selection) => {
                    const sel = Array.isArray(selection) ? selection[0] : selection;
                    setForm(prev => ({
                        ...prev,
                        image: sel.url || sel,
                        imageId: sel.id || ''
                    }));
                }}
            />
        </div>
    );
};

export default EditCategoryPage;
