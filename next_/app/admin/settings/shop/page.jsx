"use client";
import React, { useState, useEffect, useRef } from 'react';
import settingsService from '@/services/settings.service';
import { uploadMedia } from '@/services/adminApi';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { getFileUrl } from '@/lib/utils';

const ShopSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [message, setMessage] = useState(null);
  const fileInputRefs = useRef({});

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getSettings();
      const videoSettings = response.data.filter(s => s.group === 'video' || s.group === 'shop_page');
      setSettings(videoSettings);
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => {
      const exists = prev.some(s => s.key === key);
      if (exists) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      } else {
        return [...prev, { key, value, group: 'shop_page', label: key }];
      }
    });
  };

  const handleFileUpload = async (key, e, isVideo = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingKey(key);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data, error } = await uploadMedia(formData);
      if (error) throw new Error(error);
      const uploadedFile = Array.isArray(data) ? data[0] : data;
      const filePath = `/uploads/${uploadedFile.fileName}`;
      handleChange(key, filePath);
      setMessage({ type: 'success', text: `${isVideo ? 'Video' : 'Image'} uploaded successfully! Don't forget to save changes.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload file' });
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const triggerUpload = (key) => {
    fileInputRefs.current[key]?.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const dataToUpdate = {};
      settings.forEach(s => {
        dataToUpdate[s.key] = s.value;
      });
      await settingsService.updateSettings(dataToUpdate);
      setMessage({ type: 'success', text: 'All Shop Page settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading Shop settings..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchSettings} />;

  const getSetting = (key) => {
    const s = settings.find(st => st.key === key);
    if (s) return s.value || '';
    return '';
  };

  const isChecked = (key) => {
    return getSetting(key) === 'true';
  };

  const renderVideoSection = (title, videoKey, titleKey, subtitleKey, isIframeKey) => (
    <div style={{ padding: '24px 32px', borderBottom: '1px solid #edf2f7' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 20 }}>{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>
              <input 
                type="checkbox" 
                checked={isChecked(isIframeKey)} 
                onChange={(e) => handleChange(isIframeKey, e.target.checked ? 'true' : 'false')} 
              />
              Use Iframe (e.g., YouTube embed URL) instead of Uploaded Video
            </label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
              {isChecked(isIframeKey) ? 'Iframe Src URL' : 'Background Video File'}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={getSetting(videoKey)}
                onChange={(e) => handleChange(videoKey, e.target.value)}
                placeholder={isChecked(isIframeKey) ? "https://www.youtube.com/embed/..." : "/assets/video.mp4"}
                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 14, outline: 'none' }}
              />
              {!isChecked(isIframeKey) && (
                <button
                  type="button"
                  onClick={() => triggerUpload(videoKey)}
                  disabled={uploadingKey === videoKey}
                  style={{ padding: '0 20px', borderRadius: 10, border: '1px solid var(--admin-border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {uploadingKey === videoKey ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>} Upload
                </button>
              )}
              <input type="file" ref={el => fileInputRefs.current[videoKey] = el} style={{ display: 'none' }} accept="video/*" onChange={(e) => handleFileUpload(videoKey, e, true)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Title HTML</label>
              <input type="text" value={getSetting(titleKey)} onChange={(e) => handleChange(titleKey, e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 14, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Subtitle</label>
              <input type="text" value={getSetting(subtitleKey)} onChange={(e) => handleChange(subtitleKey, e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 14, outline: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInputField = (label, key, placeholder = '', multiline = false) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
      {multiline ? (
        <textarea
          value={getSetting(key)}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 14, outline: 'none', minHeight: '80px' }}
        />
      ) : (
        <input
          type="text"
          value={getSetting(key)}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 14, outline: 'none' }}
        />
      )}
    </div>
  );

  const renderImageField = (label, key, placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>{label}</label>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={getSetting(key)}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--admin-border)', fontSize: 14, outline: 'none' }}
        />
        <button
          type="button"
          onClick={() => triggerUpload(key)}
          disabled={uploadingKey === key}
          style={{ padding: '0 20px', borderRadius: 10, border: '1px solid var(--admin-border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {uploadingKey === key ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>} Upload
        </button>
        <input type="file" ref={el => fileInputRefs.current[key] = el} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(key, e)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', margin: 0, letterSpacing: '-0.02em' }}>Shop Page Content</h2>
        <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginTop: 4, fontWeight: 500 }}>Manage videos, images, and texts on the Shop page.</p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', fontSize: 14, fontWeight: 600, marginBottom: 20, border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8" style={{ paddingBottom: 160 }}>
        
        {/* Video Banners Section */}
        <div className="admin-card" style={{ padding: 0, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
          <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>Video Banners</h3>
          </div>
          {renderVideoSection('1. Shop Hero (Top)', 'shop_hero_video', 'shop_hero_video_title', 'shop_hero_video_subtitle', 'shop_hero_video_is_iframe')}
          {renderVideoSection('2. DeepSea Section (Middle)', 'shop_deepsea_video', 'shop_deepsea_video_title', 'shop_deepsea_video_subtitle', 'shop_deepsea_video_is_iframe')}
          {renderVideoSection('3. Precision Section (Bottom)', 'shop_precision_video', 'shop_precision_video_title', 'shop_precision_video_subtitle', 'shop_precision_video_is_iframe')}
        </div>

        {/* Exquisite Mastery Section (#dial) */}
        <div className="admin-card" style={{ padding: 0, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
          <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>Exquisite Mastery Section (Dial)</h3>
          </div>
          <div style={{ padding: '24px 32px' }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderImageField('Dial Image', 'shop_dial_image', 'e.g. https://images.unsplash.com/...')}
              {renderInputField('Image Caption', 'shop_dial_caption', 'e.g. Fylex Master · Ref. FX-3200')}
              {renderInputField('Section Label', 'shop_dial_label', 'e.g. The Hallmark of Prestige')}
              {renderInputField('Section Title (HTML allowed)', 'shop_dial_title', 'e.g. Exquisite<br/><em>Mastery</em>')}
            </div>
            {renderInputField('Section Description', 'shop_dial_desc', 'Description text...', true)}

            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Specifications Grid</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  {renderInputField('Spec 1 Value', 'shop_dial_spec1_val', 'e.g. ±1')}
                  {renderInputField('Spec 1 Label', 'shop_dial_spec1_lbl', 'e.g. Daily Accuracy')}
                </div>
                <div className="space-y-2">
                  {renderInputField('Spec 2 Value', 'shop_dial_spec2_val', 'e.g. 72h')}
                  {renderInputField('Spec 2 Label', 'shop_dial_spec2_lbl', 'e.g. Power Reserve')}
                </div>
                <div className="space-y-2">
                  {renderInputField('Spec 3 Value', 'shop_dial_spec3_val', 'e.g. 31')}
                  {renderInputField('Spec 3 Label', 'shop_dial_spec3_lbl', 'e.g. Jewels')}
                </div>
                <div className="space-y-2">
                  {renderInputField('Spec 4 Value', 'shop_dial_spec4_val', 'e.g. 300m')}
                  {renderInputField('Spec 4 Label', 'shop_dial_spec4_lbl', 'e.g. Water Resistance')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calibre Section (#mv) */}
        <div className="admin-card" style={{ padding: 0, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
          <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>Calibre Movement Section</h3>
          </div>
          <div style={{ padding: '24px 32px' }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInputField('Section Label', 'shop_mv_label', 'e.g. Calibre FX-3200')}
              {renderInputField('Section Title (HTML allowed)', 'shop_mv_title', 'e.g. The heart of<br/><em>precision</em>')}
            </div>
            {renderInputField('Section Description', 'shop_mv_desc', 'Description text...', true)}

            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Feature Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 p-4 border rounded">
                  {renderInputField('Card 1 Key', 'shop_mv_card1_key', 'e.g. Frequency')}
                  {renderInputField('Card 1 Value', 'shop_mv_card1_val', 'e.g. 28,800 vph')}
                  {renderInputField('Card 1 Desc', 'shop_mv_card1_desc', 'Description...', true)}
                </div>
                <div className="space-y-2 p-4 border rounded">
                  {renderInputField('Card 2 Key', 'shop_mv_card2_key', 'e.g. Power Reserve')}
                  {renderInputField('Card 2 Value', 'shop_mv_card2_val', 'e.g. 72h')}
                  {renderInputField('Card 2 Desc', 'shop_mv_card2_desc', 'Description...', true)}
                </div>
                <div className="space-y-2 p-4 border rounded">
                  {renderInputField('Card 3 Key', 'shop_mv_card3_key', 'e.g. Certification')}
                  {renderInputField('Card 3 Value', 'shop_mv_card3_val', 'e.g. COSC')}
                  {renderInputField('Card 3 Desc', 'shop_mv_card3_desc', 'Description...', true)}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Photo Showcase</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  {renderImageField('Photo 1', 'shop_mv_photo1_img')}
                  {renderInputField('Photo 1 Label', 'shop_mv_photo1_lbl', 'e.g. Balance Wheel')}
                </div>
                <div className="space-y-2">
                  {renderImageField('Photo 2', 'shop_mv_photo2_img')}
                  {renderInputField('Photo 2 Label', 'shop_mv_photo2_lbl', 'e.g. Escapement')}
                </div>
                <div className="space-y-2">
                  {renderImageField('Photo 3', 'shop_mv_photo3_img')}
                  {renderInputField('Photo 3 Label', 'shop_mv_photo3_lbl', 'e.g. Main Barrel')}
                </div>
                <div className="space-y-2">
                  {renderImageField('Photo 4', 'shop_mv_photo4_img')}
                  {renderInputField('Photo 4 Label', 'shop_mv_photo4_lbl', 'e.g. Self-winding Rotor')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 100 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '16px 40px', borderRadius: 999, fontSize: 16, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 12, background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
            {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopSettingsPage;
