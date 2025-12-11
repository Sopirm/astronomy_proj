document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const exportXLSXBtn = document.getElementById('export-xlsx-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const dataTableSection = document.getElementById('data-table-section');
    const emptyState = document.getElementById('empty-state');
    const legacyTableBody = document.getElementById('legacy-table-body');
    const filteredCountSpan = document.getElementById('filtered-count');
    const totalCountSpan = document.getElementById('total-count');
    
    let allData = [];
    let filteredData = [];
    let currentSort = { column: 'recorded_at', direction: 'desc' };

    // Fetch data from API
    async function fetchData() {
        try {
            const response = await axios.get('/api/legacy/data');
            allData = response.data;
            totalCountSpan.textContent = allData.length;
            applyFiltersAndSort();
            if (allData.length > 0) {
                dataTableSection.style.display = 'block';
                emptyState.style.display = 'none';
            } else {
                dataTableSection.style.display = 'none';
                emptyState.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching legacy data:', error);
            dataTableSection.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="text-6xl mb-4 text-red-500">⚠️</div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки данных</h3>
                <p class="text-gray-600">Не удалось загрузить данные Legacy. Попробуйте обновить страницу.</p>
                <button class="mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded text-blue-700"
                        onclick="window.location.reload()">
                  🔄 Обновить страницу
                </button>
            `;
        }
    }

    // Apply filters and sort
    function applyFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase();

        filteredData = allData.filter(item => {
            const matchesSearch = Object.values(item).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
            return matchesSearch;
        });

        // Sort data
        filteredData.sort((a, b) => {
            let valA = a[currentSort.column];
            let valB = b[currentSort.column];

            // Handle different types for sorting
            if (typeof valA === 'string' && !isNaN(new Date(valA)) && !isNaN(new Date(valB))) {
                // Treat as date if parsable
                valA = new Date(valA);
                valB = new Date(valB);
            } else if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
                // Treat as number if parsable
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }
            
            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        renderTable();
        updateFilterSummary();
    }

    // Render table rows
    function renderTable() {
        legacyTableBody.innerHTML = '';
        if (filteredData.length === 0) {
            legacyTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-600">Нет данных для отображения</td></tr>`;
            return;
        }

        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-100';
            row.innerHTML = `
                <td class="py-3 px-3 text-gray-700">${item.recorded_at ? new Date(item.recorded_at).toLocaleString('ru-RU') : '—'}</td>
                <td class="py-3 px-3 text-gray-700">${item.voltage !== undefined ? item.voltage : '—'}</td>
                <td class="py-3 px-3 text-gray-700">${item.temp !== undefined ? item.temp : '—'}</td>
                <td class="py-3 px-3 text-gray-700">${item.boolean_status !== undefined ? (item.boolean_status ? '✅ ИСТИНА' : '❌ ЛОЖЬ') : '—'}</td>
                <td class="py-3 px-3 text-gray-700">${item.numeric_value !== undefined ? item.numeric_value : '—'}</td>
                <td class="py-3 px-3 text-gray-700">${item.string_description !== undefined ? item.string_description : '—'}</td>
                <td class="py-3 px-3 text-gray-700">${item.source_file !== undefined ? item.source_file : '—'}</td>
            `;
            legacyTableBody.appendChild(row);
        });
    }

    // Update filter summary
    function updateFilterSummary() {
        filteredCountSpan.textContent = filteredData.length;
    }

    // Event Listeners
    searchInput.addEventListener('input', applyFiltersAndSort);
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSort = { column: 'recorded_at', direction: 'desc' };
        applyFiltersAndSort();
    });

    // Sort event listeners for table headers
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            applyFiltersAndSort();
            updateSortIndicators();
        });
    });

    // Update sort indicators in table headers
    function updateSortIndicators() {
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '↕️';
        });
        const activeHeader = document.querySelector(`th[data-sort="${currentSort.column}"] .sort-indicator`);
        if (activeHeader) {
            activeHeader.textContent = currentSort.direction === 'asc' ? '⬆️' : '⬇️';
        }
    }

    // Initial fetch
    fetchData();
});
