document.addEventListener('DOMContentLoaded', () => {
  console.log('⭐ Astro Events Page инициализирована');

  // Elements
  const form = document.getElementById('astro-form');
  const quickLocation = document.getElementById('quick-location');
  const loading = document.getElementById('loading');
  const eventsSection = document.getElementById('events-section');
  const rawSection = document.getElementById('raw-section');
  const errorState = document.getElementById('error-state');

  // State
  let currentEvents = [];
  let rawData = null;

  // Quick location selector
  quickLocation.addEventListener('change', () => {
    const value = quickLocation.value;
    if (value) {
      const [lat, lon] = value.split(',');
      form.lat.value = lat;
      form.lon.value = lon;
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadEvents();
  });

  // Load events function
  async function loadEvents() {
    showLoading();
    
    try {
      const formData = new FormData(form);
      const params = new URLSearchParams(formData);
      
      const response = await fetch(`/api/astro/events?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      rawData = data;
      processEvents(data);
      showEvents();
      
    } catch (error) {
      console.error('Ошибка загрузки астро событий:', error);
      showError(error.message);
    }
  }

  function showLoading() {
    loading.style.display = 'block';
    eventsSection.style.display = 'none';
    rawSection.style.display = 'none';
    errorState.style.display = 'none';
  }

  function showEvents() {
    loading.style.display = 'none';
    eventsSection.style.display = 'block';
    rawSection.style.display = 'block';
    errorState.style.display = 'none';
    
    // Update raw JSON
    document.getElementById('raw-json').textContent = JSON.stringify(rawData, null, 2);
  }

  function showError(message) {
    loading.style.display = 'none';
    eventsSection.style.display = 'none';
    rawSection.style.display = 'none';
    errorState.style.display = 'block';
    
    document.getElementById('error-message').textContent = message;
  }

  // Process events with the same logic as Laravel
  function processEvents(data) {
    const events = collectEvents(data);
    currentEvents = events;
    renderEventsTable(events);
    
    document.getElementById('events-count').textContent = `${events.length} событий`;
  }

  // Recursive function to collect events like in Laravel
  function collectEvents(obj) {
    const events = [];
    
    function traverse(current) {
      if (!current || typeof current !== 'object') return;
      
      if (Array.isArray(current)) {
        current.forEach(traverse);
        return;
      }
      
      // Check if this object looks like an event
      if ((current.type || current.event_type || current.category) && 
          (current.name || current.body || current.object || current.target)) {
        events.push(normalizeEvent(current));
      }
      
      // Traverse nested objects
      Object.values(current).forEach(traverse);
    }
    
    traverse(obj);
    return events;
  }

  // Normalize event data like in Laravel
  function normalizeEvent(event) {
    return {
      name: event.name || event.body || event.object || event.target || '',
      type: event.type || event.event_type || event.category || event.kind || '',
      when: event.time || event.date || event.occursAt || event.peak || event.instant || '',
      extra: event.magnitude || event.mag || event.altitude || event.note || ''
    };
  }

  function renderEventsTable(events) {
    const tbody = document.getElementById('events-table-body');
    
    if (events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">события не найдены</td></tr>';
      return;
    }
    
    tbody.innerHTML = events.slice(0, 200).map((event, index) => `
      <tr class="border-b border-gray-200 hover:bg-gray-100">
        <td class="py-3 px-3 text-gray-700">${index + 1}</td>
        <td class="py-3 px-3">
          <span class="font-medium text-gray-900">${event.name || '—'}</span>
        </td>
        <td class="py-3 px-3 text-gray-700">${event.type || '—'}</td>
        <td class="py-3 px-3">
          <code class="bg-gray-100 px-2 py-1 rounded text-gray-900 text-xs">
            ${event.when || '—'}
          </code>
        </td>
        <td class="py-3 px-3 text-gray-700">${event.extra || ''}</td>
      </tr>
    `).join('');
  }

  // Export CSV functionality
  document.getElementById('export-events').addEventListener('click', () => {
    if (currentEvents.length === 0) return;
    
    const csv = [
      ['#', 'Объект', 'Событие', 'Время UTC', 'Дополнительно'],
      ...currentEvents.map((event, index) => [
        index + 1,
        event.name || '',
        event.type || '',
        event.when || '',
        event.extra || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astro_events_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Global load function
  window.loadEvents = loadEvents;

  // Auto-load on page load with default parameters
  loadEvents();
});
