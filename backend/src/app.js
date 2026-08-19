require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const admissionRoutes = require('./routes/admissions');
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');
const scholarshipRoutes = require("./routes/scholarships");
const notificationRoutes =require("./routes/notifications");
const achievementRoutes =require("./routes/achievements");

const app = express();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);


app.use(morgan('tiny'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use('/uploads',express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {res.setHeader('Access-Control-Allow-Origin', '*');}
}));
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/notifications",notificationRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/achievements", achievementRoutes);
app.use(errorHandler);


module.exports = app;
