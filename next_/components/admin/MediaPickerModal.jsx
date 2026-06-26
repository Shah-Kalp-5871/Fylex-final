"use client";
import React, { useState, useCallback, memo } from 'react';
import AdminModal from './AdminModal';
import { useAdminData } from '@/context/AdminDataContext';
import Loader from './ui/Loader';
import { getFileUrl } from '@/lib/utils';

const MediaItem = memo(({ m, isSelected, onToggle }) => {
    const showUrl = getFileUrl(m.fileName);
    return (
        <div
            onClick={() => onToggle(m)}
            className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${isSelected
                    ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-lg scale-[0.98]'
                    : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
                }`}
        >
            <img
                src={showUrl}
                alt={m.originalFilename || 'Media'}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
            />

            {isSelected && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg animate-fade-in">
                    <i className="fas fa-check"></i>
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="text-[10px] text-white font-medium truncate">
                    {m.originalFilename || m.fileName}
                </p>
            </div>
        </div>
    );
});

/**
 * MediaPickerModal
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close callback
 * @param {function} onSelect - Callback receiving selected URL(s)
 * @param {boolean} multiple - Allow multiple selection
 */
const MediaPickerModal = ({ isOpen, onClose, onSelect, multiple = false }) => {
    const { data, loading } = useAdminData();
    const media = data.media || [];
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [currentFolder, setCurrentFolder] = useState('/');

    React.useEffect(() => {
        if (isOpen) {
            setSelected([]);
            setSearch('');
            setCurrentFolder('/');
        }
    }, [isOpen]);

    const toggleSelect = useCallback((m) => {
        const item = { id: m.id.toString(), url: `/uploads/${m.fileName}` };
        if (multiple) {
            setSelected(prev =>
                prev.find(u => u.id === item.id) ? prev.filter(u => u.id !== item.id) : [...prev, item]
            );
        } else {
            setSelected([item]);
        }
    }, [multiple]);

    const handleConfirm = () => {
        if (selected.length > 0) {
            onSelect(multiple ? selected : [selected[0]]);
            onClose();
        }
    };

    const filteredMedia = media.filter(m =>
        m.mimeType?.includes('image') &&
        (m.originalFilename?.toLowerCase().includes(search.toLowerCase()) ||
            m.fileName?.toLowerCase().includes(search.toLowerCase()))
    );

    const currentPathFiles = [];
    const currentPathFolders = new Set();

    filteredMedia.forEach(f => {
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

    const footer = (
        <>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={selected.length === 0}
            >
                Confirm Selection ({selected.length})
            </button>
        </>
    );

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Media Assets"
            maxWidth={900}
            footer={footer}
        >
            <div className="min-h-[400px]">
                <div className="mb-4 flex items-center justify-between">
                    <div className="admin-search w-full max-w-sm">
                        <i className="fas fa-search text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search in media library..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {currentFolder !== '/' && (
                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                                const parts = currentFolder.split('/');
                                parts.pop();
                                setCurrentFolder(parts.join('/') || '/');
                            }}>
                                <i className="fas fa-level-up-alt mr-1"></i> Up
                            </button>
                        )}
                        <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            {currentFolder}
                        </span>
                    </div>
                </div>

                {loading.media ? <Loader message="Accessing library..." /> : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-1 custom-scrollbar">
                        {allItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
                                <i className="fas fa-mountain-sun text-4xl mb-4 opacity-20"></i>
                                <p className="font-medium">No assets match your search in this folder</p>
                            </div>
                        ) : allItems.map((item) => (
                            item.type === 'folder' ? (
                                <div key={item.id} onClick={() => setCurrentFolder(currentFolder === '/' ? '/' + item.name : currentFolder + '/' + item.name)} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md bg-amber-50 flex flex-col items-center justify-center text-amber-500">
                                    <i className="fas fa-folder text-4xl mb-2"></i>
                                    <p className="text-xs font-bold text-gray-700 truncate w-full text-center px-2">{item.name}</p>
                                </div>
                            ) : (
                                <MediaItem 
                                    key={item.id} 
                                    m={item} 
                                    isSelected={!!selected.find(s => s.id === item.id.toString())} 
                                    onToggle={toggleSelect} 
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AdminModal>
    );
};

export default MediaPickerModal;
