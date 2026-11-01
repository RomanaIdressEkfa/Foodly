export const CATEGORY_STYLES = [
  { bg: '#fcded0', fg: '#b85c33' }, // peach
  { bg: '#dcebd1', fg: '#4f7a3f' }, // green
  { bg: '#fde6b8', fg: '#a3761c' }, // yellow
  { bg: '#f6d4d8', fg: '#b84a5c' }, // pink
  { bg: '#d8e6f2', fg: '#39617f' }, // blue
  { bg: '#e6ddf2', fg: '#6b4f9c' }, // lavender
  { bg: '#cfe6a8', fg: '#4f7a3f' }, // lime
  { bg: '#cdeee6', fg: '#1f7a68' }, // teal
];

export const CATEGORY_ICONS = {
  All: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Salads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11h18M4 11a8 8 0 0 1 16 0M12 3v2" /><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Mains: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 2-2 10 0 12v6M17 3v9" strokeLinecap="round" />
    </svg>
  ),
  Soups: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11h18l-1.5 6a3 3 0 0 1-3 2.5H7.5a3 3 0 0 1-3-2.5L3 11Z" /><path d="M8 3c0 1.5-1.5 1.5-1.5 3M12 3c0 1.5-1.5 1.5-1.5 3M16 3c0 1.5-1.5 1.5-1.5 3" strokeLinecap="round" />
    </svg>
  ),
  Desserts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 10h12l-1.2 9a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 10Z" /><path d="M7 10a5 5 0 0 1 10 0" /><path d="M12 3v2" strokeLinecap="round" />
    </svg>
  ),
  Drinks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 11a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 8Z" /><path d="M9 8V5a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  Snacks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20 12 4l8 16H4Z" strokeLinejoin="round" /><path d="M8 20l4-8 4 8" />
    </svg>
  ),
  Pizza: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 3 19h18L12 3Z" /><circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" /><circle cx="10" cy="16" r="1" fill="currentColor" stroke="none" /><circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
};

// Master category list — shown on Home and Menu regardless of whether a
// category currently has any products, so the "View All" page always shows
// the full set, not just whatever happens to have stock right now.
export const CATEGORIES = ['Salads', 'Mains', 'Soups', 'Desserts', 'Drinks', 'Snacks', 'Pizza'];

export function categoryStyle(index) {
  return CATEGORY_STYLES[index % CATEGORY_STYLES.length];
}

export function categoryIcon(name) {
  return (
    CATEGORY_ICONS[name] || (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
      </svg>
    )
  );
}
