const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const MAX_BYTES = 1024 * 1024;
const TARGET_BYTES = 512000;
const RANGE_MIN = 307200;
const RANGE_MAX = 614400;
const MAX_DIMENSION = 1600;

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function generateWatermarkSvg(width, height) {
  const padding = Math.max(Math.round(Math.min(width, height) * 0.02), 12);
  const fontSize = Math.max(Math.round(Math.min(width, height) * 0.03), 16);
  return Buffer.from(
    `<svg width="${width}" height="${height}">
      <style>
        .watermark { fill: rgba(255, 255, 255, 0.25); font-size: ${fontSize}px; font-family: Arial, sans-serif; }
      </style>
      <text x="${width - padding}" y="${height - padding}" text-anchor="end" class="watermark">ARH Rentals</text>
    </svg>`
  );
}

async function encodeWithQuality(buffer, format, hasAlpha) {
  const attempts = format === 'png'
    ? [80, 70, 60, 50, 40]
    : [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30];

  let best = null;

  for (const quality of attempts) {
    let output;
    if (format === 'png') {
      output = await sharp(buffer)
        .png({ compressionLevel: 9, quality })
        .toBuffer();
    } else {
      output = await sharp(buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    const size = output.length;
    if (size >= RANGE_MIN && size <= RANGE_MAX) {
      return { buffer: output, size };
    }

    if (size <= MAX_BYTES) {
      if (!best || Math.abs(size - TARGET_BYTES) < Math.abs(best.size - TARGET_BYTES)) {
        best = { buffer: output, size };
      }
    }
  }

  if (best) {
    return best;
  }

  throw createError('IMG_003', 'processing failed');
}

async function processAndSavePropertyImage(buffer, mimeType, originalFilename, propertyId) {
  if (!['image/jpeg', 'image/png'].includes(mimeType)) {
    throw createError('IMG_001', 'invalid format');
  }

  if (buffer.length > MAX_BYTES) {
    throw createError('IMG_002', 'size too large');
  }

  const image = sharp(buffer).rotate();
  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true
  });

  const metadata = await resized.metadata();
  const width = metadata.width || MAX_DIMENSION;
  const height = metadata.height || MAX_DIMENSION;
  const watermark = generateWatermarkSvg(width, height);

  const compositedBuffer = await resized
    .composite([{ input: watermark, gravity: 'southeast' }])
    .toBuffer();

  const hasAlpha = Boolean(metadata.hasAlpha);
  let format = 'jpeg';
  if (mimeType === 'image/png' && hasAlpha) {
    format = 'png';
  }

  const { buffer: finalBuffer, size: finalSize } = await encodeWithQuality(
    compositedBuffer,
    format,
    hasAlpha
  );

  if (finalSize > MAX_BYTES) {
    throw createError('IMG_003', 'processing failed');
  }

  const random = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now();
  const extension = format === 'png' ? 'png' : 'jpg';
  const fileName = `img_${timestamp}_${random}.${extension}`;
  const folderPath = path.resolve(
    __dirname,
    '..',
    'uploads',
    'properties',
    String(propertyId)
  );

  await fs.mkdir(folderPath, { recursive: true });

  const filePath = path.join(folderPath, fileName);
  await fs.writeFile(filePath, finalBuffer);

  return {
    path: path.join('backend', 'uploads', 'properties', String(propertyId), fileName),
    bytes: finalSize,
    width,
    height,
    mime: format === 'png' ? 'image/png' : 'image/jpeg',
    original: originalFilename
  };
}

module.exports = {
  processAndSavePropertyImage
};
