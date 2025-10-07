const loopback = require('loopback');
const boot = require('loopback-boot');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = (module.exports = loopback());
app.enable('trust proxy');

// Bootstrap the application first
boot(app, __dirname, function (err) {
  if (err) {
    console.error('Error booting application:', err);
    throw err;
  }

  // Enable LoopBack token middleware after models are loaded
  app.use(loopback.token({
    model: app.models.AccessToken,
    currentUserLiteral: 'me',
    searchDefaultTokenKeys: true,
    tokens: ['access_token', 'Authorization', 'bearer'],
    headers: ['Authorization', 'authorization', 'AUTHORIZATION'],
    debug: true, // Enable debug logging for token middleware
  }));

  // Logging middleware
  app.middleware('routes:before', morgan('combined', {
    skip: (req) => req.originalUrl.includes('/explorer'),
  }));

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (!file) return cb(null, true);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        console.log('File type rejected:', file.mimetype);
        return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
      }
      cb(null, true);
    },
  }).fields([{ name: 'profileImage', maxCount: 1 }]);

  // Apply multer only for multipart requests
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

  // Serve static files
  const uploadsDir = path.join(__dirname, '../Uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating Uploads directory:', uploadsDir);
    fs.mkdirSync(UploadsDir, { recursive: true });
  }
  app.use('/Uploads', loopback.static(uploadsDir));

  if (require.main === module) {
    app.start();
  }
});

app.start = function () {
  return app.listen(function () {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

app.models().forEach(model => {
  console.log(`✅ Model loaded: ${model.modelName}`);
});