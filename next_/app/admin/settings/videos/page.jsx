
"use client";
import React, { useState, useEffect, useRef } from 'react';
import settingsService from '@/services/settings.service';
import { uploadMedia } from '@/services/adminApi';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { getFileUrl } from '@/lib/utils';

const VideoSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [failedVideos, setFailedVideos] = useState({});
  const fileInputRefs = useRef({});

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getSettings();
      // Filter only video settings
      const videoSettings = response.data.filter(s => s.group === 'video');
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
        // If it doesn't exist, add it to the state so we can type in it
        return [...prev, { key, value, group: 'video', label: key }];
      }
    });
    
    if (key.endsWith('_video')) {
      setFailedVideos(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleFileUpload = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setMessage({ type: 'error', text: 'Please select a valid video file.' });
      return;
    }

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
      setMessage({ type: 'success', text: 'Video uploaded successfully! Don\'t forget to save changes.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload video' });
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const triggerUpload = (key) => {
    fileInputRefs.current[key]?.click();
  };

  const handleVideoError = (key) => {
    setFailedVideos(prev => ({ ...prev, [key]: true }));
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
      setMessage({ type: 'success', text: 'All video settings saved successfully!' });
      setIsSuccess(true);
      setTimeout(() => {
        setMessage(null);
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading video settings..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchSettings} />;

  // Group settings by page and sequence
  const pageGroups = [
    {
      name: 'Home Page',
      description: 'Videos and text appearing on the main landing page.',
      sections: [
        { id: 'home_hero', label: '1. Hero Section (Top)', video: 'home_hero_video', title: 'home_hero_video_title', subtitle: 'home_hero_video_subtitle' },
        { id: 'home_legacy', label: '2. Legacy Section (Bottom)', video: 'home_legacy_video', title: 'home_legacy_video_title', subtitle: 'home_legacy_video_subtitle' },
      ]
    },
    {
      name: 'Shop Page',
      description: 'Cinematic video sections on the immersive shop page.',
      sections: [
        { id: 'shop_hero', label: '1. Shop Hero (Top)', video: 'shop_hero_video', title: 'shop_hero_video_title', subtitle: 'shop_hero_video_subtitle' },
        { id: 'shop_deepsea', label: '2. DeepSea Section (Middle)', video: 'shop_deepsea_video', title: 'shop_deepsea_video_title', subtitle: 'shop_deepsea_video_subtitle' },
        { id: 'shop_precision', label: '3. Precision Section (Bottom)', video: 'shop_precision_video', title: 'shop_precision_video_title', subtitle: 'shop_precision_video_subtitle' },
      ]
    },
    {
      name: 'Products Page',
      description: 'Main video hero for the product catalog listing.',
      sections: [
        { id: 'products_hero', label: '1. Collection Hero', video: 'products_hero_video', title: 'products_hero_video_title', subtitle: 'products_hero_video_subtitle' },
      ]
    }
  ];

  const getSetting = (key) => {
    const s = settings.find(st => st.key === key);
    if (s) return s;
    
    // Hardcoded defaults to ensure inputs aren't empty if DB fetch is slow or missing keys
    const defaults = {
      home_hero_video_title: 'The Fylex',
      home_hero_video_subtitle: 'A Legacy of Precision',
      home_legacy_video_title: 'Beyond Generations',
      home_legacy_video_subtitle: 'A Fylex is not owned — it is entrusted.',
      shop_hero_video_title: 'Master Your Time',
      shop_hero_video_subtitle: 'Exclusive Collection',
      shop_deepsea_video_title: 'Deep Sea Chronometry',
      shop_deepsea_video_subtitle: 'Engineered for the abyss, where pressure defines excellence.',
      shop_precision_video_title: 'Art of Precision',
      shop_precision_video_subtitle: 'Engineering Excellence',
      products_hero_video_title: 'Exceptional Timepieces',
      products_hero_video_subtitle: 'A Legacy of Distinction'
    };
    
    return { key, value: defaults[key] || '', label: key };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', margin: 0, letterSpacing: '-0.02em' }}>
            Storefront Video & Content
          </h2>
          <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginTop: 4, fontWeight: 500 }}>
            Manage marketing videos and their associated text overlays.
          </p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 20,
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-12 pb-20">
        {pageGroups.map((group) => (
          <div key={group.name} className="admin-card" style={{ padding: 0, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
            <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>{group.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginTop: 4 }}>{group.description}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {group.sections.map((section) => {
            const videoS = getSetting(section.video);
            const titleS = getSetting(section.title);
            const subS = getSetting(section.subtitle);

            return (
              <div key={section.id} style={{ padding: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', marginBottom: 8 }}>
                      {section.label}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                      Configure the background video and text overlay for this section.
                    </p>

                    {videoS.value && (
                      <div style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#000',
                        aspectRatio: '16/9',
                        width: '100%',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {failedVideos[videoS.key] ? (
                          <div style={{ color: '#fff', fontSize: 11, textAlign: 'center', padding: 20 }}>
                            <i className="fas fa-exclamation-triangle" style={{ display: 'block', fontSize: 20, marginBottom: 8, color: '#f59e0b' }}></i>
                            Video Error
                          </div>
                        ) : (
                          <video 
                            key={videoS.value}
                            src={getFileUrl(videoS.value)} 
                            muted 
                            loop 
                            autoPlay 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => handleVideoError(videoS.key)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Video Field */}
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Background Video
                      </label>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          id={videoS.key}
                          name={videoS.key}
                          autoComplete="off"
                          value={videoS.value || ''}
                          onChange={(e) => handleChange(videoS.key, e.target.value)}
                          placeholder="/assets/video.mp4"
                          style={{
                            flex: 1,
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--admin-border)',
                            fontSize: 14,
                            background: '#fff',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => triggerUpload(videoS.key)}
                          disabled={uploadingKey === videoS.key}
                          style={{
                            padding: '0 20px',
                            borderRadius: 10,
                            border: '1px solid var(--admin-border)',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s'
                          }}
                        >
                          {uploadingKey === videoS.key ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
                          Upload
                        </button>
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[videoS.key] = el}
                          style={{ display: 'none' }}
                          accept="video/*"
                          onChange={(e) => handleFileUpload(videoS.key, e)}
                        />
                      </div>
                    </div>

                    {/* Title & Subtitle Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Overlay Title
                        </label>
                        <input
                          type="text"
                          id={titleS.key}
                          name={titleS.key}
                          autoComplete="off"
                          value={titleS.value || ''}
                          onChange={(e) => handleChange(titleS.key, e.target.value)}
                          placeholder="Title text..."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--admin-border)',
                            fontSize: 14,
                            background: '#fff',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--admin-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Overlay Subtitle
                        </label>
                        <input
                          type="text"
                          id={subS.key}
                          name={subS.key}
                          autoComplete="off"
                          value={subS.value || ''}
                          onChange={(e) => handleChange(subS.key, e.target.value)}
                          placeholder="Subtitle text..."
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--admin-border)',
                            fontSize: 14,
                            background: '#fff',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Global Save Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 40,
          position: 'relative',
          zIndex: 50
        }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isSuccess}
            className={`btn-primary ${isSuccess ? 'success-state' : ''}`}
            style={{
              padding: '16px 40px',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 700,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: isSuccess ? '#10b981' : 'var(--admin-accent, #1a1a1a)',
              color: '#fff',
              border: 'none',
              cursor: isSuccess ? 'default' : 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {saving ? <i className="fas fa-spinner fa-spin"></i> : isSuccess ? <i className="fas fa-check"></i> : <i className="fas fa-save"></i>}
            {saving ? 'Saving...' : isSuccess ? 'Updated successfully' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoSettingsPage;
