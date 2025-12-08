const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== VIEW ENGINE =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== LOCALS MIDDLEWARE =====
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ===== BASIC ROUTES =====
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Космический Дашборд | Кассиопея',
    message: 'Node.js сервер успешно запущен!'
  });
});

// Статус сервера
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'node-web',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// ===== ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Страница не найдена',
    error: 'Страница не найдена',
    status: 404
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    title: 'Ошибка сервера',
    error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : err.message,
    status: 500
  });
});

// ===== SERVER START =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js сервер запущен на порту ${PORT}`);
  console.log(`Доступен по адресу: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
