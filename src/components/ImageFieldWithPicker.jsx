import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Eye, X, Check } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';
import { loadStoredMedia, saveStoredMedia } from '../data/defaultMediaAssets';

const ImageFieldWithPicker = ({
  label,
  value,
  onChange,
  helpText,
  placeholder = 'Image URL (e.g. ./hero-cultural.webp or https://...)',
  category = 'Custom Uploads',
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleLocalUpload = (e) => {
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

      // Add to media library automatically so it can be reused anywhere
      const currentList = loadStoredMedia();
      const newItem = {
        id: 'upload-' + Date.now(),
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        url: dataUrl,
        category: category || 'Custom Uploads',
        dateAdded: new Date().toISOString().split('T')[0],
        description: `Uploaded from device (${(file.size / 1024).toFixed(1)} KB)`,
        isDefault: false,
      };

      const updated = [newItem, ...currentList];
      saveStoredMedia(updated);

      // Trigger change in parent form
      onChange(dataUrl);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* URL Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        {/* Media Library Button */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
          title="Browse or choose from Media Library"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Media Library</span>
        </button>

        {/* Upload File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
          title="Upload image from device and save to Media Library"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLocalUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Quick Clear */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
            title="Clear image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {helpText && <p className="text-[11px] text-slate-400">{helpText}</p>}

      {/* Live Thumbnail Preview */}
      {value && (
        <div className="flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 flex items-center justify-center shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Asset Linked</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {value.startsWith('data:') ? 'Base64 Local Image Data' : value}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Preview full size"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(url) => onChange(url)}
        currentValue={value}
        title={`Select Asset for ${label || 'Section'}`}
      />

      {/* Full size preview popup */}
      {previewOpen && (
        <div
          onClick={() => setPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-3xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 p-2 shadow-2xl">
            <img
              src={value}
              alt="Full Preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFieldWithPicker;
