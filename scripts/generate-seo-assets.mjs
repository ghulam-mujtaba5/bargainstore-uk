import fs from "fs";
import path from "path";
import zlib from "zlib";

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      table[i] = c;
    }
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = createChunk("IHDR", ihdr);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
    rgbaBuffer.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatChunk = createChunk("IDAT", zlib.deflateSync(scanlines));
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createIconBuffer(size) {
  const buf = Buffer.alloc(size * size * 4);

  function setPixel(x, y, r, g, b, a = 255) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    // Simple alpha blending
    if (a < 255) {
      const srcA = a / 255;
      const dstA = buf[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
        buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
        buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
        buf[idx + 3] = Math.round(outA * 255);
      }
    } else {
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  const radius = size * 0.22;
  const borderThick = Math.max(1, Math.round(size * 0.035));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Rounded rect distance
      const dx = Math.max(radius - x, 0, x - (size - 1 - radius));
      const dy = Math.max(radius - y, 0, y - (size - 1 - radius));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Anti-aliased border
        const alpha = Math.min(1, Math.max(0, radius - dist + 0.5));
        
        // Check if inside border
        if (dist >= radius - borderThick || x < borderThick || x >= size - borderThick || y < borderThick || y >= size - borderThick) {
          // Yellow gold border: #FBBF24 (251, 191, 36)
          setPixel(x, y, 251, 191, 36, Math.round(alpha * 255));
        } else {
          // Gradient Navy background: from #001642 to #002B80
          const t = (x + y) / (2 * size);
          const r = Math.round(0 * (1 - t) + 0 * t);
          const g = Math.round(22 * (1 - t) + 43 * t);
          const b = Math.round(66 * (1 - t) + 128 * t);
          setPixel(x, y, r, g, b, Math.round(alpha * 255));
        }
      }
    }
  }

  // Draw Awning Roof / Triangle in Yellow: #FBBF24
  const roofTopY = size * 0.16;
  const roofBottomY = size * 0.32;
  const roofLeftX = size * 0.22;
  const roofRightX = size * 0.78;

  for (let y = Math.floor(roofTopY); y <= Math.ceil(roofBottomY); y++) {
    const t = (y - roofTopY) / (roofBottomY - roofTopY);
    const minX = size * 0.5 - t * (size * 0.5 - roofLeftX);
    const maxX = size * 0.5 + t * (roofRightX - size * 0.5);
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      // Yellow stripes: alternating gold #FBBF24 (251, 191, 36) and amber #D97706 (217, 119, 6)
      const stripe = Math.floor(((x - minX) / (maxX - minX)) * 5) % 2 === 0;
      if (stripe) {
        setPixel(x, y, 251, 191, 36, 255);
      } else {
        setPixel(x, y, 217, 119, 6, 255);
      }
    }
  }

  // Draw Bold "B" Monogram
  const bLeft = size * 0.28;
  const bRight = size * 0.72;
  const bTop = size * 0.36;
  const bBottom = size * 0.82;
  const bMid = (bTop + bBottom) * 0.5;
  const stemWidth = Math.max(2, size * 0.12);
  const barHeight = Math.max(2, size * 0.09);

  // Vertical Spine
  for (let y = Math.floor(bTop); y <= Math.ceil(bBottom); y++) {
    for (let x = Math.floor(bLeft); x <= Math.ceil(bLeft + stemWidth); x++) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }

  // Horizontal Bars (Top, Middle, Bottom)
  for (let x = Math.floor(bLeft); x <= Math.ceil(bRight - stemWidth * 0.5); x++) {
    for (let y = Math.floor(bTop); y <= Math.ceil(bTop + barHeight); y++) {
      setPixel(x, y, 255, 255, 255, 255);
    }
    for (let y = Math.floor(bMid - barHeight * 0.5); y <= Math.ceil(bMid + barHeight * 0.5); y++) {
      setPixel(x, y, 255, 255, 255, 255);
    }
    for (let y = Math.floor(bBottom - barHeight); y <= Math.ceil(bBottom); y++) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }

  // Top Loop Right Curve
  const topRadius = (bMid - bTop) * 0.5;
  const topCenterY = bTop + topRadius;
  const topCenterX = bRight - topRadius;
  for (let y = Math.floor(bTop); y <= Math.ceil(bMid); y++) {
    for (let x = Math.floor(topCenterX); x <= Math.ceil(topCenterX + topRadius); x++) {
      const d = Math.hypot(x - topCenterX, y - topCenterY);
      if (d <= topRadius && d >= topRadius - stemWidth) {
        setPixel(x, y, 255, 255, 255, 255);
      }
    }
  }

  // Bottom Loop Right Curve (slightly wider)
  const botRadius = (bBottom - bMid) * 0.5;
  const botCenterY = bMid + botRadius;
  const botCenterX = bRight - botRadius + (size * 0.02);
  for (let y = Math.floor(bMid); y <= Math.ceil(bBottom); y++) {
    for (let x = Math.floor(botCenterX); x <= Math.ceil(botCenterX + botRadius); x++) {
      const d = Math.hypot(x - botCenterX, y - botCenterY);
      if (d <= botRadius && d >= botRadius - stemWidth) {
        setPixel(x, y, 255, 255, 255, 255);
      }
    }
  }

  // Red Bargain Tag Dot: #DC2626 (220, 38, 38)
  const dotRadius = Math.max(1.5, size * 0.08);
  const dotX = size * 0.76;
  const dotY = size * 0.28;
  for (let y = Math.floor(dotY - dotRadius); y <= Math.ceil(dotY + dotRadius); y++) {
    for (let x = Math.floor(dotX - dotRadius); x <= Math.ceil(dotX + dotRadius); x++) {
      if (Math.hypot(x - dotX, y - dotY) <= dotRadius) {
        setPixel(x, y, 220, 38, 38, 255);
      }
    }
  }

  return buf;
}

