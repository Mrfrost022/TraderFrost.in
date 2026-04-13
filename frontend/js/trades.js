// Add Trade Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('addTradeModal');
    const addTradeBtn = document.querySelector('.btn-add-trade');
    const cancelBtn = document.querySelector('.btn-modal-cancel');
    const closeBtn = document.querySelector('.modal-close');
    const backdrop = document.querySelector('.modal-backdrop');
    const modalForm = document.querySelector('.modal-form');
    const filterBtn = document.querySelector('.btn-filter');
    const filtersPanel = document.getElementById('tradesFiltersPanel');
    const filterPnl = document.getElementById('filterPnl');
    const filterType = document.getElementById('filterType');
    const filterTime = document.getElementById('filterTime');
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    const customRangeFrom = document.getElementById('customDateRange');
    const customRangeTo = document.getElementById('customDateRangeTo');
    const btnClearFilters = document.getElementById('btnClearFilters');
    const emptyState = document.querySelector('.empty-state');

    function parsePnlValue(pnlText) {
        if (!pnlText || pnlText === '--') return null;
        const cleaned = pnlText.replace(/[^0-9.+-]/g, '');
        if (!cleaned) return null;
        const value = parseFloat(cleaned);
        return Number.isNaN(value) ? null : value;
    }

    function getContractSize(symbol) {
        const upper = (symbol || '').toUpperCase();
        if (upper.includes('XAU') || upper.includes('XAG')) return 100;
        if (upper.includes('/') || upper.length === 6) return 100000;
        return 1;
    }

    function syncTradeHistoryToStorage() {
        const tbody = document.querySelector('.trades-history-table tbody');
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const trades = rows.map(row => {
            const cells = row.querySelectorAll('td');
            const date = cells[0]?.textContent?.trim() || '';
            const symbol = cells[1]?.textContent?.trim() || '';
            const type = cells[2]?.textContent?.trim() || '';
            const entry = cells[3]?.textContent?.trim() || '';
            const exit = cells[4]?.textContent?.trim() || '';
            const size = cells[5]?.textContent?.trim() || '';
            const pnlText = cells[6]?.textContent?.trim() || '';
            const pnlValue = parsePnlValue(pnlText);

            return {
                date,
                symbol,
                type,
                entry,
                exit,
                size,
                pnlText,
                pnlValue
            };
        });

        localStorage.setItem('tradeHistory', JSON.stringify(trades));
    }

    // Open modal
    function openModal() {
        modal.style.display = 'flex';
        // Force reflow to enable animation
        modal.offsetHeight;
        modal.classList.add('modal-open');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modalForm.reset();
        }, 300); // Match animation duration
    }

    // Event listeners
    addTradeBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    backdrop.addEventListener('click', closeModal);

    // Prevent closing when clicking inside modal
    document.querySelector('.modal-container').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Save Trade functionality
    modalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Read form values
        const symbol = document.getElementById('tradeSymbol').value.trim();
        const type = document.getElementById('tradeType').value;
        const entryPrice = parseFloat(document.getElementById('entryPrice').value);
        const exitPrice = document.getElementById('exitPrice').value;
        const quantity = parseFloat(document.getElementById('tradeQuantity').value);
        const entryDate = document.getElementById('entryDate').value;
        const exitDate = document.getElementById('exitDate').value;
        const notes = document.getElementById('tradeNotes').value.trim();

        // Validate required fields
        if (!symbol || !type || !entryPrice || !quantity || !entryDate) {
            alert('Please fill in all required fields');
            return;
        }

        // Calculate P&L if exit price exists
        let pnl = '--';
        let pnlClass = '';
        if (exitPrice) {
            const exitVal = parseFloat(exitPrice);
            const diff = type === 'long' ? (exitVal - entryPrice) : (entryPrice - exitVal);
            const contractSize = getContractSize(symbol);
            const pnlValue = diff * quantity * contractSize;
            pnl = (pnlValue >= 0 ? '+$' : '-$') + Math.abs(pnlValue).toFixed(2);
            pnlClass = pnlValue >= 0 ? 'pnl-positive' : 'pnl-negative';
        }

        // Format date
        const entryDateObj = new Date(entryDate);
        const formattedDate = entryDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        // Create table row
        const tbody = document.querySelector('.trades-history-table tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${formattedDate}</td>
            <td class="symbol-cell">
                <span class="symbol-icon">📊</span>
                ${symbol.toUpperCase()}
            </td>
            <td>
                <span class="type-badge type-${type}">${type === 'long' ? 'Long' : 'Short'}</span>
            </td>
            <td>${entryPrice.toFixed(5)}</td>
            <td>${exitPrice ? parseFloat(exitPrice).toFixed(5) : '--'}</td>
            <td>${quantity}</td>
            <td class="${pnlClass}">${pnl}</td>
            <td>
                <span class="source-badge">Manual</span>
            </td>
            <td>
                <button class="btn-delete-trade" title="Delete trade">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;

        // Add delete functionality
        newRow.querySelector('.btn-delete-trade').addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this trade?')) {
                newRow.remove();
                updateTradeCount();
                syncTradeHistoryToStorage();
            }
        });

        // Insert row at the top (most recent first)
        tbody.insertBefore(newRow, tbody.firstChild);

        // Update trade count
        updateTradeCount();
        syncTradeHistoryToStorage();

        // Close modal and reset form
        closeModal();
    });

    // Update trade count function
    function updateTradeCount() {
        const tbody = document.querySelector('.trades-history-table tbody');
        const tradeCount = tbody.querySelectorAll('tr').length;
        const countDisplay = document.querySelector('.trades-count');
        countDisplay.textContent = `${tradeCount} of ${tradeCount} trades`;
    }

    // Filters panel toggle
    if (filterBtn && filtersPanel) {
        filterBtn.addEventListener('click', function() {
            filtersPanel.classList.toggle('open');
        });
    }

    function getStartOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = (day + 6) % 7; // Monday start
        const start = new Date(date);
        start.setDate(date.getDate() - diff);
        return getStartOfDay(start);
    }

    function applyFilters() {
        const tbody = document.querySelector('.trades-history-table tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const pnlValue = filterPnl?.value || 'all';
        const typeValue = filterType?.value || 'all';
        const timeValue = filterTime?.value || 'all';
        const now = new Date();

        // Handle custom date fields visibility
        const showCustom = timeValue === 'custom';
        customRangeFrom?.classList.toggle('show', showCustom);
        customRangeTo?.classList.toggle('show', showCustom);

        let visibleCount = 0;

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const dateText = cells[0]?.textContent?.trim() || '';
            const typeText = cells[2]?.textContent?.trim().toLowerCase() || '';
            const pnlText = cells[6]?.textContent?.trim() || '';

            let passesPnl = true;
            if (pnlValue === 'profits') passesPnl = pnlText.startsWith('+');
            if (pnlValue === 'losses') passesPnl = pnlText.startsWith('-');

            let passesType = true;
            if (typeValue === 'long') passesType = typeText.includes('long');
            if (typeValue === 'short') passesType = typeText.includes('short');

            let passesTime = true;
            const dateValue = new Date(dateText);
            if (timeValue !== 'all' && !isNaN(dateValue)) {
                const startOfToday = getStartOfDay(now);
                const startOfWeek = getStartOfWeek(now);
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                const startOfLast3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);

                if (timeValue === 'today') passesTime = dateValue >= startOfToday;
                if (timeValue === 'this-week') passesTime = dateValue >= startOfWeek;
                if (timeValue === 'this-month') passesTime = dateValue >= startOfMonth;
                if (timeValue === 'last-month') passesTime = dateValue >= startOfLastMonth && dateValue <= endOfLastMonth;
                if (timeValue === 'last-3-months') passesTime = dateValue >= startOfLast3Months;
                if (timeValue === 'custom') {
                    const fromVal = filterFrom?.value ? new Date(filterFrom.value) : null;
                    const toVal = filterTo?.value ? new Date(filterTo.value) : null;
                    passesTime = true;
                    if (fromVal) passesTime = passesTime && dateValue >= getStartOfDay(fromVal);
                    if (toVal) passesTime = passesTime && dateValue <= new Date(toVal.getFullYear(), toVal.getMonth(), toVal.getDate(), 23, 59, 59);
                }
            }

            const isVisible = passesPnl && passesType && passesTime;
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
        }
    }

    // Attach filter listeners
    [filterPnl, filterType, filterTime, filterFrom, filterTo].forEach(control => {
        control?.addEventListener('change', applyFilters);
    });

    btnClearFilters?.addEventListener('click', function() {
        if (filterPnl) filterPnl.value = 'all';
        if (filterType) filterType.value = 'all';
        if (filterTime) filterTime.value = 'all';
        if (filterFrom) filterFrom.value = '';
        if (filterTo) filterTo.value = '';
        applyFilters();
    });

    // Initial sync for existing table rows
    syncTradeHistoryToStorage();

    // Mobile Sidebar Toggle Script
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('dashboardSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // Toggle sidebar on hamburger click
    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
            hamburgerMenu.classList.toggle('active');
        });
    }

    // Close sidebar when clicking overlay
    if (overlay && sidebar) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            hamburgerMenu.classList.remove('active');
        });
    }

    // Close sidebar when clicking a link
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            hamburgerMenu.classList.remove('active');
        });
    });

    // Close sidebar on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            hamburgerMenu.classList.remove('active');
        }
    });

    // Prevent body scroll when sidebar is open
    const updateBodyScroll = () => {
        if (sidebar && sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    hamburgerMenu?.addEventListener('click', updateBodyScroll);
    overlay?.addEventListener('click', updateBodyScroll);

    // Initial sync for existing table rows
    syncTradeHistoryToStorage();

    // Event delegation for delete buttons (existing rows)
    const tbody = document.querySelector('.trades-history-table tbody');
    if (tbody) {
        tbody.addEventListener('click', function(e) {
            const deleteBtn = e.target.closest('.btn-delete-trade');
            if (deleteBtn) {
                const row = deleteBtn.closest('tr');
                if (confirm('Are you sure you want to delete this trade?')) {
                    row.remove();
                    syncTradeHistoryToStorage();
                }
            }
        });
    }
});
