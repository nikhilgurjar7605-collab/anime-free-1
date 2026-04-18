const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.fieldname === 'video') {
      uploadPath = path.join(__dirname, '../../uploads/videos');
    } else {
      uploadPath = path.join(__dirname, '../../uploads/thumbnails');
    }
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files allowed'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed for thumbnail'), false);
    }
  }
  cb(null, true);
};

const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || 500);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
});

module.exports = upload;
