import { useEffect, useRef, useState } from 'react';

// Styled replacement for <select>: a trigger button that opens a panel.
// `children` is a render function receiving `close` so options can dismiss it.
export default function PickerDropdown({ icon, label, value, panelWidth, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`picker${open ? ' open' : ''}`} ref={ref}>
      <button type="button" className="picker-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="picker-icon">{icon}</span>
        <span className="picker-text">
          <small>{label}</small>
          <strong>{value}</strong>
        </span>
        <svg className="picker-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="picker-panel" style={panelWidth ? { width: panelWidth } : undefined}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
