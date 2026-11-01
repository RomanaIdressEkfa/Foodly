import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard.jsx';
import { categoryIcon } from '../lib/categoryMeta.jsx';

const ALL_PILL = { name: 'All', bg: '#eef0e1', fg: '#4a4a3f' };

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  useEffect(() => {
    api.get('/products').then(({ data }) => setProducts(data.products));
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const pills = [ALL_PILL, ...categories];
  const visible =
    category === 'All' ? products : products.filter((p) => p.category === category);

  return (
    <section className="menu-page">
      <div className="wrap">
        <div className="section-head">
          <h2>Full Menu</h2>
          <p>Everything on the Foodly menu, made fresh to order</p>
        </div>

        <div className="category-row">
          {pills.map((c) => {
            const active = c.name === category;
            return (
              <button
                key={c.name}
                type="button"
                className={`category-pill${active ? ' active' : ''}`}
                style={{
                  background: c.bg,
                  color: c.fg,
                  boxShadow: active ? `0 10px 18px -8px ${c.fg}99` : 'none',
                }}
                onClick={() => setCategory(c.name)}
              >
                <span className="category-icon">{categoryIcon(c.name)}</span>
                {c.name}
              </button>
            );
          })}
        </div>

        <div className="menu-grid">
          {visible.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
          {visible.length === 0 && <p>No dishes in this category yet.</p>}
        </div>
      </div>
    </section>
  );
}
