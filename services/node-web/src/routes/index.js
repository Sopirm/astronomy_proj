const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const IssController = require('../controllers/IssController');  
const OsdrController = require('../controllers/OsdrController');
const ProxyController = require('../controllers/ProxyController');
const AstroController = require('../controllers/AstroController');

const router = express.Router();

// Инициализация контроллеров
const dashboardController = new DashboardController();
const issController = new IssController();
const osdrController = new OsdrController();
const proxyController = new ProxyController();
const astroController = new AstroController();

// ===== ОСНОВНЫЕ СТРАНИЦЫ =====
// Разделение логики на контексты (требование info.txt)

// Главная → Дашборд
router.get('/', (req, res) => res.redirect('/dashboard'));

// Дашборд - общий обзор
router.get('/dashboard', (req, res) => dashboardController.index(req, res));

// OSDR - отдельная страница для космических экспериментов  
router.get('/osdr', (req, res) => osdrController.index(req, res));

// JWST - отдельная страница для телескопа (пока заглушка)
router.get('/jwst', (req, res) => {
  res.render('jwst', {
    title: 'JWST - Галерея изображений | Кассиопея',
    currentPath: req.path,
    layout: 'layout' // Explicitly specify the layout
  });
});

// Legacy - отдельная страница для Pascal CSV данных (пока заглушка)
router.get('/legacy', (req, res) => {
  res.render('legacy', {
    title: 'Legacy - CSV данные Pascal | Кассиопея', 
    currentPath: req.path,
    layout: 'layout' // Explicitly specify the layout
  });
});

// Астрономические события - отдельная страница
router.get('/astro', (req, res) => {
  res.render('astro', {
    title: 'Астрономические события | Кассиопея',
    currentPath: req.path,
    layout: 'layout' // Explicitly specify the layout
  });
});

// ===== API ЭНДПОИНТЫ (СОВМЕСТИМОСТЬ С LARAVEL) =====

// Прокси к rust_iss API - ТОЧНАЯ совместимость
router.get('/api/iss/last', (req, res) => issController.last(req, res));
router.get('/api/iss/trend', (req, res) => issController.trend(req, res));

// JWST галерея API - ТОЧНАЯ совместимость с Laravel
router.get('/api/jwst/feed', (req, res) => dashboardController.jwstFeed(req, res));

// Астрономические события API - ТОЧНАЯ совместимость
router.get('/api/astro/events', (req, res) => astroController.events(req, res));

// ===== CMS СОВМЕСТИМОСТЬ (если понадобится) =====
router.get('/page/:slug', (req, res) => {
  // Простая заглушка для CMS страниц
  res.render('cms-page', {
    title: `${req.params.slug} | Кассиопея`,
    currentPath: req.path,
    slug: req.params.slug
  });
});

module.exports = router;
