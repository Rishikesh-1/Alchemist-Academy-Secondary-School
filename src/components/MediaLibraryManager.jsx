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
  FolderOpen
} from 'lucide-react';
import {
  loadStoredMedia,
  saveStoredMedia
} from '../data/defaultMediaAssets';

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
  const [copiedId, setCopiedId] = useState(null);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlCategory, setUrlCategory] = useState('Custom Uploads');
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
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

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target.result;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const newItem = {
        id: 'upload-' + Date.now(),
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        url: dataUrl,
        category: selectedCategory === 'All' ? 'Custom Uploads' : selectedCategory,
        dateAdded: new Date().toISOString().split('T')[0],
        description: `Uploaded from local device (${(file.size / 1024).toFixed(1)} KB)`,
        isDefault: false,
      };

      const updated = [newItem, ...mediaList];
      setMediaList(updated);
      saveStoredMedia(updated);
      setNotice(`"${newItem.title}" added to Media Library!`);
      setTimeout(() => setNotice(''), 3000);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newItem = {
      id: 'url-' + Date.now(),
      title: urlTitle.trim() || 'Imported Web Image',
      url: urlInput.trim(),
      category: urlCategory,
      dateAdded: new Date().toISOString().split('T')[0],
      description: 'Imported web asset URL',
      isDefault: false,
    };

    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    saveStoredMedia(updated);
    setUrlInput('');
    setUrlTitle('');
    setShowAddUrl(false);
    setNotice('Asset successfully added to Media Library!');
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
    }
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filtered = mediaList.filter((item) => {
    const matchCat =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif-brand text-white flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-amber-400" />
            <span>Central Media Library</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Store, upload, and organize campus photos, event banners, and brand logos. Easily reuse any asset across any section.
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
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Import Asset by Direct Web URL
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">Image URL</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/... or relative ./assets/..."
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
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Asset Title / Name</label>
            <input
              type="text"
              placeholder="e.g. Science Laboratory Apparatus"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddUrl(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
            >
              Cancel
            </button>
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
            placeholder="Search all assets..."
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
          <span className="text-xs text-slate-500">
            Tip: Click "Copy URL" to quickly paste into any custom field.
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

              return (
                <div
                  key={item.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col transition-all shadow hover:shadow-lg hover:shadow-amber-500/10"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-2 rounded-xl bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors shadow cursor-pointer"
                        title="Preview Asset"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item)}
                        className="p-2 rounded-xl bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors shadow cursor-pointer"
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

                  {/* Caption & Actions */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description || 'Alchemist Academy media asset'}
                      </p>
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
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[55vh] flex items-center justify-center p-2">
              <img
                src={previewItem.url}
                alt={previewItem.title}
                className="max-h-[50vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Direct Resource Link / Data</label>
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
