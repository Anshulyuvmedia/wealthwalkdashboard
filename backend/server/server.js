'use strict';
require('dotenv').config();
// console.log('DHAN_ENV =', process.env.DHAN_ENV || 'NOT SET!!!');

const loopback = require('loopback');
const boot = require('loopback-boot');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = (module.exports = loopback());
app.enable('trust proxy');
app.use(loopback.static(path.join(__dirname, '../public')));
// Configure CORS
app.use(require('cors')({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-code'],
  credentials: true
}));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 1024 * 1024, // 1MB limit for non-file fields
    parts: 10 // Limit total parts (fields + files)
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer - Processing file:', file ? file.originalname : 'No file', 'MIME:', file ? file.mimetype : 'N/A');
    if (!file) {
      console.log('Multer - No file provided, proceeding');
      return cb(null, true);
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('Multer - Invalid file type:', file.mimetype);
      return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
    cb(null, true);
  }
}).fields([{ name: 'profileImage', maxCount: 1 }]);

// Multer middleware for /api/TdUsers/upload
app.use('/api/TdUsers/upload', (req, res, next) => {
  console.log('Middleware - /api/TdUsers/upload headers:', req.headers);
  console.log('Middleware - /api/TdUsers/upload content-type:', req.get('content-type'));
  if (!req.is('multipart/form-data')) {
    console.error('Multer - Expected multipart/form-data, got:', req.get('content-type'));
    return res.status(400).json({ error: { message: 'Request must be multipart/form-data' } });
  }
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer - MulterError:', err);
      return res.status(400).json({ error: { message: `Multer error: ${err.message}` } });
    } else if (err) {
      console.error('Multer - File upload error:', err);
      return res.status(400).json({ error: { message: err.message } });
    }
    console.log('Multer - Files processed successfully:', req.files);
    console.log('Multer - Body:', req.body);
    next();
  });
});

// Multer for /api/TdUsers (POST)
app.use('/api/TdUsers', (req, res, next) => {
  if (req.is('multipart/form-data')) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer - MulterError:', err);
        return res.status(400).json({ error: { message: `Multer error: ${err.message}` } });
      } else if (err) {
        console.error('Multer - File upload error:', err);
        return res.status(400).json({ error: { message: err.message } });
      }
      console.log('Multer - POST /api/TdUsers files:', req.files);
      console.log('Multer - POST /api/TdUsers body:', req.body);
      next();
    });
  } else {
    next();
  }
});

// Multer for PATCH /api/TdUsers/:id
app.use('/api/TdUsers/:id', (req, res, next) => {
  console.log(`Middleware - PATCH /api/TdUsers/${req.params.id} headers:`, req.headers);
  console.log(`Middleware - PATCH /api/TdUsers/${req.params.id} content-type:`, req.get('content-type'));
  if (req.is('multipart/form-data')) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer - MulterError:', err);
        return res.status(400).json({ error: { message: `Multer error: ${err.message}` } });
      } else if (err) {
        console.error('Multer - File upload error:', err);
        return res.status(400).json({ error: { message: err.message } });
      }
      console.log(`Multer - PATCH /api/TdUsers/${req.params.id} files:`, req.files);
      console.log(`Multer - PATCH /api/TdUsers/${req.params.id} body:`, req.body);
      next();
    });
  } else {
    next();
  }
});

// Middleware for /api/TdSubscriptions/subscribeToPlan to ensure POST
app.use('/api/TdSubscriptions/subscribeToPlan', (req, res, next) => {
  console.log(`Middleware - ${req.method} /api/TdSubscriptions/subscribeToPlan headers:`, req.headers);
  console.log(`Middleware - ${req.method} /api/TdSubscriptions/subscribeToPlan content-type:`, req.get('content-type'));
  if (req.method !== 'POST') {
    console.error(`Invalid method for /api/TdSubscriptions/subscribeToPlan: ${req.method}`);
    return res.status(405).json({ error: { message: 'Method Not Allowed. Use POST.' } });
  }
  next();
});

// Logging middleware
app.middleware('routes:before', morgan('combined', {
  skip: (req) => req.originalUrl.includes('/explorer')
}));

