const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const engine = require('ejs-mate'); // Make sure ejs-mate is required

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
app.engine('ejs', engine); // Make sure ejs-mate is set as the engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== LOCALS MIDDLEWARE =====
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ===== HEALTH CHECK (до основных routes) =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'node-web',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// ===== ROUTES =====
const routes = require('./routes/index');
app.use('/', routes);

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
