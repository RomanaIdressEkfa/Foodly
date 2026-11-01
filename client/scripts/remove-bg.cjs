// One-off dev utility: these decoration photos ship as flat RGB (no alpha),
// with a near-white studio background. This chroma-keys white -> transparent
// with a soft edge falloff so they read as real cutouts in the hero.
const path = require('path');
const { Jimp } = require('jimp');

const FILES = ['leaf-cutout.png', 'tomato-cutout.png', 'onion-cutout.png'];
const DIR = path.join(__dirname, '..', 'public', 'images');

// How close to pure white a pixel must be before we start fading it out,
// and the distance over which that fade happens (soft edge, not a hard cut).
const WHITE_START = 235; // below this distance-from-white -> fully opaque
const WHITE_END = 246; // at/above this -> fully transparent

function whiteness(r, g, b) {
  return Math.min(r, g, b);
}

async function processFile(name) {
  const filePath = path.join(DIR, name);
  const image = await Jimp.read(filePath);

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    const w = whiteness(r, g, b);

    let alpha;
    if (w <= WHITE_START) alpha = 255;
    else if (w >= WHITE_END) alpha = 0;
    else alpha = Math.round(255 * (1 - (w - WHITE_START) / (WHITE_END - WHITE_START)));

    image.bitmap.data[idx + 3] = alpha;
  });

  await image.write(filePath);
  console.log('processed', name);
}

(async () => {
  for (const f of FILES) {
    await processFile(f);
  }
})();
