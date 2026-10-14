import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Search,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Eye,
  ExternalLink,
  Sparkles,
  FolderOpen,
  Edit3,
  Tag,
  Globe,
  FileText,
  X,
  Info
} from 'lucide-react';
import {
  loadStoredMedia,
  saveStoredMedia
} from '../data/defaultMediaAssets';
import { uploadMediaFile } from '../services/api';

const CATEGORIES = [
  'All',
  'Campus & Events',
  'Academics & STEM',
  'Arts & Culture',
  'Sports & Athletics',
  'Leadership & Staff',
  'Logos & Badges',
  'Custom Uploads',
];

const MediaLibraryManager = () => {
  const [mediaList, setMediaList] = useState(loadStoredMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewItem, setPreviewItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    altText: '',
    category: 'Campus & Events',
    description: '',
    tags: '',
  });

  const [copiedId, setCopiedId] = useState(null);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlAltText, setUrlAltText] = useState('');
  const [urlCategory, setUrlCategory] = useState('Custom Uploads');
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  // Handle file upload (saves real file to /uploads/{school_id}/ and records in MySQL)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file exceeds 5MB. Please choose an optimized web image.');
      return;
    }

    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const targetCategory = selectedCategory === 'All' ? 'Custom Uploads' : selectedCategory;
    const defaultAltText = `${formattedTitle} - Alchemist Academy, Jorpati, Kathmandu`;

    // Try server upload first
    const uploadRes = await uploadMediaFile(file, {
      title: formattedTitle,
      altText: defaultAltText,
      category: targetCategory,
      tags: 'alchemist academy, school asset',
    });

    if (uploadRes && uploadRes.success && uploadRes.data?.item) {
      const newItem = uploadRes.data.item;
      const updated = [newItem, ...mediaList];
      setMediaList(updated);
      saveStoredMedia(updated);
      setNotice(`"${newItem.title}" saved to /uploads/ with SEO Alt text!`);
      setTimeout(() => setNotice(''), 3000);
      e.target.value = '';
      return;
    }

    // Graceful offline fallback
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      const newItem = {
        id: 'upload-' + Date.now(),
        title: formattedTitle,
        altText: defaultAltText,
        url: dataUrl,
        category: targetCategory,
        dateAdded: new Date().toISOString().split('T')[0],
        description: `Uploaded from local device (${(file.size / 1024).toFixed(1)} KB)`,
        tags: 'kathmandu, alchemist academy, school',
        isDefault: false,
      };

      const updated = [newItem, ...mediaList];
      setMediaList(updated);
      saveStoredMedia(updated);
      setNotice(`"${newItem.title}" added to Media Library with SEO Alt text!`);
      setTimeout(() => setNotice(''), 3000);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const formattedTitle = urlTitle.trim() || 'Imported Web Image';
    const newItem = {
      id: 'url-' + Date.now(),
      title: formattedTitle,
      altText: urlAltText.trim() || `${formattedTitle} - Alchemist Academy, Kathmandu`,
      url: urlInput.trim(),
      category: urlCategory,
      dateAdded: new Date().toISOString().split('T')[0],
      description: 'Imported web asset URL',
      tags: 'web asset, alchemist academy',
      isDefault: false,
    };

    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    saveStoredMedia(updated);
    setUrlInput('');
    setUrlTitle('');
    setUrlAltText('');
    setShowAddUrl(false);
    setNotice('Asset successfully added with SEO metadata!');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDelete = (item) => {
    if (item.isDefault) {
      alert('Default template assets cannot be deleted.');
      return;
    }
    if (window.confirm(`Delete "${item.title}" from library?`)) {
      const updated = mediaList.filter((m) => m.id !== item.id);
      setMediaList(updated);
      saveStoredMedia(updated);
      if (previewItem?.id === item.id) setPreviewItem(null);
      if (editingItem?.id === item.id) setEditingItem(null);
    }
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Open Edit Modal
  const startEditing = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title || '',
      altText: item.altText || item.title || '',
      category: item.category || 'Campus & Events',
      description: item.description || '',
      tags: item.tags || '',
    });
  };

  // Generate SEO Alt Text helper
  const generateSeoAltText = () => {
    const title = editFormData.title.trim() || 'Campus facility or event';
    const category = editFormData.category;
    let generated = `${title} at Alchemist Academy, Jorpati, Kathmandu`;
    if (category && category !== 'All' && category !== 'Custom Uploads') {
      generated += ` (${category})`;
    }
    setEditFormData((prev) => ({ ...prev, altText: generated }));
  };

  // Save changes from Edit Modal
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = mediaList.map((m) => {
      if (m.id === editingItem.id) {
        return {
          ...m,
          title: editFormData.title.trim() || m.title,
          altText: editFormData.altText.trim() || m.title,
          category: editFormData.category,
          description: editFormData.description.trim(),
          tags: editFormData.tags.trim(),
        };
      }
      return m;
    });

    setMediaList(updated);
    saveStoredMedia(updated);
    setEditingItem(null);
    setNotice(`SEO metadata for "${editFormData.title}" updated successfully!`);
    setTimeout(() => setNotice(''), 3000);
  };

  const filtered = mediaList.filter((item) => {
    const matchCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif-brand text-white flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-amber-400" />
            <span>Central Media Library & SEO Assets</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Store, rename, organize, and optimize image SEO Alt text for higher Google Image rankings and accessibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setShowAddUrl(!showAddUrl)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add via URL</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Add via URL Form Drawer */}
      {showAddUrl && (
        <form
          onSubmit={handleAddUrl}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Import Asset by Direct Web URL with SEO Metadata
            </h4>
            <button
              type="button"
              onClick={() => setShowAddUrl(false)}
              className="text-slate-500 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/... or your CDN URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={urlCategory}
                onChange={(e) => setUrlCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Title / Filename Label</label>
              <input
                type="text"
                placeholder="e.g. Science Laboratory Physics Workshop"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">SEO Alt Text (For Search Engines)</label>
              <input
                type="text"
                placeholder="e.g. Students conducting physics lab experiments at Alchemist Academy"
                value={urlAltText}
                onChange={(e) => setUrlAltText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
            >
              Add to Library
            </button>
          </div>
        </form>
      )}

      {/* Toolbar: Search & Categories */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, alt text, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Assets Catalog ({filtered.length})
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Click the <strong className="text-slate-400">Pencil</strong> icon on any image to rename or set SEO Alt Text.
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl">
            <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No assets in this category</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Upload an image from your device or switch category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => {
              const isCopied = copiedId === item.id;
              const hasAlt = Boolean(item.altText && item.altText.trim());

              return (
                <div
                  key={item.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col transition-all shadow hover:shadow-lg hover:shadow-amber-500/10"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.altText || item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow cursor-pointer"
                        title="Edit SEO Alt Text & Rename"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow cursor-pointer"
                        title="Preview Asset"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item)}
                        className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow cursor-pointer"
                        title="Copy Image URL"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {!item.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors shadow cursor-pointer"
                          title="Delete from Library"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Tag badge */}
                    <div className="absolute bottom-2 left-2 text-[9px] font-semibold bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                      {item.category}
                    </div>
                  </div>

                  {/* Caption & SEO Status */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {item.title}
                        </h5>
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="text-slate-400 hover:text-amber-400 p-0.5 cursor-pointer shrink-0"
                          title="Edit SEO Alt Text"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* SEO Alt Text Pill Indicator */}
                      <div className="mt-1.5">
                        {hasAlt ? (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate" title={item.altText}>
                              Alt: {item.altText}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-md hover:bg-amber-900/50 cursor-pointer"
                          >
                            <Info className="w-2.5 h-2.5" />
                            <span>Add SEO Alt Text</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{item.dateAdded}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item)}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT SEO METADATA & RENAME MODAL */}
      {editingItem && (
        <div
          onClick={() => setEditingItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  SEO & Media Optimization
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">
                  Edit Asset Name & SEO Alt Text
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Asset Visual Preview & URL */}
            <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 flex items-center justify-center">
                <img
                  src={editingItem.url}
                  alt={editingItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{editingItem.title}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{editingItem.url}</p>
                <span className="inline-block mt-1 text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {editingItem.category} • Added {editingItem.dateAdded}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Title / Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Asset Title / Filename Label *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g. Annual Cultural Showcase & Traditional Dance Program"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Displayed in media pickers, dashboard lists, and internal references.
                </span>
              </div>

              {/* SEO Alt Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>SEO Image Alt Text (High Priority)</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSeoAltText}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>✨ Suggest SEO Alt Text</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={editFormData.altText}
                  onChange={(e) => setEditFormData({ ...editFormData, altText: e.target.value })}
                  placeholder="Describe the image content with relevant school and location keywords..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Indexed by Google Images and read by accessibility screen readers (a11y).
                  </span>
                  <span className="font-mono text-slate-500">
                    {editFormData.altText.length} chars
                  </span>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Search Tags & Keywords
                  </label>
                  <input
                    type="text"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    placeholder="e.g. science, lab, students, jorpati, kathmandu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description / Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Editorial Caption / Internal Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Optional notes or editorial caption regarding where and when this photo was taken..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                >
                  Save SEO Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-base text-white">{previewItem.title}</h4>
                <p className="text-xs text-slate-400">{previewItem.category} • {previewItem.dateAdded}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[55vh] flex items-center justify-center p-2">
              <img
                src={previewItem.url}
                alt={previewItem.altText || previewItem.title}
                className="max-h-[50vh] w-auto object-contain rounded-xl"
              />
            </div>

            {/* SEO Alt Text Detail */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  SEO Alt Text
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    startEditing(item);
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Alt Text</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {previewItem.altText || previewItem.title || 'No alt text set.'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Direct Resource URL</label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 break-all select-all max-h-24 overflow-y-auto">
                {previewItem.url}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCopyUrl(previewItem)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Asset URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryManager;
