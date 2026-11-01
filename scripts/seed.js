require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Product = require('../api/models/Product');
const User = require('../api/models/User');
const Category = require('../api/models/Category');
const Table = require('../api/models/Table');

// Square tables with 6+ seats render as long tables spanning two rows.
const tables = [
  { name: 'T1', capacity: 2, shape: 'square', floor: 'Main floor', row: 1, col: 1 },
  { name: 'T2', capacity: 4, shape: 'square', floor: 'Main floor', row: 1, col: 2 },
  { name: 'T3', capacity: 4, shape: 'square', floor: 'Main floor', row: 1, col: 3 },
  { name: 'T4', capacity: 4, shape: 'square', floor: 'Main floor', row: 1, col: 4 },
  { name: 'T5', capacity: 8, shape: 'square', floor: 'Main floor', row: 1, col: 5 },
  { name: 'T6', capacity: 2, shape: 'square', floor: 'Main floor', row: 2, col: 1 },
  { name: 'T7', capacity: 4, shape: 'square', floor: 'Main floor', row: 2, col: 2 },
  { name: 'T8', capacity: 6, shape: 'square', floor: 'Main floor', row: 2, col: 4 },
  { name: 'T9', capacity: 2, shape: 'round', floor: 'Main floor', row: 3, col: 1 },
  { name: 'T10', capacity: 4, shape: 'round', floor: 'Main floor', row: 3, col: 2 },
  { name: 'T11', capacity: 4, shape: 'round', floor: 'Main floor', row: 3, col: 3 },
  { name: 'T12', capacity: 6, shape: 'round', floor: 'Main floor', row: 3, col: 5 },
  { name: 'P1', capacity: 2, shape: 'round', floor: 'Patio', row: 1, col: 1 },
  { name: 'P2', capacity: 4, shape: 'round', floor: 'Patio', row: 1, col: 2 },
  { name: 'P3', capacity: 6, shape: 'square', floor: 'Patio', row: 1, col: 3 },
];

const categories = [
  { name: 'Salads', bg: '#cfe6a8', fg: '#4f7a3f', image: '/images/salad-fresh.png' },
  { name: 'Mains', bg: '#f5b36a', fg: '#b85c33', image: '/images/mutton-curry.png' },
  { name: 'Soups', bg: '#f7d774', fg: '#a3761c', image: '/images/tom-yum-soup.png' },
  { name: 'Desserts', bg: '#f6d4d8', fg: '#b84a5c', image: '/images/dessert-flan.png' },
  { name: 'Drinks', bg: '#d8e6f2', fg: '#39617f', image: '/images/fruit-juices.png' },
  { name: 'Snacks', bg: '#fde6b8', fg: '#a3761c', image: '/images/snacks-handpies.png' },
  { name: 'Pizza', bg: '#e6ddf2', fg: '#6b4f9c', image: '/images/pizza.png' },
];

const products = [
  {
    name: 'Garden Salad',
    description: 'Made with lettuce such as iceberg, romaine or mesclun greens.',
    price: 10,
    category: 'Salads',
    image: '/images/garden-salad.jpg',
    rating: 8.5,
    featured: true,
    stock: 50,
  },
  {
    name: 'Piña Colada Chicken Salad',
    description: "We're obsessed with the crunchy coconut chicken.",
    price: 18,
    category: 'Salads',
    image: '/images/chicken-salad.jpg',
    rating: 9.2,
    featured: true,
    stock: 50,
  },
  {
    name: 'Maple Glazed Salmon Fillet',
    description:
      'The perfect combination of sweet and savory flavors from a marinade made with maple syrup and soy sauce.',
    price: 14,
    category: 'Mains',
    image: '/images/salmon.jpg',
    rating: 7.3,
    featured: true,
    stock: 40,
  },
  {
    name: 'Italian Meatball Soup',
    description:
      "This Italian meatball soup is everything we love - it's as easy as soup + meatballs! A tomato-y broth, noodles and some mini Italian pork meatballs make for a hearty supper everyone's gonna love.",
    price: 15,
    category: 'Soups',
    image: '/images/soup.jpg',
    rating: 8.0,
    featured: true,
    stock: 35,
  },
  {
    name: "Chef's Roasted Harvest Bowl",
    description:
      'Herb-roasted chicken over a colorful medley of roasted root vegetables, finished with fresh rosemary.',
    price: 16,
    category: 'Mains',
    image: '/images/hero.jpg',
    rating: 8.8,
    featured: true,
    stock: 30,
  },
  {
    name: 'Fried Rice Combo',
    description: 'A hearty plate of wok-fried rice with crisp vegetables and your choice of seasoned meat.',
    price: 13,
    category: 'Mains',
    image: '/images/spicy-noodles.png',
    rating: 8.2,
    featured: true,
    stock: 40,
  },
  {
    name: 'Spicy Meat Combo Platter',
    description: 'Slow-braised meat in a rich spiced sauce, served with rice and fresh herbs.',
    price: 17,
    category: 'Mains',
    image: '/images/mutton-curry.png',
    rating: 8.7,
    featured: true,
    stock: 30,
  },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);

  for (const cat of categories) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log(`Seeded ${categories.length} categories.`);

  await Table.deleteMany({});
  await Table.insertMany(tables);
  console.log(`Seeded ${tables.length} tables.`);

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await User.findOneAndUpdate(
      { email },
      { name: 'Admin', email, passwordHash, role: 'admin' },
      { upsert: true, new: true }
    );
    console.log(`Admin user ready: ${email}`);
  } else {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin user.');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