function createOpenGraphBuffer(width = 1200, height = 630) {
  const buf = Buffer.alloc(width * height * 4);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * 4;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = a;
  }

  // Deep Navy background with radial gradient
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - width * 0.5) / width;
      const dy = (y - height * 0.5) / height;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = Math.round(0 + dist * 5);
      const g = Math.round(30 - dist * 15);
      const b = Math.round(95 - dist * 45);
      setPixel(x, y, Math.max(0, r), Math.max(10, g), Math.max(30, b), 255);
    }
  }

  // Outer border with gold highlight
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 16 || x >= width - 16 || y < 16 || y >= height - 16) {
        setPixel(x, y, 251, 191, 36, 255); // Gold border
      }
    }
  }

  // Stamp a 256x256 Icon on the Left
  const iconSize = 256;
  const iconBuf = createIconBuffer(iconSize);
  const startX = 100;
  const startY = Math.round((height - iconSize) / 2);

  for (let iy = 0; iy < iconSize; iy++) {
    for (let ix = 0; ix < iconSize; ix++) {
      const srcIdx = (iy * iconSize + ix) * 4;
      const a = iconBuf[srcIdx + 3];
      if (a > 0) {
        setPixel(startX + ix, startY + iy, iconBuf[srcIdx], iconBuf[srcIdx + 1], iconBuf[srcIdx + 2], a);
      }
    }
  }

  return buf;
}

function createIco(images) {
  // images: array of { width, height, pngBuffer }
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  const imageBuffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(img.pngBuffer.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset

    dirEntries.push(entry);
    imageBuffers.push(img.pngBuffer);
    offset += img.pngBuffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

const PUBLIC_DIR = path.resolve("public");
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// 1. Generate PNGs of various sizes
const sizes = [16, 32, 48, 180, 192, 512];
const generatedPngs = {};

for (const s of sizes) {
  const rawBuf = createIconBuffer(s);
  const png = encodePNG(s, s, rawBuf);
  generatedPngs[s] = png;
}

fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-16x16.png"), generatedPngs[16]);
fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-32x32.png"), generatedPngs[32]);
fs.writeFileSync(path.join(PUBLIC_DIR, "apple-touch-icon.png"), generatedPngs[180]);
fs.writeFileSync(path.join(PUBLIC_DIR, "icon-192.png"), generatedPngs[192]);
fs.writeFileSync(path.join(PUBLIC_DIR, "icon-512.png"), generatedPngs[512]);

// 2. Multi-size Favicon ICO
const ico = createIco([
  { width: 16, height: 16, pngBuffer: generatedPngs[16] },
  { width: 32, height: 32, pngBuffer: generatedPngs[32] },
  { width: 48, height: 48, pngBuffer: generatedPngs[48] },
]);
fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), ico);

// 3. OpenGraph 1200x630
const ogRaw = createOpenGraphBuffer(1200, 630);
const ogPng = encodePNG(1200, 630, ogRaw);
fs.writeFileSync(path.join(PUBLIC_DIR, "opengraph-image.png"), ogPng);
fs.writeFileSync(path.join(PUBLIC_DIR, "twitter-image.png"), ogPng);

// 4. Vector SVG Favicon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001642"/>
      <stop offset="100%" stop-color="#002b80"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="14" y="14" width="484" height="484" rx="98" fill="none" stroke="url(#gold)" stroke-width="16" stroke-opacity="0.75"/>
  <g filter="url(#shadow)">
    <!-- Storefront Awning -->
    <path d="M120 180 L392 180 L362 120 L150 120 Z" fill="url(#gold)"/>
    <polygon points="120,180 160,180 150,120" fill="#D97706"/>
    <polygon points="200,180 240,180 232,120" fill="#D97706"/>
    <polygon points="280,180 320,180 312,120" fill="#D97706"/>
    <polygon points="360,180 392,180 362,120" fill="#D97706"/>
    
    <!-- Central Bold "B" -->
    <text x="256" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="220" font-weight="900" fill="#FFFFFF" text-anchor="middle">B</text>
    
    <!-- Red UK clearance badge -->
    <circle cx="380" cy="180" r="36" fill="#DC2626"/>
    <text x="380" y="188" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">UK</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), svg);
fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.svg"), svg);

// 5. Web App Manifest
const manifest = {
  name: "BargainStore.uk — Trusted UK Brands At Low Prices",
  short_name: "BargainStore",
  description: "Real UK DIY, garden tools, paints, homewares and appliances with transparent price comparisons against Amazon and the high street. Fast UK delivery & free Click & Collect.",
  start_url: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#001642",
  theme_color: "#001642",
  categories: ["shopping", "lifestyle", "business"],
  icons: [
    {
      src: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    },
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "/icon.svg",
      sizes: "512x512",
      type: "image/svg+xml"
    }
  ]
};

fs.writeFileSync(path.join(PUBLIC_DIR, "site.webmanifest"), JSON.stringify(manifest, null, 2));

// 6. Windows BrowserConfig
const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icon-192.png"/>
      <TileColor>#001642</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(PUBLIC_DIR, "browserconfig.xml"), browserConfig);

console.log("All Favicon, Icon, Manifest, and SEO assets generated successfully!");
