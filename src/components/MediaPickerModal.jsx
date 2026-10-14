import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Tag,
  AlertCircle
} from 'lucide-react';
import {
  DEFAULT_MEDIA_ASSETS,
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

const MediaPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  title = 'Select Image from Media Library',
}) => {
  const [mediaList, setMediaList] = useState(loadStoredMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const fileInputRef = useRef(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const items = loadStoredMedia();
      setMediaList(items);
      // If current value matches an item, select it
      if (currentValue) {
        const found = items.find((m) => m.url === currentValue);
        if (found) setSelectedItem(found);
      }
    }
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

  // Handle local file upload (converts to base64 and stores in library)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP, etc.)');
      return;
    }

    // Limit check for localStorage (under ~4MB recommended for browser storage)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large (> 5MB). Please optimize the image before uploading to browser storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const newItem = {
        id: 'upload-' + Date.now(),
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        url: dataUrl,
        category: 'Custom Uploads',
        dateAdded: new Date().toISOString().split('T')[0],
        description: `Uploaded from local device (${(file.size / 1024).toFixed(1)} KB)`,
        isDefault: false,
      };

      const updated = [newItem, ...mediaList];
      setMediaList(updated);
      saveStoredMedia(updated);
      setSelectedItem(newItem);
      setUploadNotice(`"${newItem.title}" added to your media library!`);
      setTimeout(() => setUploadNotice(''), 3000);
    };

    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Add custom URL to media library
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newItem = {
      id: 'url-' + Date.now(),
      title: urlTitle.trim() || 'Imported Web Image',
      url: urlInput.trim(),
      category: 'Custom Uploads',
      dateAdded: new Date().toISOString().split('T')[0],
      description: 'Imported web asset URL',
      isDefault: false,
    };

    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    saveStoredMedia(updated);
    setSelectedItem(newItem);
    setUrlInput('');
    setUrlTitle('');
    setShowAddUrl(false);
    setUploadNotice('Asset imported to Media Library!');
    setTimeout(() => setUploadNotice(''), 3000);
  };

  // Delete an item from media library
  const handleDeleteItem = (itemToDelete, e) => {
    e.stopPropagation();
    if (itemToDelete.isDefault) {
      alert('Default system template assets cannot be removed.');
      return;
    }

    if (window.confirm(`Delete "${itemToDelete.title}" from library?`)) {
      const updated = mediaList.filter((m) => m.id !== itemToDelete.id);
      setMediaList(updated);
      saveStoredMedia(updated);
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
    }
  };

  // Filter media based on search query & category
  const filteredMedia = mediaList.filter((item) => {
    const matchCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const handleConfirmSelect = () => {
    if (selectedItem) {
      onSelect(selectedItem.url, selectedItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-lg text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                Choose an existing asset, upload a new logo/photo, or reuse across sections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Local Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => setShowAddUrl(!showAddUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add via URL</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Alert Notice */}
        {uploadNotice && (
          <div className="px-6 py-2 bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4" />
            <span>{uploadNotice}</span>
          </div>
        )}

        {/* Optional Add via URL Drawer */}
        {showAddUrl && (
          <form
            onSubmit={handleAddUrl}
            className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center gap-3"
          >
            <div className="flex-1 min-w-[200px]">
              <input
                type="url"
                required
                placeholder="Image URL (e.g. https://domain.com/photo.jpg or ./assets/image.webp)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="w-48">
              <input
                type="text"
                placeholder="Asset Title (optional)"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Save to Library
            </button>
            <button
              type="button"
              onClick={() => setShowAddUrl(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Controls Toolbar: Search & Category Filter */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Content: Grid + Preview Sidebar */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Grid: Media Assets */}
          <div className="lg:col-span-8 xl:col-span-9 p-6 overflow-y-auto max-h-full">
            {filteredMedia.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl">
                <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-300">No media assets found</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Try adjusting your search query, selecting another category, or click "Upload Local Image" above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMedia.map((item) => {
                  const isSelected = selectedItem?.id === item.id || selectedItem?.url === item.url;
                  const isCurrent = currentValue === item.url;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      onDoubleClick={() => {
                        setSelectedItem(item);
                        onSelect(item.url, item);
                        onClose();
                      }}
                      className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all bg-slate-950 flex flex-col ${
                        isSelected
                          ? 'border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-video w-full bg-slate-900 overflow-hidden relative flex items-center justify-center">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        {isCurrent && !isSelected && (
                          <div className="absolute top-2 left-2 text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                            Active
                          </div>
                        )}
                        {!item.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(item, e)}
                            title="Delete custom upload"
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Caption */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div className="text-[11px] font-semibold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                          <span className="truncate max-w-[85px]">{item.category}</span>
                          {item.altText && (
                            <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Alt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Selected Asset Inspector & Details */}
          <div className="lg:col-span-4 xl:col-span-3 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  Selected Asset Details
                </h4>

                {/* Preview Card */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex items-center justify-center p-1">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div>
                  <h5 className="font-bold text-sm text-white">{selectedItem.title}</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {selectedItem.description || 'Alchemist Academy media asset.'}
                  </p>
                </div>

                {/* SEO Alt Text Display */}
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>SEO Image Alt Text</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-snug">
                    {selectedItem.altText || selectedItem.title}
                  </p>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-slate-400">
                    <span>Category:</span>
                    <span className="text-slate-200 font-medium">{selectedItem.category}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Type:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedItem.isDefault ? 'Standard Catalog' : 'User Upload'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Added:</span>
                    <span className="text-slate-200 font-medium">{selectedItem.dateAdded}</span>
                  </div>
                </div>

                {/* URL preview */}
                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Image Source Path / URL
                  </label>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono text-amber-300 break-all select-all max-h-20 overflow-y-auto">
                    {selectedItem.url.startsWith('data:') ? selectedItem.url.substring(0, 80) + '... (Base64)' : selectedItem.url}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                <p className="text-xs">Select any image from the left grid to inspect details and use it.</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedItem}
                onClick={handleConfirmSelect}
                className="w-1/2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Use Image</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MediaPickerModal;

