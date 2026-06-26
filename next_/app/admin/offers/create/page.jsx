"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/admin/css/custom.css';
import { marketingService } from '@/services';
import PageHeader from '@/components/admin/ui/PageHeader';
import FormField from '@/components/admin/ui/FormField';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

const CreateOffer = () => {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'percentage',
    couponType: 'public',
    value: '',
    maxUses: '',
    starts_at: '',
    ends_at: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Offer name is required';
    if (!form.code.trim()) errs.code = 'Coupon code is required';
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) errs.value = 'Enter a valid discount value';
    if (form.maxUses && (isNaN(form.maxUses) || Number(form.maxUses) < 1)) errs.maxUses = 'Max uses must be at least 1';
    return errs;
  };

  const generateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setForm(prev => ({ ...prev, code: randomCode, maxUses: '1', couponType: 'one_time' }));
    if (errors.code) setErrors(prev => ({ ...prev, code: null }));
    if (errors.maxUses) setErrors(prev => ({ ...prev, maxUses: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const payload = {
      ...form,
      value: parseFloat(form.value),
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
    };

    const { error } = await marketingService.createOffer(payload);
    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      toast?.error?.(error);
    } else {
      toast?.success?.('Offer created successfully!');
      router.push('/admin/offers');
    }
  };

  return (
    <div className="w-full px-6 lg:px-10 xl:px-16 py-6">
      <div className="max-w-[1600px] mx-auto">
        <PageHeader
          title="Add New Offer"
          subtitle="Create a discount code or promotional campaign"
        >
          <Link href="/admin/offers" className="h-10 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
            <i className="fas fa-arrow-left text-xs"></i>
            Back to Offers
          </Link>
        </PageHeader>

        <div className="mt-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Offer Configuration</h3>
            </div>
            <div className="p-6 lg:p-8 space-y-8">
              {submitError && <ErrorBanner message={submitError} compact className="mb-6" />}

              <div className="space-y-6">
                <FormField
                  label="Offer Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Sale 2024"
                  required
                  error={errors.name}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <FormField
                      label="Coupon Code"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="e.g. SUMMER20"
                      required
                      error={errors.code}
                      hint="Code customers use at checkout"
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1"
                    >
                      <i className="fas fa-magic"></i> Auto-Generate One-Time Code
                    </button>
                  </div>

                  <FormField
                    label="Discount Type"
                    name="type"
                    type="select"
                    value={form.type}
                    onChange={handleChange}
                    options={[
                      { value: 'percentage', label: 'Percentage (%)' },
                      { value: 'fixed', label: 'Fixed Amount (₹)' }
                    ]}
                  />
                  
                  <FormField
                    label="Coupon Type"
                    name="couponType"
                    type="select"
                    value={form.couponType}
                    onChange={handleChange}
                    options={[
                      { value: 'public', label: 'Public Coupon (Multi-use)' }, 
                      { value: 'one_time', label: 'One-Time Coupon (Single use total)' },
                      { value: 'user_specific', label: 'User-Specific Coupon' }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <FormField
                    label={form.type === 'percentage' ? 'Discount %' : 'Discount Value (₹)'}
                    name="value"
                    type="number"
                    value={form.value}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                    required
                    error={errors.value}
                  />

                  <FormField
                    label="Max Uses (Optional)"
                    name="maxUses"
                    type="number"
                    value={form.maxUses}
                    onChange={handleChange}
                    placeholder="e.g. 1 for One-time use"
                    error={errors.maxUses}
                    hint="Leave empty for unlimited uses"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-gray-50 pt-6">
                  <FormField
                    label="Start Date"
                    name="starts_at"
                    type="date"
                    value={form.starts_at}
                    onChange={handleChange}
                  />

                  <FormField
                    label="End Date"
                    name="ends_at"
                    type="date"
                    value={form.ends_at}
                    onChange={handleChange}
                  />
                </div>

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Internal notes about this campaign..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  className="h-11 px-8 bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 flex-1 md:flex-none"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Creating...</>
                  ) : (
                    <><i className="fas fa-plus"></i> Create Offer</>
                  )}
                </button>
                <Link href="/admin/offers" className="h-11 px-8 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center transition-all flex-1 md:flex-none">
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOffer;
