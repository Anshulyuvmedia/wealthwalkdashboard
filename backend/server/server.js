const loopback = require('loopback');
const boot = require('loopback-boot');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = (module.exports = loopback());
app.enable('trust proxy');
app.middleware('routes:before', morgan('combined'));

// Enable LoopBack token middleware for authentication (place early in the chain)
app.use(loopback.token({
  // Optional: Customize token validation if needed
  model: app.models.AccessToken
}));

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true); // Allow requests without files
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('File type rejected:', file.mimetype);
      return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
    cb(null, true);
  },
}).fields([{ name: 'profileImage', maxCount: 1 }]);

// Apply multer middleware for specific routes (after token middleware)
app.use('/api/TdUsers', (req, res, next) => {
  console.log('POST /api/TdUsers headers:', req.headers);
  console.log('POST /api/TdUsers accessToken:', req.accessToken ? { id: req.accessToken.id, userId: req.accessToken.userId } : null);
  if (req.is('multipart/form-data')) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: { message: err.message } });
      } else if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ error: { message: err.message } });
      }
      console.log('POST /api/TdUsers files:', req.files);
      console.log('POST /api/TdUsers body:', req.body);
      next();
    });
  } else {
    next();
  }
});

app.use('/api/TdUsers/:id', (req, res, next) => {
  console.log(`PATCH /api/TdUsers/${req.params.id} headers:`, req.headers);
  console.log(`PATCH /api/TdUsers/${req.params.id} accessToken:`, req.accessToken ? { id: req.accessToken.id, userId: req.accessToken.userId } : null);
  if (req.is('multipart/form-data')) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: { message: err.message } });
      } else if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ error: { message: err.message } });
      }
      console.log(`PATCH /api/TdUsers/${req.params.id} files:`, req.files);
      console.log(`PATCH /api/TdUsers/${req.params.id} body:`, req.body);
      next();
    });
  } else {
    next();
  }
});

// Serve static files from the Uploads directory
const uploadsDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating Uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/Uploads', loopback.static(uploadsDir));

// Bootstrap the application
boot(app, __dirname, function (err) {
  if (err) {
    console.error('Error booting application:', err);
    throw err;
  }

  if (require.main === module) {
    app.start();
  }
});

app.start = function () {
  return app.listen(function () {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    try {
      if (app.get('loopback-component-explorer')) {
        const explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      }
    } catch (err) {
      console.warn('loopback-component-explorer not found or not configured.');
    }
  });
};

app.models().forEach(model => {
  console.log(`✅ Model loaded: ${model.modelName}`);
});