import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { categoryIcon } from '../lib/categoryMeta.jsx';

export default function Categories() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  return (
    <section className="menu-page">
      <div className="wrap">
        <div className="section-head">
          <h2>All Categories</h2>
          <p>Browse the full menu by category</p>
        </div>

        {!categories ? (
          <p>Loading…</p>
        ) : categories.length === 0 ? (
          <p>No categories yet.</p>
        ) : (
          <div className="cat-tile-row">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="cat-tile"
                style={{ background: cat.bg }}
              >
                {cat.image ? (
                  <span className="cat-tile-photo">
                    <img src={cat.image} alt={cat.name} />
                  </span>
                ) : (
                  <span className="cat-tile-photo cat-tile-icon" style={{ color: cat.fg }}>
                    {categoryIcon(cat.name)}
                  </span>
                )}
                <span className="cat-tile-label">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
