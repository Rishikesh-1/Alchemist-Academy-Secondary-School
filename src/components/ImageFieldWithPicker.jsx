import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Eye, X, Check, FolderOpen } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';
import { loadStoredMedia, saveStoredMedia } from '../data/defaultMediaAssets';

const ImageFieldWithPicker = ({
  label,
  value,
  onChange,
  helpText,
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

      {/* Primary Image Display and Actions (No raw URL input needed) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Thumbnail & Status */}
        <div className="flex items-center gap-3 min-w-0">
          {value ? (
            <div className="relative group/thumb w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
              <img
                src={value}
                alt="Selected"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer rounded-lg"
                title="View full size"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
              <ImageIcon className="w-6 h-6 opacity-40" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {value ? (
              <>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Image Configured</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                  {value.startsWith('data:') ? 'Custom uploaded asset' : value.replace(/^.*[\\\/]/, '')}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-medium text-slate-400">
                  No image selected
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Choose from media library or upload a file
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Media Library, Upload, and Clear Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Media Library Button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Browse existing school media library"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Media Library</span>
          </button>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            title="Upload image file from device"
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

          {/* Preview button */}
          {value && (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Preview full size"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Quick Clear Button */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {helpText && <p className="text-[11px] text-slate-400">{helpText}</p>}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(url) => onChange(url)}
        currentValue={value}
        title={`Select Asset for ${label || 'Section'}`}
      />

      {/* Full size preview popup */}
      {previewOpen && value && (
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
