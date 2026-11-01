const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { requireAdmin } = require('../lib/auth');
const { withErrors } = require('../lib/handler');

// Saved straight into the client's public/images folder, so the returned
// path (/images/xxxx.jpg) works immediately everywhere else in the app that
// already expects an image path string (products, categories).
const IMAGES_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'images');
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '.jpg';
    cb(null, `upload-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
}).single('image');

function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => (err ? reject(err) : resolve()));
  });
}

module.exports = withErrors(async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  requireAdmin(req);

  try {
    await runUpload(req, res);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }

  if (!req.file) return res.status(400).json({ error: 'No image file provided' });

  res.status(201).json({ path: `/images/${req.file.filename}` });
});
