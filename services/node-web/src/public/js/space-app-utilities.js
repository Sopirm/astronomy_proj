// Advanced Space App Utilities  
window.SpaceApp = {
  // Enhanced Health Check
  async checkHealth() {
    try {
      const response = await axios.get('/health');
      const status = document.getElementById('health-status');
      const statusText = document.querySelector('#health-status').nextElementSibling;
      
      if (response.status === 200) {
        status.className = 'w-3 h-3 bg-neon-green rounded-full animate-pulse glow-green';
        statusText.textContent = 'Система онлайн';
        statusText.className = 'text-sm font-medium text-neon-green';
      }
    } catch (error) {
      const status = document.getElementById('health-status');
      const statusText = status.nextElementSibling;
      status.className = 'w-3 h-3 bg-red-500 rounded-full animate-pulse';
      statusText.textContent = 'Система офлайн';
      statusText.className = 'text-sm font-medium text-red-400';
    }
  },
  
  // Enhanced Loading
  showLoading(elementId, message = 'Загрузка данных...', icon = '⚡') {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="loading text-center py-12">
          <div class="text-4xl mb-4 cosmic-pulse">${icon}</div>
          <div class="text-lg font-medium text-neon-blue">${message}</div>
        </div>
      `;
    }
  },

  // Notification System
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-600 border-green-500 text-green-100',
      error: 'bg-red-600 border-red-500 text-red-100',
      warning: 'bg-yellow-600 border-yellow-500 text-yellow-100',
      info: 'bg-blue-600 border-blue-500 text-blue-100'
    };
    
    notification.className = `fixed top-24 right-6 z-50 p-4 rounded-lg border backdrop-blur-lg ${colors[type]} animate__animated animate__slideInRight`;
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-xl">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="font-medium">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-xl hover:opacity-70">✕</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate__slideOutRight');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  // Format dates
  formatDate(dateStr, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options })
      .format(new Date(dateStr));
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SpaceApp инициализирован');

  // Mobile menu functionality
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      document.body.classList.toggle('mobile-menu-open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('mobile-menu-open');
      });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
        document.body.classList.remove('mobile-menu-open');
      }
    });
  }

  // Update current time
  function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
      timeElement.textContent = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  updateTime();
  setInterval(updateTime, 1000);

  // Enhanced health check
  SpaceApp.checkHealth();
  setInterval(SpaceApp.checkHealth, 30000);

  // Add smooth transitions to all pages
  const links = document.querySelectorAll('a[href^="/"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      // Add loading state for page transitions
      if (link.href !== window.location.href) {
        document.body.style.opacity = '0.8';
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 200);
      }
    });
  });

  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.position = 'relative';
    });
  });

  // Add cosmic cursor trail effect
  let mouseTrail = [];
  document.addEventListener('mousemove', (e) => {
    mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    
    // Limit trail length
    if (mouseTrail.length > 20) {
      mouseTrail.shift();
    }
    
    // Remove old trails
    mouseTrail = mouseTrail.filter(point => Date.now() - point.time < 500);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.altKey) {
      switch(e.key) {
        case '1': window.location.href = '/dashboard'; break;
        case '2': window.location.href = '/iss'; break;
        case '3': window.location.href = '/jwst'; break;
        case '4': window.location.href = '/osdr'; break;
        case '5': window.location.href = '/astro'; break;
        case '6': window.location.href = '/legacy'; break;
      }
    }
  });

  // Page transition effects
  window.addEventListener('beforeunload', () => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0';
  });

  console.log('✨ Расширенная функциональность загружена');
  SpaceApp.showNotification('Космическая система готова к работе!', 'success', 3000);
});
