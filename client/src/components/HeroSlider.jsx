import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { categoryStyle } from '../lib/categoryMeta.jsx';

// Used only if no real `items` are passed in — keeps the component usable on
// its own, but built from real Foodly dishes/photos rather than invented ones.
const DUMMY_ITEMS = [
  {
    id: 'dummy-1',
    title: 'Piña Colada Chicken Salad',
    category: 'Salads',
    description: "We're obsessed with the crunchy coconut chicken.",
    image: '/images/chicken-salad.jpg',
    price: 18,
    rating: 9.2,
  },
  {
    id: 'dummy-2',
    title: 'Maple Glazed Salmon Fillet',
    category: 'Mains',
    description:
      'The perfect combination of sweet and savory flavors from a marinade made with maple syrup and soy sauce.',
    image: '/images/salmon.jpg',
    price: 14,
    rating: 7.3,
  },
  {
    id: 'dummy-3',
    title: 'Italian Meatball Soup',
    category: 'Soups',
    description: 'A hearty tomato-y broth with mini Italian pork meatballs.',
    image: '/images/soup.jpg',
    price: 15,
    rating: 8.0,
  },
];

const CATEGORY_ORDER = ['Salads', 'Mains', 'Soups'];

const plateVariants = {
  enter: { x: -160, y: -160, opacity: 0, scale: 0.8, rotate: -20 },
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
  exit: {
    x: 180,
    y: 180,
    opacity: 0,
    scale: 0.8,
    rotate: 20,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

const copyContainer = {
  enter: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  exit: {},
};
const copyItem = {
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  initial: { opacity: 0, y: 14 },
};

const bob = (delay = 0) => ({
  animate: { y: [0, -10, 0] },
  transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay },
});

export default function HeroSlider({ items }) {
  const slides = items && items.length > 0 ? items : DUMMY_ITEMS;
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (!autoplay || slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [autoplay, slides.length]);

  const active = slides[index];
  const accent = categoryStyle(Math.max(0, CATEGORY_ORDER.indexOf(active.category))).fg;

  function goPrev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <header className="relative overflow-hidden py-12 md:py-16">
      <div className="wrap grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* ---------- Left: text that re-animates per slide ---------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            variants={copyContainer}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <motion.span
              variants={copyItem}
              className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-4"
              style={{ background: 'var(--card)', color: accent }}
            >
              Today's Pick · {active.category}
            </motion.span>

            <motion.h1 variants={copyItem} className="text-[32px] md:text-[44px] font-semibold leading-[1.15]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {active.title}
            </motion.h1>

            <motion.p variants={copyItem} className="mt-5 max-w-[420px] text-[14.5px] leading-7" style={{ color: 'var(--muted)' }}>
              {active.description}
            </motion.p>

            <motion.div variants={copyItem} className="mt-7 flex flex-wrap gap-4">
              <Link
                to={`/menu?category=${encodeURIComponent(active.category)}`}
                className="btn btn-solid"
                style={{ background: accent }}
              >
                Order Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link to="/book-table" className="btn btn-ghost">Book a Table</Link>
            </motion.div>

            <motion.div variants={copyItem} className="mt-7 flex items-center gap-4">
              <div className="flex gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Show ${s.title}`}
                    onClick={() => setIndex(i)}
                    className="h-[9px] rounded-full transition-all"
                    style={{
                      width: i === index ? 22 : 9,
                      background: i === index ? accent : '#ddd6c2',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 ml-1">
                <button type="button" onClick={goPrev} aria-label="Previous dish" className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button type="button" onClick={goNext} aria-label="Next dish" className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setAutoplay((a) => !a)}
                  aria-label={autoplay ? 'Pause autoplay' : 'Resume autoplay'}
                  className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition"
                  title={autoplay ? 'Pause' : 'Play'}
                >
                  {autoplay ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ---------- Right: diagonal circular plate slider + decorations ---------- */}
        <div className="relative flex justify-center">
          <span className="hero-blob" aria-hidden="true" />

          <motion.span className="hero-deco hero-deco-leaf-tl" {...bob(0)}>
            <img src="/images/mint-leaf.png" alt="" />
          </motion.span>
          <motion.span className="hero-deco hero-deco-leaf-tr" {...bob(0.6)}>
            <img src="/images/mint-leaf.png" alt="" />
          </motion.span>
          <motion.span className="hero-deco hero-deco-tomato" {...bob(1.1)}>
            <img src="/images/tomato-cutout.png" alt="" />
          </motion.span>
          <motion.span className="hero-deco hero-deco-onion" {...bob(0.3)}>
            <img src="/images/onion-cutout.png" alt="" />
          </motion.span>

          <div className="relative w-full max-w-[420px] aspect-square">
            <AnimatePresence mode="wait">
              <motion.img
                key={active.id}
                src={active.image}
                alt={active.title}
                variants={plateVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full rounded-full object-cover shadow-[0_30px_50px_-20px_rgba(0,0,0,0.3)]"
              />
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="hero-float-card"
              >
                <img src={active.image} alt={active.title} />
                <div>
                  <strong>{active.title}</strong>
                  <span>★ {active.rating?.toFixed(1)} · {active.price}$</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
