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

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../Uploads'),
  filename: (req, file, cb) => {
    const filename = `${Date.now()}_${file.originalname}`;
    console.log('Uploading file:', filename);
    cb(null, filename);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('File type rejected:', file.mimetype);
      return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
    cb(null, true);
  },
});

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating Uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/Uploads', loopback.static(path.join(__dirname, '../Uploads')));


// Bootstrap the application
boot(app, __dirname, function (err) {
  if (err) {
    console.error('Error booting application:', err);
    throw err;
  }

  // Start the server if `$ node server.js`
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