const fs = require('fs/promises');
const path = require('path');

const BASE_UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads', 'properties');
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function createProcessingError() {
  const error = new Error('processing failed');
  error.code = 'IMG_003';
  return error;
}

async function getExistingPropertyImageCount(propertyId) {
  if (!SAFE_ID_PATTERN.test(propertyId)) {
    throw createProcessingError();
  }

  const propertyDir = path.resolve(BASE_UPLOADS_DIR, propertyId);
  if (!propertyDir.startsWith(`${BASE_UPLOADS_DIR}${path.sep}`)) {
    throw createProcessingError();
  }

  try {
    const entries = await fs.readdir(propertyDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile()).length;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return 0;
    }
    throw createProcessingError();
  }
}

module.exports = {
  getExistingPropertyImageCount
};
