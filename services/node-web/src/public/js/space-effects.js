/**
 * Advanced Space Effects JavaScript
 * Продвинутые космические эффекты для дашборда
 */

class SpaceEffects {
  constructor() {
    this.particles = [];
    this.mouseTrail = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.initMouseEffects();
    this.initScrollEffects();
    this.initPageTransitions();
    this.initTypingEffects();
    
    console.log('✨ SpaceEffects инициализированы');
  }

  // ===== MOUSE EFFECTS =====
  initMouseEffects() {
    if (this.isReducedMotion) return;

    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      
      // Add point to trail
      this.mouseTrail.push({
        x: mouseX,
        y: mouseY,
        time: Date.now(),
        id: Math.random()
      });
      
      // Limit trail length
      if (this.mouseTrail.length > 15) {
        this.mouseTrail.shift();
      }
      
      // Remove old points
      this.mouseTrail = this.mouseTrail.filter(point => 
        Date.now() - point.time < 1000
      );

      clearTimeout(this.mouseStopTimer);
      this.mouseStopTimer = setTimeout(() => {
        isMouseMoving = false;
      }, 100);
    });

    // Reset transform on mouse leave
    document.addEventListener('mouseleave', () => {
      const cards = document.querySelectorAll('.space-card, .metric-card');
      cards.forEach(card => {
        card.style.transform = '';
      });
    });
  }

  // ===== SCROLL EFFECTS =====
  initScrollEffects() {
    // Removed scroll effects for simplified design
  }

  // ===== PAGE TRANSITIONS =====
  initPageTransitions() {
    /* Эффекты переходов страниц удалены */
  }

  // ===== TYPING EFFECTS =====
  initTypingEffects() {
    /* Эффекты ввода текста удалены */
  }

  // ===== UTILITY METHODS =====
  /* Статические методы утилит удалены */
}

// New class to manage dashboard specific logic
class DashboardManager {
  constructor(serverIssData) {
    this.serverIssData = serverIssData;
    this.map = null;
    this.issMarker = null;
    this.issTrail = null;
    this.speedChart = null;
    this.altChart = null;
    this.isFirstLoad = true;
    
    this.initDashboard();
    console.log('🚀 DashboardManager инициализирован');
  }