// Token middleware
app.use((req, res, next) => {
  if (req.path === '/api/TdUsers/upload') {
    console.log('Token Middleware - Processing for /api/TdUsers/upload');
    const tokenId = req.headers.authorization?.replace('Bearer ', '');
    if (!tokenId) {
      console.error('Token Middleware - No token provided for /api/TdUsers/upload');
      return res.status(401).json({ error: { message: 'No token provided' } });
    }
    app.models.AccessToken.findOne({ where: { id: tokenId } })
      .then(token => {
        if (!token) {
          console.error('Token Middleware - Invalid token for /api/TdUsers/upload');
          return res.status(401).json({ error: { message: 'Invalid token' } });
        }
        const now = new Date();
        const expires = new Date(new Date(token.created).getTime() + token.ttl * 1000);
        if (now > expires) {
          console.error('Token Middleware - Token expired for /api/TdUsers/upload');
          return res.status(401).json({ error: { message: 'Token expired' } });
        }
        req.accessToken = token;
        console.log('Token Middleware - Token validated for /api/TdUsers/upload:', { id: token.id, userId: token.userId });
        next();
      })
      .catch(err => {
        console.error('Token Middleware - Database error for /api/TdUsers/upload:', err);
        res.status(500).json({ error: { message: 'Internal server error' } });
      });
  } else {
    loopback.token({
      model: app.models.AccessToken,
      currentUserLiteral: 'me',
      searchDefaultTokenKeys: true,
      params: ['access_token'],
      headers: ['Authorization', 'authorization', 'AUTHORIZATION'],
      debug: true
    })(req, res, next);
  }
});

// Additional token validation
app.use((req, res, next) => {
  if (req.path === '/api/TdUsers/upload') {
    return next();
  }
  if (!req.accessToken && req.headers.authorization) {
    const tokenId = req.headers.authorization.replace('Bearer ', '');
    app.models.AccessToken.findOne({ where: { id: tokenId } })
      .then(token => {
        if (token) {
          const now = new Date();
          const expires = new Date(new Date(token.created).getTime() + token.ttl * 1000);
          if (now <= expires) {
            req.accessToken = token;
          }
        }
        next();
      })
      .catch(err => {
        console.error('Token Middleware - Database error:', err);
        next();
      });
  } else {
    next();
  }
});

// Body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
const uploadsDir = path.join(__dirname, 'Uploads');
app.use('/Uploads', loopback.static(uploadsDir));

// Initialize roles after boot
async function initializeRoles() {
  try {
    const Role = app.models.Role;
    if (!Role) {
      throw new Error('Role model is undefined');
    }
    for (const roleName of ['admin', 'user']) {
      let role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        role = await Role.create({ name: roleName });
        console.log(`Created ${roleName} role: ${role.id}`);
      } else {
        console.log(`Role ${roleName} already exists: ${role.id}`);
      }
    }
  } catch (error) {
    console.error('Error initializing roles:', error);
    throw error;
  }
}

// Bootstrap the application
boot(app, __dirname, async function (err) {
  if (err) {
    console.error('Error booting application:', err);
    throw err;
  }
  // Create Uploads directory
  await fs.mkdir(uploadsDir, { recursive: true });
  console.log('Created Uploads directory:', uploadsDir);

  app.models().forEach(model => {
    console.log(`✅ Model loaded: ${model.modelName}`);
  });

  // Initialize roles after models are loaded
  await initializeRoles();
  app.start();
});

app.start = function () {
  const server = app.listen(function () {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  server.timeout = 30000; // 30 seconds timeout for file uploads
  return server;
};

if (require.main === module) {
  // app.start() is called after initializeRoles
}

// After app.start()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.io = io;

io.on('connection', (socket) => {
  const token = socket.handshake.query.token;
  if (!token) return socket.disconnect();

  // Verify token and extract userId (reuse your JWT logic)
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret');
    const userId = decoded.userId;
    socket.join(`user_${userId}`);
    console.log(`Socket connected: user_${userId}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user_${userId}`);
    });
  } catch (e) {
    socket.disconnect();
  }
});

// Replace app.start() with:
server.listen(process.env.PORT || 3000, () => {
  console.log('Server + Socket.IO running on port', process.env.PORT || 3000);
});