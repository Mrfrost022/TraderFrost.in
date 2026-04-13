// Trade Journal Page Script - Two Column Layout

let selectedTradeId = null;
let tradeJournals = {};

document.addEventListener('DOMContentLoaded', function() {
    // Load trade journals from localStorage
    loadTradeJournals();

    // Load and display trades on the left
    loadTrades();

    // Form submission
    const journalForm = document.getElementById('journalForm');
    if (journalForm) {
        journalForm.addEventListener('submit', handleSaveJournal);
    }

    // Search functionality
    const searchInput = document.getElementById('tradeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterTrades);
    }

    // Filter functionality
    const statusFilter = document.getElementById('tradeStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTrades);
    }
});

// Get trades from localStorage
function getTrades() {
    const trades = localStorage.getItem('tradeHistory');
    return trades ? JSON.parse(trades) : [];
}

// Load trade journals from localStorage
function loadTradeJournals() {
    const journals = localStorage.getItem('tradeJournals');
    tradeJournals = journals ? JSON.parse(journals) : {};
}

// Save trade journals to localStorage
function saveTradeJournals() {
    localStorage.setItem('tradeJournals', JSON.stringify(tradeJournals));
}

// Load and display trades
function loadTrades() {
    const trades = getTrades();
    displayTrades(trades);
}

// Display trades list
function displayTrades(trades) {
    const tradesList = document.getElementById('tradesList');
    if (!tradesList) return;

    if (trades.length === 0) {
        tradesList.innerHTML = `
            <div class="no-trade-message">
                <p>No trades available</p>
            </div>
        `;
        return;
    }

    // Sort trades by date (newest first)
    trades = trades.sort((a, b) => {
        const aDate = new Date(a.date || 0);
        const bDate = new Date(b.date || 0);
        return bDate - aDate;
    });

    tradesList.innerHTML = trades.map((trade, index) => {
        const tradeId = `${trade.symbol}_${trade.date}_${index}`;
        const isClosed = typeof trade.pnlValue === 'number';
        const status = isClosed ? 'Closed' : 'Open';
        const tradeDate = new Date(trade.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        const pnlClass = isClosed ? (trade.pnlValue >= 0 ? 'profit' : 'loss') : '';
        const pnlText = isClosed ? formatCurrency(trade.pnlValue) : '--';

        const hasJournal = tradeJournals[tradeId];

        return `
            <div class="trade-item ${selectedTradeId === tradeId ? 'selected' : ''} ${hasJournal ? 'has-journal' : ''}" data-trade-id="${tradeId}" data-index="${index}">
                <div class="trade-item-header">
                    <span class="trade-item-symbol">${trade.symbol || 'Unknown'}</span>
                    <span class="trade-item-pnl ${pnlClass}">${pnlText}</span>
                </div>
                <div class="trade-item-footer">
                    <span class="trade-item-date">${tradeDate}</span>
                    ${hasJournal ? '<span class="trade-item-badge">Journaled</span>' : `<span class="trade-item-type">${trade.type || '--'}</span>`}
                </div>
            </div>
        `;
    }).join('');

    // Attach click listeners to trades
    attachTradeListeners(trades);
}

// Attach listeners to trade items
function attachTradeListeners(trades) {
    document.querySelectorAll('.trade-item').forEach(item => {
        item.addEventListener('click', function() {
            const tradeId = this.dataset.tradeId;
            const index = parseInt(this.dataset.index);
            selectTrade(trades[index], tradeId);
        });
    });
}

// Select a trade and load its journal form
function selectTrade(trade, tradeId) {
    selectedTradeId = tradeId;

    // Update selected state
    document.querySelectorAll('.trade-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-trade-id="${tradeId}"]`).classList.add('selected');

    // Show form and hide no-trade message
    document.getElementById('noTradeSelected').style.display = 'none';
    document.getElementById('journalForm').style.display = 'flex';

    // Populate trade details
    document.getElementById('selectedSymbol').textContent = trade.symbol || '--';
    document.getElementById('selectedType').textContent = trade.type || '--';
    document.getElementById('selectedEntry').textContent = trade.entry || '--';
    document.getElementById('selectedExit').textContent = trade.exit || '--';
    
    const isClosed = typeof trade.pnlValue === 'number';
    const pnlText = isClosed ? formatCurrency(trade.pnlValue) : '--';
    document.getElementById('selectedPnL').textContent = pnlText;

    // Load existing journal for this trade if available
    if (tradeJournals[tradeId]) {
        const journal = tradeJournals[tradeId];
        document.getElementById('whyTook').value = journal.whyTook || '';
        document.getElementById('whyExit').value = journal.whyExit || '';
        document.getElementById('lessonsLearned').value = journal.lessonsLearned || '';
        document.getElementById('improvements').value = journal.improvements || '';
    } else {
        clearForm();
    }
}

// Filter trades based on search and filters
function filterTrades() {
    const searchTerm = document.getElementById('tradeSearchInput').value.toLowerCase();
    const journalFilter = document.getElementById('tradeStatusFilter').value;

    let trades = getTrades();
    const allTrades = getTrades();

    // Apply filters
    trades = trades.filter((trade, index) => {
        const matchesSearch = (trade.symbol || '').toLowerCase().includes(searchTerm);
        const tradeId = `${trade.symbol}_${trade.date}_${index}`;
        const hasJournal = tradeJournals[tradeId];
        
        if (journalFilter === 'journaled') {
            return matchesSearch && hasJournal;
        } else if (journalFilter === 'pending') {
            return matchesSearch && !hasJournal;
        }
        return matchesSearch;
    });

    displayTrades(trades);
}

// Handle save journal entry
function handleSaveJournal(e) {
    e.preventDefault();

    if (!selectedTradeId) {
        showNotification('Please select a trade first');
        return;
    }

    const journal = {
        whyTook: document.getElementById('whyTook').value,
        whyExit: document.getElementById('whyExit').value,
        lessonsLearned: document.getElementById('lessonsLearned').value,
        improvements: document.getElementById('improvements').value,
        savedAt: new Date().toISOString()
    };

    tradeJournals[selectedTradeId] = journal;
    saveTradeJournals();

    // Update trade list to show journal indicator
    loadTrades();
    selectTrade(getTrades()[0], selectedTradeId);

    showNotification('Journal entry saved successfully! 📝');
}

// Clear form
function clearForm() {
    document.getElementById('whyTook').value = '';
    document.getElementById('whyExit').value = '';
    document.getElementById('lessonsLearned').value = '';
    document.getElementById('improvements').value = '';
}

// Format currency
function formatCurrency(value) {
    if (typeof value !== 'number') return '--';
    
    const absValue = Math.abs(value);
    const sign = value >= 0 ? '+$' : '-$';
    let formattedValue;

    if (absValue >= 1000000) {
        formattedValue = (absValue / 1000000).toFixed(1) + 'M';
    } else if (absValue >= 1000) {
        formattedValue = (absValue / 1000).toFixed(1) + 'K';
    } else {
        formattedValue = absValue.toFixed(2);
    }
    
    return `${sign}${formattedValue}`;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FF9933 0%, #FFB366 100%);
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 24px rgba(255, 153, 51, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add styles for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
