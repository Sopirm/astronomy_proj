document.addEventListener('DOMContentLoaded', () => {
  console.log('🔭 JWST Page инициализирована');

  // State
  let currentImages = [];
  let currentView = 'grid';
  let currentPage = 1;
  let slideshowTimer = null;
  let slideshowIndex = 0;
  let isPlaying = false;

  // Elements
  const form = document.getElementById('jwst-filters');
  const sourceSelect = document.getElementById('source-select');
  const suffixFilter = document.getElementById('suffix-filter');
  const programFilter = document.getElementById('program-filter');
  const loadingState = document.getElementById('loading-state');
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryList = document.getElementById('gallery-list');
  const slideshowContainer = document.getElementById('slideshow-container');
  const emptyState = document.getElementById('empty-state');

  // Toggle filter inputs based on source type
  sourceSelect.addEventListener('change', () => {
    const value = sourceSelect.value;
    suffixFilter.style.display = value === 'suffix' ? 'block' : 'none';
    programFilter.style.display = value === 'program' ? 'block' : 'none';
  });

  // Load images function
  async function loadImages(params = {}) {
    showLoading();
    
    try {
      const formData = new FormData(form);
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of formData.entries()) {
        if (value) queryParams.append(key, value);
      }
      
      // Add custom params
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });

      const response = await fetch(`/api/jwst/feed?${queryParams.toString()}`);
      const data = await response.json();
      
      currentImages = data.items || [];
      
      document.getElementById('images-count').textContent = currentImages.length;
      
      if (currentImages.length === 0) {
        showEmpty();
      } else {
        renderCurrentView();
      }
      
    } catch (error) {
      console.error('Ошибка загрузки JWST изображений:', error);
      showEmpty();
    }
  }

  function showLoading() {
    loadingState.style.display = 'block';
    galleryGrid.style.display = 'none';
    galleryList.style.display = 'none';
    slideshowContainer.style.display = 'none';
    emptyState.style.display = 'none';
  }

  function showEmpty() {
    loadingState.style.display = 'none';
    galleryGrid.style.display = 'none';
    galleryList.style.display = 'none';
    slideshowContainer.style.display = 'none';
    emptyState.style.display = 'block';
  }

  function renderCurrentView() {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    
    if (currentView === 'grid') {
      renderGrid();
    } else if (currentView === 'list') {
      renderList();
    } else if (currentView === 'slideshow') {
      renderSlideshow();
    }
  }

  function renderGrid() {
    galleryGrid.style.display = 'grid';
    galleryList.style.display = 'none';
    slideshowContainer.style.display = 'none';
    
    galleryGrid.innerHTML = currentImages.map((item, index) => `
      <div class="space-card rounded-lg overflow-hidden animate__animated animate__fadeInUp hover:scale-105 transition-transform cursor-pointer"
           style="animation-delay: ${index * 0.05}s"
           onclick="openFullscreen(${index})">
        <div class="aspect-square overflow-hidden">
          <img src="${item.url}" 
               alt="${item.caption}"
               class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
               loading="lazy">
        </div>
        <div class="p-4">
          <h4 class="text-sm font-semibold text-purple-400 mb-2 line-clamp-2">
            ${item.obs || 'JWST Image'}
          </h4>
          <div class="text-xs text-gray-400 space-y-1">
            ${item.program ? `<div>Program: ${item.program}</div>` : ''}
            ${item.inst.length ? `<div>Instruments: ${item.inst.join(', ')}</div>` : ''}
            ${item.suffix ? `<div>Suffix: ${item.suffix}</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderList() {
    galleryGrid.style.display = 'none';
    galleryList.style.display = 'block';
    slideshowContainer.style.display = 'none';
    
    galleryList.innerHTML = currentImages.map((item, index) => `
      <div class="space-card rounded-lg p-4 flex items-center space-x-4 animate__animated animate__fadeInUp hover:bg-opacity-80 transition-all cursor-pointer"
           style="animation-delay: ${index * 0.02}s"
           onclick="openFullscreen(${index})">
        <img src="${item.url}" 
             alt="${item.caption}"
             class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
             loading="lazy">
        <div class="flex-1">
          <h4 class="text-lg font-semibold text-purple-400 mb-1">
            ${item.obs || 'JWST Image'}
          </h4>
          <div class="text-sm text-gray-400 space-y-1">
            ${item.program ? `<div>Program: ${item.program}</div>` : ''}
            ${item.inst.length ? `<div>Instruments: ${item.inst.join(', ')}</div>` : ''}
            ${item.suffix ? `<div>Suffix: ${item.suffix}</div>` : ''}
          </div>
        </div>
        <div class="flex-shrink-0">
          <button class="px-3 py-2 bg-purple-600 bg-opacity-20 hover:bg-opacity-30 border border-purple-500 rounded text-purple-400 transition-all">
            👁️ Просмотр
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderSlideshow() {
    if (currentImages.length === 0) return;
    
    galleryGrid.style.display = 'none';
    galleryList.style.display = 'none';
    slideshowContainer.style.display = 'block';
    
    slideshowIndex = 0;
    updateSlideshow();
    
    document.getElementById('total-slides').textContent = currentImages.length;
  }

  function updateSlideshow() {
    if (currentImages.length === 0) return;
    
    const image = currentImages[slideshowIndex];
    document.getElementById('slideshow-image').src = image.url;
    document.getElementById('slideshow-caption').textContent = image.caption || image.obs || 'JWST Image';
    document.getElementById('current-slide').textContent = slideshowIndex + 1;
  }

  // View switching
  document.getElementById('grid-view').addEventListener('click', () => switchView('grid'));
  document.getElementById('list-view').addEventListener('click', () => switchView('list'));
  document.getElementById('slideshow-view').addEventListener('click', () => switchView('slideshow'));

  function switchView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('[id$="-view"]').forEach(btn => {
      btn.classList.remove('bg-purple-600', 'text-white');
      btn.classList.add('text-gray-400');
    });
    
    document.getElementById(view + '-view').classList.add('bg-purple-600', 'text-white');
    document.getElementById(view + '-view').classList.remove('text-gray-400');
    
    renderCurrentView();
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadImages();
  });

  // Reset filters
  document.getElementById('reset-filters-btn').addEventListener('click', () => {
    form.reset();
    sourceSelect.dispatchEvent(new Event('change'));
    loadImages();
  });

  // Random images
  document.getElementById('random-images-btn').addEventListener('click', () => {
    loadImages({ source: 'jpg', perPage: 24, page: Math.floor(Math.random() * 10) + 1 });
  });

  // Slideshow controls
  document.getElementById('prev-slide').addEventListener('click', () => {
    slideshowIndex = (slideshowIndex - 1 + currentImages.length) % currentImages.length;
    updateSlideshow();
  });

  document.getElementById('next-slide').addEventListener('click', () => {
    slideshowIndex = (slideshowIndex + 1) % currentImages.length;
    updateSlideshow();
  });

  document.getElementById('play-pause').addEventListener('click', () => {
    if (isPlaying) {
      clearInterval(slideshowTimer);
      document.getElementById('play-pause').innerHTML = '▶️ Воспроизвести';
    } else {
      slideshowTimer = setInterval(() => {
        slideshowIndex = (slideshowIndex + 1) % currentImages.length;
        updateSlideshow();
      }, 3000);
      document.getElementById('play-pause').innerHTML = '⏸️ Пауза';
    }
    isPlaying = !isPlaying;
  });

  // Fullscreen modal
  window.openFullscreen = function(index) {
    const modal = document.getElementById('fullscreen-modal');
    const image = currentImages[index];
    
    document.getElementById('fullscreen-image').src = image.url;
    document.getElementById('fs-title').textContent = image.obs || 'JWST Image';
    document.getElementById('fs-details').textContent = image.caption || '';
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Store current index for navigation
    modal.dataset.currentIndex = index;
  };

  document.getElementById('fs-close').addEventListener('click', () => {
    const modal = document.getElementById('fullscreen-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  // Download functionality
  document.getElementById('fs-download').addEventListener('click', () => {
    const modal = document.getElementById('fullscreen-modal');
    const index = parseInt(modal.dataset.currentIndex);
    const image = currentImages[index];
    
    const a = document.createElement('a');
    a.href = image.url;
    a.download = `jwst_${image.obs || 'image'}.jpg`;
    a.click();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('fullscreen-modal');
    if (modal.style.display === 'flex') {
      if (e.key === 'Escape') {
        document.getElementById('fs-close').click();
      } else if (e.key === 'ArrowLeft') {
        // Previous image
      } else if (e.key === 'ArrowRight') {
        // Next image
      }
    }
  });

  // Global reset function
  window.resetFilters = function() {
    document.getElementById('reset-filters-btn').click();
  };

  // Initial load
  loadImages();
});