  initDashboard() {
    // Initialize map
    this.map = L.map('iss-map', {
      attributionControl: false,
      zoomControl: true,
      preferCanvas: true,
      trackResize: false
    }).setView([0, 0], 2);
    
    setTimeout(() => {
      this.map.invalidateSize(false);
    }, 100);
    
    L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution: '',
      noWrap: true
    }).addTo(this.map);
    
    this.issMarker = L.marker([0, 0]).addTo(this.map);
    this.issTrail = L.polyline([], { 
      color: '#3b82f6', 
      weight: 3,
      opacity: 0.7 
    }).addTo(this.map);

    // Initialize charts
    this.speedChart = new Chart(document.getElementById('speed-chart'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Скорость',
          data: [],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { 
            display: false,
            grid: { display: false }
          },
          y: { 
            display: false,
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        elements: {
          point: { radius: 0 }
        },
        animation: false,
        interaction: { intersect: false },
        layout: {
          padding: 0
        }
      }
    });
    
    this.altChart = new Chart(document.getElementById('altitude-chart'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Высота',
          data: [],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { 
            display: false,
            grid: { display: false }
          },
          y: { 
            display: false,
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        elements: {
          point: { radius: 0 }
        },
        animation: false,
        interaction: { intersect: false },
        layout: {
          padding: 0
        }
      }
    });

    // Initial load and periodic updates
    this.loadISSData();
    setInterval(() => this.loadISSData(), 60000);
    document.getElementById('data-points').textContent = Math.floor(Math.random() * 1000 + 500).toLocaleString();
    setInterval(() => this.updateDataPoints(), 30000);

    // Assign to window for global access
    window.refreshISS = () => this.loadISSData();
  }

  async loadISSData() {
    try {
      let realISSData;
      let wasFirstLoad = this.isFirstLoad;
      
      if (this.isFirstLoad && typeof this.serverIssData !== 'undefined') {
        realISSData = {
          latitude: this.serverIssData.payload?.latitude || 0,
          longitude: this.serverIssData.payload?.longitude || 0,
          velocity: this.serverIssData.payload?.velocity || 27600,
          altitude: this.serverIssData.payload?.altitude || 408
        };
        this.isFirstLoad = false;
        console.log('🚀 Используем серверные данные МКС:', realISSData);
      } else {
        SpaceApp.showLoading('iss-speed', 'Обновление...', '🔄');
        
        const response = await axios.get('/api/iss/last');
        const issData = response.data;
        
        realISSData = {
          latitude: issData.payload?.latitude || 0,
          longitude: issData.payload?.longitude || 0,
          velocity: issData.payload?.velocity || 27600,
          altitude: issData.payload?.altitude || 408
        };
        console.log('📡 Загружены данные МКС через API:', realISSData);
      }
      
      setTimeout(() => {
        this.updateMetricCard('iss-speed', realISSData.velocity, 'км/ч');
        this.updateMetricCard('iss-altitude', realISSData.altitude, 'км');
        this.updateMapPanel(realISSData);
        this.updateMapPosition(realISSData);
        this.updateCharts(realISSData);
        
        const message = wasFirstLoad ? 'Реальные данные МКС получены с сервера!' : 'Данные МКС обновлены через API!';
        SpaceApp.showNotification(message, 'success', 2000);
      }, 500);
      
    } catch (error) {
      console.error('Ошибка загрузки данных МКС:', error);
      
      const fallbackData = {
        latitude: 51.5074,
        longitude: -0.1278,
        velocity: 27600,
        altitude: 408
      };
      
      setTimeout(() => {
        this.updateMetricCard('iss-speed', fallbackData.velocity, 'км/ч');
        this.updateMetricCard('iss-altitude', fallbackData.altitude, 'км');
        this.updateMapPanel(fallbackData);
        this.updateMapPosition(fallbackData);
        this.updateCharts(fallbackData);
        
        SpaceApp.showNotification('Загружены резервные данные МКС', 'warning', 3000);
      }, 500);
    }
  }

  updateMetricCard(elementId, value, suffix = '') {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = Math.round(value).toLocaleString('ru-RU');
    }
  }
  
  updateMapPanel(data) {
    const coords = document.getElementById('map-coords');
    const velocity = document.getElementById('map-velocity');
    const altitude = document.getElementById('map-altitude');
    
    if (coords) coords.textContent = `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`;
    if (velocity) velocity.textContent = `${Math.round(data.velocity).toLocaleString()} км/ч`;
    if (altitude) altitude.textContent = `${data.altitude.toFixed(1)} км`;
  }
  
  updateMapPosition(data) {
    const newPos = [data.latitude, data.longitude];
    
    this.issMarker.setLatLng(newPos);
    
    const currentTrail = this.issTrail.getLatLngs();
    currentTrail.push(newPos);
    if (currentTrail.length > 50) currentTrail.shift();
    this.issTrail.setLatLngs(currentTrail);
    
    this.map.setView(newPos, this.map.getZoom());
  }
  
  updateCharts(data) {
    const now = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    this.speedChart.data.labels.push(now);
    this.speedChart.data.datasets[0].data.push(data.velocity);
    if (this.speedChart.data.labels.length > 30) {
      this.speedChart.data.labels.shift();
      this.speedChart.data.datasets[0].data.shift();
    }
    this.speedChart.update('none');
    
    this.altChart.data.labels.push(now);
    this.altChart.data.datasets[0].data.push(data.altitude);
    if (this.altChart.data.labels.length > 30) {
      this.altChart.data.labels.shift();
      this.altChart.data.datasets[0].data.shift();
    }
    this.altChart.update('none');
  }

  updateDataPoints() {
    const current = parseInt(document.getElementById('data-points').textContent.replace(/\D/g, '') || '0');
    const increment = Math.floor(Math.random() * 5 + 1);
    const newValue = current + increment;
    this.updateMetricCard('data-points', newValue);
  }
}

// Initialize Space Effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const spaceEffects = new SpaceEffects();
  
  /* Эффект ряби на кнопках удален */

  const serverIssDataElement = document.getElementById('server-iss-data');
  if (serverIssDataElement) {
    const serverIssData = JSON.parse(serverIssDataElement.textContent);
    new DashboardManager(serverIssData);
  }
});
