document.addEventListener('DOMContentLoaded', () => {
  console.log('🧪 OSDR Page инициализирована');

  // Данные экспериментов
  const allItems = <%- JSON.stringify(items) %>;
  let filteredItems = [...allItems];
  let currentView = 'cards';

  // Элементы интерфейса
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const sortOptions = document.getElementById('sort-options');
  const viewCards = document.getElementById('view-cards');
  const viewTable = document.getElementById('view-table');
  const cardsView = document.getElementById('cards-view');
  const tableView = document.getElementById('table-view');
  const emptyState = document.getElementById('empty-state');

  // Функция фильтрации и поиска
  function filterItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusTerm = statusFilter.value;
    
    filteredItems = allItems.filter(item => {
      // Поиск по ключевым словам (требование info.txt)
      const searchMatch = !searchTerm || 
        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
        (item.dataset_id && item.dataset_id.toLowerCase().includes(searchTerm)) ||
        (item.id && item.id.toString().includes(searchTerm));
      
      // Фильтр по статусу
      const statusMatch = !statusTerm || item.status === statusTerm;
      
      return searchMatch && statusMatch;
    });

    // Сортировка (требование info.txt - по возрастанию/убыванию с выбором столбца)
    sortItems();
    renderItems();
    updateFilterSummary();
  }

  // Функция сортировки
  function sortItems() {
    const [field, direction] = sortOptions.value.split('_');
    
    filteredItems.sort((a, b) => {
      let aVal = a[field] || '';
      let bVal = b[field] || '';
      
      // Преобразование для дат
      if (field === 'updated_at' || field === 'inserted_at') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      // Преобразование для строк
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  // Функция рендеринга
  function renderItems() {
    if (filteredItems.length === 0) {
      cardsView.style.display = 'none';
      tableView.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    
    if (currentView === 'cards') {
      renderCards();
      cardsView.style.display = 'block';
      tableView.style.display = 'none';
    } else {
      renderTable();
      cardsView.style.display = 'none';
      tableView.style.display = 'block';
    }
  }

  function renderCards() {
    const grid = document.getElementById('experiments-grid');
    grid.innerHTML = filteredItems.map((item, index) => `
      <div class="experiment-card space-card rounded-lg p-5 cursor-pointer"
           onclick="viewDetails('${item.id}')">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-gray-900 mb-1">
              ${item.title || `Эксперимент ${item.dataset_id || item.id}`}
            </h4>
            <div class="text-sm text-gray-600">
              ID: <span class="font-mono text-gray-900">${item.dataset_id || item.id}</span>
            </div>
          </div>
          ${item.status ? `
            <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(item.status)}">
              ${item.status}
            </span>
          ` : ''}
        </div>
        <div class="space-y-2 text-sm">
          ${item.updated_at ? `
            <div class="flex justify-between">
              <span class="text-gray-600">Обновлено:</span>
              <span class="text-gray-900">${new Date(item.updated_at).toLocaleDateString('ru-RU')}</span>
            </div>
          ` : ''}
          ${item.rest_url ? `
            <div class="flex justify-between">
              <span class="text-gray-600">API:</span>
              <a href="${item.rest_url}" target="_blank" class="text-blue-600 hover:text-blue-700 text-xs font-mono transition-colors">
                🔗 REST API
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderTable() {
    const tbody = document.getElementById('experiments-table-body');
    tbody.innerHTML = filteredItems.map(item => `
      <tr class="border-b border-gray-200 hover:bg-gray-100 experiment-row">
        <td class="py-3 px-3">
          <span class="font-mono text-blue-600">${item.dataset_id || item.id}</span>
        </td>
        <td class="py-3 px-3">
          <div class="font-medium text-gray-900">${item.title || `Эксперимент ${item.dataset_id || item.id}`}</div>
        </td>
        <td class="py-3 px-3">
          ${item.status ? `
            <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(item.status)}">${item.status}</span>
          ` : '<span class="text-gray-500">—</span>'}
        </td>
        <td class="py-3 px-3 text-gray-700">
          ${item.updated_at ? new Date(item.updated_at).toLocaleDateString('ru-RU') : '—'}
        </td>
        <td class="py-3 px-3">
          <div class="flex space-x-1">
            <button class="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-xs"
                    onclick="viewDetails('${item.id}')">👁️ Подробно</button>
            ${item.rest_url ? `
              <button class="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 text-xs"
                      onclick="window.open('${item.rest_url}', '_blank')">🔗 API</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function getStatusClass(status) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border border-blue-300';
      default: return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    }
  }

  function updateFilterSummary() {
    document.getElementById('filtered-count').textContent = filteredItems.length;
    document.getElementById('total-count').textContent = allItems.length;
  }

  // Event listeners
  searchInput.addEventListener('input', filterItems);
  statusFilter.addEventListener('change', filterItems);
  sortOptions.addEventListener('change', filterItems);

  // Переключение видов
  viewCards.addEventListener('click', () => {
    currentView = 'cards';
    viewCards.classList.add('bg-blue-600', 'text-white');
    viewCards.classList.remove('text-gray-700');
    viewTable.classList.remove('bg-blue-600', 'text-white');
    viewTable.classList.add('text-gray-700');
    renderItems();
  });

  viewTable.addEventListener('click', () => {
    currentView = 'table';
    viewTable.classList.add('bg-blue-600', 'text-white');
    viewTable.classList.remove('text-gray-700');
    viewCards.classList.remove('bg-blue-600', 'text-white');
    viewCards.classList.add('text-gray-700');
    renderItems();
  });

  // Сброс фильтров
  document.getElementById('reset-filters').addEventListener('click', () => {
    searchInput.value = '';
    statusFilter.value = '';
    sortOptions.value = 'updated_at_desc';
    filterItems();
  });

  // Экспорт CSV
  document.getElementById('export-btn').addEventListener('click', () => {
    const csv = [
      ['ID', 'Dataset ID', 'Title', 'Status', 'Updated At', 'Created At', 'REST URL'],
      ...filteredItems.map(item => [
        item.id || '',
        item.dataset_id || '',
        item.title || '',
        item.status || '',
        item.updated_at || '',
        item.inserted_at || '',
        item.rest_url || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osdr_experiments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Глобальные функции
  window.viewDetails = function(id) {
    const item = allItems.find(i => i.id == id);
    if (!item) return;
    
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-gray-900">${item.title || `Эксперимент ${item.dataset_id || item.id}`}</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-600">ID:</span> <span class="text-gray-900 font-mono">${item.id}</span></div>
          <div><span class="text-gray-600">Dataset ID:</span> <span class="text-gray-900 font-mono">${item.dataset_id || '—'}</span></div>
          <div><span class="text-gray-600">Статус:</span> ${item.status ? `<span class="${getStatusClass(item.status)} px-2 py-1 rounded">${item.status}</span>` : '—'}</div>
          <div><span class="text-gray-600">Обновлено:</span> <span class="text-gray-900">${item.updated_at ? new Date(item.updated_at).toLocaleString('ru-RU') : '—'}</span></div>
        </div>
        ${item.rest_url ? `
          <div class="pt-4 border-t border-gray-300">
            <a href="${item.rest_url}" target="_blank" class="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded text-blue-700 transition-all">
              🔗 Открыть REST API
            </a>
          </div>
        ` : ''}
        ${item.raw ? `
          <details class="pt-4 border-t border-gray-300">
            <summary class="cursor-pointer text-gray-600 hover:text-gray-900">🔍 Сырые данные</summary>
            <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40 text-gray-900">${JSON.stringify(item.raw, null, 2)}</pre>
          </details>
        ` : ''}
      </div>
    `;
    
    modal.style.display = 'flex';
  };

  window.closeModal = function() {
    document.getElementById('detail-modal').style.display = 'none';
  };

  window.resetFilters = function() {
    document.getElementById('reset-filters').click();
  };

  // Инициализация
  filterItems();
});
