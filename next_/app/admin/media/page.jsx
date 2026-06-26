"use client";
import React, { useState, useEffect, useRef } from 'react';
import '@/app/admin/css/custom.css';
import AdminModal from '@/components/admin/AdminModal';
import * as api from '@/services/adminApi';
import { useAdminData } from '@/context/AdminDataContext';
import { useToast } from '@/context/ToastContext';
import Loader from '@/components/admin/ui/Loader';
import ErrorBanner from '@/components/admin/ui/ErrorBanner';
import { getFileUrl } from '@/lib/utils';

const MediaList = () => {
    const toast = useToast();
    const { data, loading, errors, refetch, deleteRecord } = useAdminData();
    const files = data.media || [];
    
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [inputSizeMB, setInputSizeMB] = useState(3);
    const [activeMaxImageSizeMB, setActiveMaxImageSizeMB] = useState(3);
    
    const [currentFolder, setCurrentFolder] = useState('/');
    
    const itemsPerPage = 10;
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    // Filtering: Exclude videos as per user request
    const filteredFiles = files.filter(f => {
        const isVideo = f.mimeType?.includes('video') || f.fileType === 'video' || f.extension === 'mp4' || f.extension === 'webm';
        if (isVideo) return false;

        const matchesSearch = (f.originalFilename || f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.fileName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    // Filter by current folder and get subfolders
    const currentPathFiles = [];
    const currentPathFolders = new Set();

    filteredFiles.forEach(f => {
        const folder = f.folderPath || '/';
        
        if (folder === currentFolder || folder === currentFolder.replace(/\/$/, '')) {
            currentPathFiles.push(f);
        } else if (folder.startsWith(currentFolder === '/' ? '/' : currentFolder + '/')) {
            let relativePath = folder.substring(currentFolder === '/' ? 1 : currentFolder.length + 1);
            if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
            
            const immediateSubFolder = relativePath.split('/')[0];
            if (immediateSubFolder) {
                currentPathFolders.add(immediateSubFolder);
            }
        }
    });

    const foldersArray = Array.from(currentPathFolders).sort();

    const allItems = [
        ...foldersArray.map(name => ({ type: 'folder', name, id: `folder-${name}` })),
        ...currentPathFiles.map(f => ({ type: 'file', ...f }))
    ];

    // Pagination logic
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    const paginatedItems = allItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, currentFolder]);

    const handleUpload = async (e, isFolder = false) => {
        const filesToUpload = Array.from(e.target.files);
        if (filesToUpload.length === 0) return;

        const formData = new FormData();
        const paths = [];

        for (const file of filesToUpload) {
            if (file.type.startsWith('image/')) {
                const maxSizeInBytes = (activeMaxImageSizeMB || 3) * 1024 * 1024;
                if (file.size > maxSizeInBytes) {
                    toast?.error?.(`Image size must be less than ${activeMaxImageSizeMB || 3}MB`);
                    continue;
                }
            }
            formData.append('file', file);
            
            const base = currentFolder === '/' ? '' : currentFolder;
            if (isFolder && file.webkitRelativePath) {
                paths.push(base + '/' + file.webkitRelativePath);
            } else {
                paths.push(base + '/' + file.name);
            }
        }

        if (paths.length > 0) {
            formData.append('paths', JSON.stringify(paths));
        }

        setUploading(true);
        const res = await api.uploadMedia(formData);
        setUploading(false);

        if (res.error) {
            toast?.error?.(res.error);
        } else {
            toast?.success?.('Files uploaded successfully');
            refetch.media();
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (folderInputRef.current) folderInputRef.current.value = '';
    };

    const confirmDelete = (file) => {
        setFileToDelete(file);
        setDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!fileToDelete) return;
        setIsDeleting(true);
        try {
            // Use api directly to control the sequence better
            const { error, success } = await api.deleteMedia(fileToDelete.id);
            
            if (success) {
                // 1. Close Modal Immediately
                setDeleteModal(false);
                setFileToDelete(null);
                
                // 2. Show Toast
                toast?.success?.('Media deleted successfully');
                
                // 3. Refresh Table in Background
                refetch.media();
            } else {
                toast?.error?.(error || 'Failed to delete media');
            }
        } catch (err) {
            toast?.error?.('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Number(bytes)) / Math.log(k));
        return parseFloat((Number(bytes) / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="page-header" style={{ marginBottom: 30 }}>
                <div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Media Library</h2>
                    <p style={{ color: '#64748b', fontSize: 14 }}>Manage, optimize, and organize your storefront assets.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <label style={{ fontSize: '14px', color: '#64748b' }}>Max Size (MB):</label>
                       <input 
                           type="number" 
                           min="1"
                           value={inputSizeMB}
                           onChange={(e) => setInputSizeMB(Number(e.target.value))}
                           style={{ width: '70px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                       />
                       <button 
                           className="btn-secondary" 
                           onClick={() => {
                               setActiveMaxImageSizeMB(inputSizeMB);
                               toast?.success?.(`Max image size set to ${inputSizeMB}MB`);
                           }}
                           style={{ padding: '8px 12px', fontSize: '13px' }}
                       >
                           Set Size
                       </button>
                   </div>
                   <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }} onChange={(e) => handleUpload(e, false)} />
                   <input type="file" ref={folderInputRef} webkitdirectory="true" directory="true" multiple style={{ display: 'none' }} onChange={(e) => handleUpload(e, true)} />
                   <button className="btn-secondary" style={{ padding: '12px 24px' }} onClick={() => folderInputRef.current.click()} disabled={uploading}>
                       {uploading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-folder-plus mr-2"></i>}
                       Upload Folder
                   </button>
                   <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={() => fileInputRef.current.click()} disabled={uploading}>
                       {uploading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-plus-circle mr-2"></i>}
                       Upload Files
                   </button>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                {currentFolder !== '/' && (
                    <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => {
                        const parts = currentFolder.split('/');
                        parts.pop();
                        setCurrentFolder(parts.join('/') || '/');
                    }}>
                        <i className="fas fa-level-up-alt mr-2"></i> Up
                    </button>
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
                    Current Path: {currentFolder}
                </span>
            </div>

            <div className="admin-card" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div className="admin-card-header" style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>Items ({allItems.length})</h3>
                    <div className="admin-search" style={{ width: 300, background: '#f8fafc', borderRadius: 10 }}>
                        <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Search by filename..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent' }}
                        />
                    </div>
                </div>
                
                {loading.media ? <Loader message="Accessing library..." /> : 
                 errors.media  ? <ErrorBanner message={errors.media} onRetry={() => refetch.media()} /> : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '16px 32px' }}>File Asset</th>
                                        <th>Format</th>
                                        <th style={{ textAlign: 'center' }}>File Size</th>
                                        <th style={{ textAlign: 'center' }}>Date Added</th>
                                        <th style={{ textAlign: 'right', paddingRight: 32 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedItems.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: 60 }}>
                                            <div style={{ opacity: 0.5 }}>
                                                <i className="fas fa-folder-open" style={{ fontSize: 40, marginBottom: 15, display: 'block' }}></i>
                                                <p>No items found in this folder.</p>
                                            </div>
                                        </td></tr>
                                    ) : paginatedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            {item.type === 'folder' ? (
                                                <>
                                                    <td style={{ padding: '16px 32px', cursor: 'pointer' }} onClick={() => setCurrentFolder(currentFolder === '/' ? '/' + item.name : currentFolder + '/' + item.name)}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fef3c7', border: '1px solid #fde68a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="fas fa-folder" style={{ color: '#d97706', fontSize: 24 }}></i>
                                                            </div>
                                                            <div style={{ minWidth: 0 }}>
                                                                <span className="cell-primary" style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                                                                <span style={{ fontSize: 11, color: '#94a3b8' }}>Folder</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>-</td>
                                                    <td style={{ textAlign: 'center' }}>-</td>
                                                    <td style={{ textAlign: 'center' }}>-</td>
                                                    <td></td>
                                                </>
                                            ) : (() => {
                                                const f = item;
                                                return (
                                                <>
                                                    <td style={{ padding: '16px 32px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                {f.mimeType?.includes('image') ? (
                                                                    <img src={getFileUrl(f.fileName)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=IMG'; }} />
                                                                ) : f.mimeType?.includes('video') ? (
                                                                    <i className="fas fa-video" style={{ color: '#6366f1' }}></i>
                                                                ) : (
                                                                    <i className="fas fa-file" style={{ color: '#94a3b8' }}></i>
                                                                )}
                                                            </div>
                                                            <div style={{ minWidth: 0 }}>
                                                                <span className="cell-primary" style={{ display: 'block', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.originalFilename || f.name}</span>
                                                                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{f.fileName}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            fontSize: 10, 
                                                            fontWeight: 800, 
                                                            color: f.mimeType?.includes('video') ? '#0891b2' : '#6366f1', 
                                                            background: f.mimeType?.includes('video') ? '#ecfeff' : '#f5f3ff', 
                                                            padding: '4px 10px', 
                                                            borderRadius: 6,
                                                            border: `1px solid ${f.mimeType?.includes('video') ? '#cffafe' : '#eedeff'}`
                                                        }}>
                                                            {f.extension?.toUpperCase() || f.fileType?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 500, fontSize: 13, color: '#475569' }}>{formatSize(f.fileSize)}</td>
                                                    <td style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                                                    <td style={{ textAlign: 'right', paddingRight: 32 }}>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <a href={getFileUrl(f.fileName)} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#64748b' }} title="View Original"><i className="fas fa-external-link-alt"></i></a>
                                                            <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => confirmDelete(f)} title="Delete"><i className="fas fa-trash-alt"></i></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )})()}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: '#64748b' }}>
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, allItems.length)} of {allItems.length}
                                </span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button 
                                        className="btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: 12 }} 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        Previous
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i}
                                            className={currentPage === i + 1 ? "btn-primary" : "btn-secondary"}
                                            style={{ padding: '6px 12px', minWidth: 36, fontSize: 12 }}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button 
                                        className="btn-secondary" 
                                        style={{ padding: '6px 12px', fontSize: 12 }} 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                 )}
            </div>

            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={deleteModal}
                onClose={() => !isDeleting && setDeleteModal(false)}
                title="Confirm Deletion"
                maxWidth={450}
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
                        <button className="btn-secondary" onClick={() => setDeleteModal(false)} disabled={isDeleting}>Cancel</button>
                        <button className="btn-primary" style={{ background: '#ef4444' }} onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </button>
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 30, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#1e293b' }}>Are you absolutely sure?</p>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        This will permanently delete <strong style={{ color: '#1e293b' }}>{fileToDelete?.originalFilename || fileToDelete?.fileName}</strong> and remove the file from the server. This action cannot be undone.
                    </p>
                </div>
            </AdminModal>
        </div>
    );
};

export default MediaList;
