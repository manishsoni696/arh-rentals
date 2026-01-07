getExistingPropertyImageCount from ../services/propertyImageStore
const express = require('express');
const multer = require('multer');
const { processAndSavePropertyImage } = require('../services/imageProcessor');
const { getExistingPropertyImageCount } = require('../services/propertyImageStore');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
    files: 10
  }
});

router.post('/api/property/upload-images', (req, res) => {
  upload.array('photos', 10)(req, res, async (error) => {
    if (error && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ ok: false, code: 'IMG_002', message: 'size too large' });
    }
    if (error && error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ ok: false, code: 'IMG_004', message: 'max image count exceeded' });
    }
    if (error) {
      return res.status(400).json({ ok: false, code: 'IMG_003', message: 'processing failed' });
    }

    try {
      const propertyId = req.body.property_id;
      if (!propertyId) {
        return res.status(400).json({ ok: false, code: 'IMG_003', message: 'processing failed' });
      }

      const files = req.files || [];
      if (files.length > 10) {
        return res.status(400).json({ ok: false, code: 'IMG_004', message: 'max image count exceeded' });
      }

      const existingCount = await getExistingPropertyImageCount(propertyId);
      if (existingCount + files.length > 10) {
        return res.status(400).json({ ok: false, code: 'IMG_004', message: 'max image count exceeded' });
      }

      for (const file of files) {
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
          return res.status(400).json({ ok: false, code: 'IMG_001', message: 'invalid format' });
        }
      }

      const results = [];
      for (const file of files) {
        const processed = await processAndSavePropertyImage(
          file.buffer,
          file.mimetype,
          file.originalname,
          propertyId
        );
        results.push({
          path: processed.path,
          bytes: processed.bytes,
          width: processed.width,
          height: processed.height,
          mime: processed.mime
        });
      }

      return res.json({ ok: true, property_id: propertyId, images: results });
    } catch (handlerError) {
      if (handlerError && handlerError.code === 'IMG_001') {
        return res.status(400).json({ ok: false, code: 'IMG_001', message: 'invalid format' });
      }
      if (handlerError && handlerError.code === 'IMG_002') {
        return res.status(400).json({ ok: false, code: 'IMG_002', message: 'size too large' });
      }
      if (handlerError && handlerError.code === 'IMG_004') {
        return res.status(400).json({ ok: false, code: 'IMG_004', message: 'max image count exceeded' });
      }
      return res.status(400).json({ ok: false, code: 'IMG_003', message: 'processing failed' });
    }
  });
});

module.exports = router;
