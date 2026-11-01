import { useRef, useState } from 'react';
import api from '../api';

// Pairs with the existing "image path" text field: a big click-or-drop zone
// is the primary way in, with a small text field underneath for anyone who
// already has a path handy.
export default function ImageUploadField({ value, onChange, label = 'Image' }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  async function uploadFile(file) {
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/uploads/image', formData);
      onChange(data.path);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function handlePick(e) {
    uploadFile(e.target.files?.[0]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    uploadFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="image-upload-field">
      <label>{label}</label>

      <div
        className={`image-dropzone${value ? ' has-image' : ''}${dragOver ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        {value && <img src={value} alt="" className="image-dropzone-img" />}

        <div className="image-dropzone-overlay">
          {uploading ? (
            <span className="image-dropzone-spinner" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
              </svg>
              <span>{value ? 'Change image' : 'Click or drop an image'}</span>
            </>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePick} />
      </div>

      <label className="image-path-label">or paste an image path</label>
      <input
        className="image-path-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/example.jpg"
      />

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
