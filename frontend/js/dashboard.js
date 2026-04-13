        // Page Loader Script
        window.addEventListener('load', function() {
            // Hide loader when page is fully loaded
            setTimeout(() => {
                document.getElementById('pageLoader').classList.add('hidden');
            }, 200);
        });

        // Value Styling Function - Apply conditional styling based on numeric values
        function applyValueStyling(element, numericValue) {
            if (!element) return;
            
            // Remove all value classes first
            element.classList.remove('value-positive', 'value-negative', 'value-zero');
            
            // Apply appropriate class based on value
            if (numericValue > 0) {
                element.classList.add('value-positive');
            } else if (numericValue < 0) {
                element.classList.add('value-negative');
            } else {
                element.classList.add('value-zero');
            }
        }

        // Initialize value styling on page load
        document.addEventListener('DOMContentLoaded', function() {
            const styleValueElements = () => {
                // Get all stat values, metric values, and panel values
                const allValueElements = [
                    ...document.querySelectorAll('.stat-value'),
                    ...document.querySelectorAll('.metric-value'),
                    ...document.querySelectorAll('.panel-value')
                ];

                allValueElements.forEach(element => {
                    const text = element.textContent.trim();
                    
                    // Parse numeric value from text (handles $, %, +, -, commas)
                    const numericMatch = text.match(/([+-]?)[\$]?([\d,]+\.?\d*)/);
                    if (numericMatch) {
                        let value = parseFloat(numericMatch[2].replace(/,/g, ''));
                        // Apply sign if present
                        if (numericMatch[1] === '-') {
                            value = -value;
                        }
                        applyValueStyling(element, value);
                    }
                });
            };

            // Apply styling initially
            styleValueElements();

            // Re-apply when content changes (for dynamic updates)
            const observer = new MutationObserver(styleValueElements);
            const targetNodes = document.querySelectorAll('.stat-card, .metric-card, .panel');
            targetNodes.forEach(node => {
                observer.observe(node, { childList: true, subtree: true, characterData: true });
            });
        });

        // Equity curve + Trade Distribution from Trade History data
        document.addEventListener('DOMContentLoaded', function() {
            const svg = document.querySelector('.equity-svg');
            const path = document.querySelector('.equity-curve-line');

            const stored = localStorage.getItem('tradeHistory');
            let trades = [];
            try {
                trades = stored ? JSON.parse(stored) || [] : [];
            } catch (e) {
                trades = [];
            }

            const metricCards = Array.from(document.querySelectorAll('.metric-card'));
            const setMetricValue = (labelText, valueText) => {
                const card = metricCards.find(item => {
                    const label = item.querySelector('.metric-label');
                    return label && label.textContent.trim().toLowerCase() === labelText.toLowerCase();
                });
                if (!card) return;
                const valueEl = card.querySelector('.metric-value');
                if (valueEl) valueEl.textContent = valueText;
            };

            const formatCurrency = (value) => {
                const sign = value >= 0 ? '+' : '-';
                const absValue = Math.abs(value);
                
                let formattedValue;
                if (absValue >= 1000000000) {
                    // Billions
                    formattedValue = (absValue / 1000000000).toFixed(1) + 'B';
                } else if (absValue >= 1000000) {
                    // Millions
                    formattedValue = (absValue / 1000000).toFixed(1) + 'M';
                } else if (absValue >= 1000) {
                    // Thousands
                    formattedValue = (absValue / 1000).toFixed(1) + 'K';
                } else {
                    // Less than 1000 - show with 2 decimals
                    formattedValue = absValue.toFixed(2);
                }
                
                return `${sign}$${formattedValue}`;
            };

            const normalizeSymbol = (symbolText) => {
                if (!symbolText) return '';
                return symbolText.replace(/^\s*[^A-Z0-9]+/i, '').trim();
            };

            const updateStatCardsFromTrades = (allTrades, closedTrades) => {
                const totalTrades = allTrades.length;
                const openTrades = allTrades.filter(trade => typeof trade.pnlValue !== 'number').length;
                const realizedPnL = closedTrades.reduce((sum, t) => sum + t.pnlValue, 0);
                const unrealizedPnL = 0;
                const totalPnL = realizedPnL + unrealizedPnL;
                const wins = closedTrades.filter(trade => trade.pnlValue > 0).length;
                const losses = closedTrades.filter(trade => trade.pnlValue < 0).length;
                const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

                const totalPnLCard = document.querySelectorAll('.stat-card')[0];
                if (totalPnLCard) {
                    const valueEl = totalPnLCard.querySelector('.stat-value');
                    const subtextEl = totalPnLCard.querySelector('.stat-subtext');
                    if (valueEl) valueEl.textContent = formatCurrency(totalPnL);
                    if (subtextEl) subtextEl.textContent = `${totalTrades} trades`;
                }

                const unrealizedCard = document.querySelectorAll('.stat-card')[1];
                if (unrealizedCard) {
                    const valueEl = unrealizedCard.querySelector('.stat-value');
                    const subtextEl = unrealizedCard.querySelector('.stat-subtext');
                    if (valueEl) valueEl.textContent = formatCurrency(unrealizedPnL);
                    if (subtextEl) subtextEl.textContent = `${openTrades} open trades`;
                }

                const realizedCard = document.querySelectorAll('.stat-card')[2];
                if (realizedCard) {
                    const valueEl = realizedCard.querySelector('.stat-value');
                    const subtextEl = realizedCard.querySelector('.stat-subtext');
                    if (valueEl) valueEl.textContent = formatCurrency(realizedPnL);
                    if (subtextEl) subtextEl.textContent = `${closedTrades.length} closed trades`;
                }

                const winRateCard = document.querySelectorAll('.stat-card')[3];
                if (winRateCard) {
                    const valueEl = winRateCard.querySelector('.stat-value');
                    const progressFill = winRateCard.querySelector('.stat-progress-fill');
                    if (valueEl) valueEl.textContent = `${winRate}%`;
                    if (progressFill) progressFill.style.width = `${winRate}%`;
                }

                const performancePanel = document.querySelector('.panel .panel-value');
                if (performancePanel) performancePanel.textContent = formatCurrency(totalPnL);
            };

            const updateWeeklyPerformance = (allTrades) => {
                const now = new Date();
                const dayOfWeek = now.getDay();
                
                // Calculate Monday of current week
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                startOfWeek.setHours(0, 0, 0, 0);

                // End date is today (current week going on)
                const endOfWeek = new Date(now);
                endOfWeek.setHours(23, 59, 59, 999);

                const dailyPnL = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
                const dailyProfit = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
                const dailyLoss = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
                let weeklyTotal = 0;

                allTrades.forEach(trade => {
                    if (typeof trade.pnlValue !== 'number') return;
                    const tradeDate = Number.isNaN(Date.parse(trade.date)) ? null : new Date(Date.parse(trade.date));
                    if (!tradeDate || tradeDate < startOfWeek || tradeDate > endOfWeek) return;

                    const tradeDayOfWeek = tradeDate.getDay();
                    const dayIndex = tradeDayOfWeek === 0 ? 6 : tradeDayOfWeek - 1;
                    dailyPnL[dayIndex] += trade.pnlValue;
                    weeklyTotal += trade.pnlValue;
                    
                    if (trade.pnlValue > 0) {
                        dailyProfit[dayIndex] += trade.pnlValue;
                    } else {
                        dailyLoss[dayIndex] += Math.abs(trade.pnlValue);
                    }
                });

                // Find max profit value across all days
                const maxProfit = Math.max(...Object.values(dailyProfit)) || 1;
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                const perfBars = document.querySelectorAll('.performance-day');
                perfBars.forEach((bar, idx) => {
                    const netValue = dailyPnL[idx] || 0;
                    const barEl = bar.querySelector('.bar');
                    const valueEl = bar.querySelector('.day-value');

                    // Bar width based on net profit relative to max profit day
                    const width = Math.abs(netValue) / maxProfit * 100;
                    barEl.style.width = `${width}%`;
                    barEl.classList.toggle('negative', netValue < 0);
                    valueEl.textContent = formatCurrency(netValue);
                });

                const performancePanel = document.querySelector('.panel .panel-value');
                if (performancePanel) performancePanel.textContent = formatCurrency(weeklyTotal);

                // Update date range display
                const weekDateRange = document.querySelector('#weekDateRange');
                if (weekDateRange) {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const endOfFullWeek = new Date(startOfWeek);
                    endOfFullWeek.setDate(startOfWeek.getDate() + 6); // Sunday of the week
                    
                    const startDate = startOfWeek.getDate();
                    const startMonth = monthNames[startOfWeek.getMonth()];
                    const endDate = endOfFullWeek.getDate();
                    const endMonth = monthNames[endOfFullWeek.getMonth()];
                    
                    weekDateRange.textContent = `${startDate} ${startMonth} - ${endDate} ${endMonth}`;
                }
            };

            // Function to get relative time (e.g., "2 min ago", "1 hour ago")
            const getRelativeTime = (dateString) => {
                if (!dateString) return 'Unknown';
                const tradeDate = new Date(dateString);
                const now = new Date();
                const seconds = Math.floor((now - tradeDate) / 1000);
                
                if (seconds < 60) return 'Just now';
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) return `${minutes} min ago`;
                const hours = Math.floor(minutes / 60);
                if (hours < 24) return `${hours}h ago`;
                const days = Math.floor(hours / 24);
                if (days < 7) return `${days}d ago`;
                return tradeDate.toLocaleDateString();
            };

            // Update Recent Activity Timeline with trade data
            const updateRecentActivity = (allTrades) => {
                const activityTimeline = document.getElementById('activityTimeline');
                if (!activityTimeline) return;

                // Get the spine element (which is the first child)
                const spine = activityTimeline.querySelector('.activity-spine');
                
                // Remove all activity cards (keep only spine)
                const cards = activityTimeline.querySelectorAll('.activity-card');
                cards.forEach(card => card.remove());

                if (allTrades.length === 0) {
                    const emptyMsg = document.createElement('p');
                    emptyMsg.style.cssText = 'color: rgba(255,255,255,0.5); text-align: center; padding: 2rem; font-size: 0.9rem;';
                    emptyMsg.textContent = 'No trades yet. Start trading to see activity.';
                    activityTimeline.appendChild(emptyMsg);
                    return;
                }

                // Sort trades by date (newest first)
                const sorted = allTrades.slice().sort((a, b) => {
                    const aDate = Number.isNaN(Date.parse(a.date)) ? null : Date.parse(a.date);
                    const bDate = Number.isNaN(Date.parse(b.date)) ? null : Date.parse(b.date);
                    if (aDate === null && bDate === null) return 0;
                    if (aDate === null) return 1;
                    if (bDate === null) return -1;
                    return bDate - aDate;
                });

                // Create activity cards for up to 6 most recent trades
                const recentTrades = sorted.slice(0, 6);
                recentTrades.forEach(trade => {
                    const isClosed = typeof trade.pnlValue === 'number';
                    const cardClass = isClosed ? 'trade-closed' : 'new-trade';
                    const icon = isClosed ? '✓' : '📈';
                    const title = isClosed ? 'Trade Closed' : 'Trade Opened';
                    
                    // Create description with symbol and type
                    const description = `${trade.symbol || 'Unknown'} ${trade.type ? '(' + trade.type.toUpperCase() + ')' : ''}`.trim();
                    
                    // Get relative time
                    const timeAgo = getRelativeTime(trade.date);

                    // Create card element
                    const card = document.createElement('div');
                    card.className = `activity-card ${cardClass}`;
                    
                    // Determine P&L color
                    const pnlClass = isClosed ? (trade.pnlValue >= 0 ? 'activity-pnl-positive' : 'activity-pnl-negative') : '';
                    const pnlText = isClosed ? formatCurrency(trade.pnlValue) : '';

                    card.innerHTML = `
                        <div class="activity-card-node"></div>
                        <div class="activity-card-left">
                            <div class="activity-card-icon">${icon}</div>
                        </div>
                        <div class="activity-card-center">
                            <h4 class="activity-card-title">${description} • ${timeAgo}</h4>
                            <p class="activity-card-description">${title}</p>
                        </div>
                        <div class="activity-card-right">
                            ${pnlText ? `<div class="activity-card-pnl ${pnlClass}">${pnlText}</div>` : ''}
                        </div>
                    `;
                    
                    activityTimeline.appendChild(card);
                });
            };

            const updateRecentTradesTable = (allTrades) => {
                const tradesTable = document.querySelector('.trades-table tbody');
                if (!tradesTable) return;

                const sorted = allTrades.slice().sort((a, b) => {
                    const aDate = Number.isNaN(Date.parse(a.date)) ? null : Date.parse(a.date);
                    const bDate = Number.isNaN(Date.parse(b.date)) ? null : Date.parse(b.date);
                    if (aDate === null && bDate === null) return 0;
                    if (aDate === null) return 1;
                    if (bDate === null) return -1;
                    return bDate - aDate;
                });

                const recentTrades = sorted.slice(0, 5);
                tradesTable.innerHTML = '';
                recentTrades.forEach(trade => {
                    const row = document.createElement('tr');
                    const isClosed = typeof trade.pnlValue === 'number';
                    const pnlClass = isClosed
                        ? (trade.pnlValue >= 0 ? 'pnl-positive' : 'pnl-negative')
                        : '';
                    const pnlText = isClosed ? formatCurrency(trade.pnlValue) : '--';
                    const statusClass = isClosed ? 'status-closed' : 'status-open';
                    const statusText = isClosed ? 'Closed' : 'Open';

                    row.innerHTML = `
                        <td class="pair">${normalizeSymbol(trade.symbol)}</td>
                        <td class="type">${trade.type || '--'}</td>
                        <td>${trade.entry || '--'}</td>
                        <td>${trade.exit || '--'}</td>
                        <td class="${pnlClass}">${pnlText}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    `;
                    tradesTable.appendChild(row);
                });
            };

            const closedTrades = trades
                .map((trade, index) => ({
                    ...trade,
                    _index: index,
                    _dateValue: Number.isNaN(Date.parse(trade.date)) ? null : Date.parse(trade.date)
                }))
                .filter(trade => typeof trade.pnlValue === 'number')
                .sort((a, b) => {
                    if (a._dateValue === null && b._dateValue === null) return a._index - b._index;
                    if (a._dateValue === null) return 1;
                    if (b._dateValue === null) return -1;
                    return a._dateValue - b._dateValue;
                });

            updateStatCardsFromTrades(trades, closedTrades);
            updateRecentTradesTable(trades);
            updateWeeklyPerformance(trades);
            updateRecentActivity(trades);

            const wins = closedTrades.filter(trade => trade.pnlValue > 0);
            const losses = closedTrades.filter(trade => trade.pnlValue < 0);
            const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnlValue, 0) / wins.length : 0;
            const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.pnlValue, 0)) / losses.length : 0;
            const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;

            let maxDrawdown = 0;
            let peak = 0;

            // Build equity values and drawdown
            let cumulative = 0;
            const equityValues = [0];
            closedTrades.forEach(trade => {
                cumulative += trade.pnlValue;
                equityValues.push(cumulative);
                if (cumulative > peak) peak = cumulative;
                const drawdown = peak - cumulative;
                if (drawdown > maxDrawdown) maxDrawdown = drawdown;
            });

            const drawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

            setMetricValue('Wins', `${wins.length}`);
            setMetricValue('Losses', `${losses.length}`);
            setMetricValue('Avg RR', `${avgRR.toFixed(2)}`);
            setMetricValue('Max Drawdown', `${drawdownPercent.toFixed(1)}%`);

            // Calculate Best and Worst Trades
            const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnlValue)) : 0;
            const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnlValue)) : 0;

            setMetricValue('Best Trade', formatCurrency(bestTrade));
            setMetricValue('Worst Trade', formatCurrency(worstTrade));

            if (!svg || !path || closedTrades.length === 0) return;

            const viewBox = svg.viewBox.baseVal;
            const width = viewBox && viewBox.width ? viewBox.width : 600;
            const height = viewBox && viewBox.height ? viewBox.height : 250;
            const padding = { left: 30, right: 30, top: 20, bottom: 30 };
            const plotWidth = width - padding.left - padding.right;
            const plotHeight = height - padding.top - padding.bottom;

            const minVal = Math.min(...equityValues, 0);
            const maxVal = Math.max(...equityValues, 0);
            const range = maxVal - minVal || 1;

            const points = equityValues.map((value, index) => {
                const t = equityValues.length === 1 ? 0.5 : index / (equityValues.length - 1);
                const x = padding.left + plotWidth * t;
                const y = padding.top + ((maxVal - value) / range) * plotHeight;
                return { x, y };
            });

            const pathData = points
                .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
                .join(' ');
            path.setAttribute('d', pathData);

            const length = path.getTotalLength();
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;
            path.style.animation = 'none';
            path.getBoundingClientRect();
            path.style.animation = 'drawCurve 2.5s ease-in-out forwards';

            svg.querySelectorAll('.equity-trade-point').forEach(point => point.remove());
            points.forEach(point => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'equity-trade-point');
                circle.setAttribute('cx', point.x.toFixed(2));
                circle.setAttribute('cy', point.y.toFixed(2));
                circle.setAttribute('r', '5');
                svg.appendChild(circle);
            });
        });

        // Show loader on link clicks
        document.addEventListener('DOMContentLoaded', function() {
            const links = document.querySelectorAll('a[href]');
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    
                    // Skip for anchor links, external links, and javascript:void
                    if (href.startsWith('#') || href.startsWith('javascript:') || 
                        this.getAttribute('target') === '_blank' || 
                        href.startsWith('http://') || href.startsWith('https://') ||
                        href.startsWith('mailto:') || href.startsWith('tel:')) {
                        return;
                    }
                    
                    // Show loader for internal page navigation
                    e.preventDefault();
                    const loader = document.getElementById('pageLoader');
                    loader.classList.remove('hidden');
                    
                    // Navigate after short delay
                    setTimeout(() => {
                        window.location.href = href;
                    }, 200);
                });
            });
        });

        // Trading Journal - Save Note Functionality
        document.addEventListener('DOMContentLoaded', function() {
            const saveNoteBtn = document.getElementById('saveNoteBtn');
            const journalTextarea = document.getElementById('journalTextarea');
            const savedNotesList = document.getElementById('savedNotesList');

            if (!saveNoteBtn || !journalTextarea || !savedNotesList) {
                return;
            }

            saveNoteBtn.addEventListener('click', function() {
                const noteText = journalTextarea.value.trim();

                // Do nothing if textarea is empty
                if (noteText === '') {
                    return;
                }

                // Get current time
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
                const dateString = now.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
                const timestamp = `${timeString} - ${dateString}`;

                // Create note item element
                const noteItem = document.createElement('div');
                noteItem.className = 'note-item';
                noteItem.innerHTML = `
                    <p class="note-text">${escapeHtml(noteText)}</p>
                    <div class="note-timestamp">${timestamp}</div>
                `;

                // Add note to top of the list
                savedNotesList.insertBefore(noteItem, savedNotesList.firstChild);

                // Clear textarea
                journalTextarea.value = '';
                journalTextarea.focus();
            });

            // Allow saving note with Enter + Ctrl/Cmd
            journalTextarea.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    saveNoteBtn.click();
                }
            });
        });

        // Helper function to escape HTML special characters
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }

        // Demo Trade Functionality
        document.addEventListener('DOMContentLoaded', function() {
            const toolbarDateTime = document.getElementById('toolbarDateTime');
            const updateToolbarDateTime = () => {
                if (!toolbarDateTime) return;
                const now = new Date();
                const day = now.toLocaleDateString('en-US', { weekday: 'short' });
                const month = now.toLocaleDateString('en-US', { month: 'short' });
                const date = now.getDate().toString().padStart(2, '0');
                const time = now.toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                toolbarDateTime.textContent = `${day} ${date} ${month} ${time}`;
            };

            updateToolbarDateTime();
            setInterval(updateToolbarDateTime, 1000);

            // Initialize centralized dashboard state
            window.dashboardState = {
                totalPnL: 0,
                realizedPnL: 0,
                wins: 0,
                losses: 0,
                trades: [],
                equityPoints: [0],
                dailyPnL: {}
            };

            const addSampleTradeBtn = document.getElementById('addSampleTradeBtn');
            const addSampleLossBtn = document.getElementById('addSampleLossBtn');

            if (addSampleTradeBtn) {
                addSampleTradeBtn.addEventListener('click', function() {
                // Create new trade object
                const newTrade = {
                    pair: 'EUR/USD',
                    type: 'Buy',
                    entry: '1.1000',
                    exit: '1.1050',
                    pnl: 50,
                    pnlText: '+$50',
                    status: 'Closed',
                    isWin: true
                };

                // Update dashboardState
                window.dashboardState.trades.push(newTrade);
                window.dashboardState.totalPnL += 50;
                window.dashboardState.realizedPnL += 50;
                window.dashboardState.wins += 1;

                // Update equity points
                const lastEquity = window.dashboardState.equityPoints[window.dashboardState.equityPoints.length - 1];
                window.dashboardState.equityPoints.push(lastEquity + 50);

                // Update daily P&L
                const today = new Date().getDate();
                if (!window.dashboardState.dailyPnL[today]) {
                    window.dashboardState.dailyPnL[today] = 0;
                }
                window.dashboardState.dailyPnL[today] += 50;

                // Update all UI elements from state
                updateDashboardUI();

                // Add activity log
                addActivityItem('Trade Closed', 'EUR/USD closed with +50$ profit', 'profit');

                // Disable button after one demo trade
                addSampleTradeBtn.disabled = true;
                addSampleTradeBtn.style.opacity = '0.5';
                addSampleTradeBtn.style.cursor = 'not-allowed';
                });
            }

            // Add Sample Loss button handler
            if (addSampleLossBtn) {
                addSampleLossBtn.addEventListener('click', function() {
                // Create new trade object
                const newTrade = {
                    pair: 'GBP/USD',
                    type: 'Sell',
                    entry: '1.2700',
                    exit: '1.2730',
                    pnl: -30,
                    pnlText: '-$30',
                    status: 'Closed',
                    isLoss: true
                };

                // Update dashboardState
                window.dashboardState.trades.push(newTrade);
                window.dashboardState.totalPnL -= 30;
                window.dashboardState.realizedPnL -= 30;
                window.dashboardState.losses += 1;

                // Update equity points
                const lastEquity = window.dashboardState.equityPoints[window.dashboardState.equityPoints.length - 1];
                window.dashboardState.equityPoints.push(lastEquity - 30);

                // Update daily P&L
                const today = new Date().getDate();
                if (!window.dashboardState.dailyPnL[today]) {
                    window.dashboardState.dailyPnL[today] = 0;
                }
                window.dashboardState.dailyPnL[today] -= 30;

                // Update all UI elements from state
                updateDashboardUI();

                // Add activity log
                addActivityItem('Trade Closed', 'GBP/USD closed with -30$ loss', 'loss');

                // Disable button after one demo trade
                addSampleLossBtn.disabled = true;
                addSampleLossBtn.style.opacity = '0.5';
                addSampleLossBtn.style.cursor = 'not-allowed';
                });
            }

            // Unified function to update all UI elements from dashboardState
            function updateDashboardUI() {
                const state = window.dashboardState;

                // 1. Update stat cards
                const totalTrades = state.trades.length;
                const closedTrades = state.trades.filter(t => t.status === 'Closed').length;

                // Update TOTAL P&L card
                const totalPnLCard = document.querySelectorAll('.stat-card')[0];
                if (totalPnLCard) {
                    const valueEl = totalPnLCard.querySelector('.stat-value');
                    const subtextEl = totalPnLCard.querySelector('.stat-subtext');
                    const sign = state.totalPnL >= 0 ? '+' : '';
                    if (valueEl) valueEl.textContent = `${sign}$${state.totalPnL}.00`;
                    if (subtextEl) subtextEl.textContent = `${totalTrades} trades`;
                }

                // Update REALIZED card
                const realizedCard = document.querySelectorAll('.stat-card')[2];
                if (realizedCard) {
                    const valueEl = realizedCard.querySelector('.stat-value');
                    const subtextEl = realizedCard.querySelector('.stat-subtext');
                    const sign = state.realizedPnL >= 0 ? '+' : '';
                    if (valueEl) valueEl.textContent = `${sign}$${state.realizedPnL}.00`;
                    if (subtextEl) subtextEl.textContent = `${closedTrades} closed trades`;
                }

                // Update WIN RATE card
                const winRateCard = document.querySelectorAll('.stat-card')[3];
                if (winRateCard) {
                    const totalWinLoss = state.wins + state.losses;
                    const winRate = totalWinLoss > 0 ? Math.round((state.wins / totalWinLoss) * 100) : 0;
                    const valueEl = winRateCard.querySelector('.stat-value');
                    const progressFill = winRateCard.querySelector('.stat-progress-fill');
                    if (valueEl) valueEl.textContent = `${winRate}%`;
                    if (progressFill) progressFill.style.width = `${winRate}%`;
                }

                // 2. Rebuild Recent Trades table from state
                const tradesTable = document.querySelector('.trades-table tbody');
                if (tradesTable) {
                    tradesTable.innerHTML = ''; // Clear existing rows
                    
                    // Add trades in reverse order (newest first)
                    const tradesToShow = state.trades.slice().reverse();
                    tradesToShow.forEach(trade => {
                        const row = document.createElement('tr');
                        const pnlClass = trade.pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                        row.innerHTML = `
                            <td class="pair">${trade.pair}</td>
                            <td class="type">${trade.type}</td>
                            <td>${trade.entry}</td>
                            <td>${trade.exit}</td>
                            <td class="${pnlClass}">${trade.pnlText}</td>
                            <td><span class="status-badge status-closed">${trade.status}</span></td>
                        `;
                        tradesTable.appendChild(row);
                    });
                }

                // 3. Redraw Equity Curve
                redrawEquityCurve();

                // 4. Update Monthly P&L calendar
                updateMonthlyCalendarFromState();
            }

            function updateMonthlyCalendarFromState() {
                const today = new Date().getDate();
                const allDayBoxes = document.querySelectorAll('.calendar-grid .day-box');
                
                // Update today's box (index 7 + day - 1)
                const targetIndex = 7 + today - 1;
                
                if (targetIndex < allDayBoxes.length) {
                    const dayBox = allDayBoxes[targetIndex];
                    const pnlValue = window.dashboardState.dailyPnL[today] || 0;

                    // Remove existing classes
                    dayBox.classList.remove('day-profit', 'day-loss');

                    if (pnlValue > 0) {
                        dayBox.classList.add('day-profit');
                        dayBox.textContent = `+${pnlValue}`;
                    } else if (pnlValue < 0) {
                        dayBox.classList.add('day-loss');
                        dayBox.textContent = `${pnlValue}`;
                    } else {
                        dayBox.textContent = '-';
                    }
                }
            }

            function addActivityItem(title, description, type) {
                // Get the activity timeline container
                const timeline = document.querySelector('.activity-timeline');
                if (!timeline) return;

                // Create new activity item
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                // Determine icon and class based on type
                let iconClass = '';
                let iconSymbol = '✓';
                if (type === 'profit') {
                    iconClass = 'profit';
                    iconSymbol = '✓';
                } else if (type === 'loss') {
                    iconClass = 'loss';
                    iconSymbol = '✗';
                }

                activityItem.innerHTML = `
                    <div class="activity-icon ${iconClass}">${iconSymbol}</div>
                    <div class="activity-content">
                        <p class="activity-action">${escapeHtml(title)}</p>
                        <p class="activity-description">${escapeHtml(description)}</p>
                    </div>
                    <div class="activity-time">Just now</div>
                `;

                // Add animation class
                activityItem.style.animation = 'slideInNote 0.4s ease-out forwards';
                activityItem.style.opacity = '0';

                // Insert at the top of the timeline
                timeline.insertBefore(activityItem, timeline.firstChild);

                // Trigger animation
                setTimeout(() => {
                    activityItem.style.opacity = '1';
                }, 10);

                // Limit to 10 items
                const allItems = timeline.querySelectorAll('.activity-item');
                if (allItems.length > 10) {
                    // Remove items beyond the 10th
                    for (let i = 10; i < allItems.length; i++) {
                        allItems[i].remove();
                    }
                }
            }

            function redrawEquityCurve() {
                const points = window.dashboardState.equityPoints;
                const svg = document.querySelector('.equity-svg');
                const pathElement = document.querySelector('.equity-curve-line');
                
                if (!svg || !pathElement || points.length === 0) return;

                // Get viewBox dimensions
                const viewBox = svg.getAttribute('viewBox').split(' ');
                const viewBoxWidth = parseFloat(viewBox[2]);
                const viewBoxHeight = parseFloat(viewBox[3]);

                // Define chart padding (top and bottom margins inside viewBox)
                const topPadding = 30;
                const bottomPadding = 40;
                const leftPadding = 30;
                const rightPadding = 20;
                const chartWidth = viewBoxWidth - leftPadding - rightPadding;
                const chartHeight = viewBoxHeight - topPadding - bottomPadding;

                // Calculate min and max equity for scaling
                const minEquity = Math.min(...points);
                const maxEquity = Math.max(...points);
                const equityRange = maxEquity - minEquity || 1; // Avoid division by zero

                // Build SVG path string
                let pathData = '';
                points.forEach((equity, index) => {
                    // X position: spread points evenly left to right
                    const xPosition = leftPadding + (index / (points.length - 1 || 1)) * chartWidth;
                    
                    // Y position: map equity to vertical position (inverted because SVG y increases downward)
                    const normalizedEquity = (equity - minEquity) / equityRange;
                    const yPosition = bottomPadding + chartHeight - (normalizedEquity * chartHeight);

                    if (index === 0) {
                        pathData += `M ${xPosition} ${yPosition}`;
                    } else {
                        pathData += ` L ${xPosition} ${yPosition}`;
                    }
                });

                // Update path with transition
                pathElement.style.transition = 'none';
                pathElement.setAttribute('d', pathData);
                pathElement.style.strokeDasharray = 'none';
                pathElement.style.strokeDashoffset = 'none';
                pathElement.style.animation = 'none';

                // Force repaint to ensure smooth transition
                void pathElement.offsetWidth;

                // Apply smooth transition
                pathElement.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
                pathElement.style.strokeDasharray = '500';
                pathElement.style.strokeDashoffset = '500';
                setTimeout(() => {
                    pathElement.style.strokeDashoffset = '0';
                }, 10);

                // Update/add the latest point marker circle
                let latestCircle = document.querySelector('.equity-latest-point');
                if (!latestCircle) {
                    latestCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    latestCircle.setAttribute('class', 'equity-latest-point');
                    svg.appendChild(latestCircle);
                }

                // Calculate position for latest point
                const lastIndex = points.length - 1;
                const lastEquity = points[lastIndex];
                const latestX = leftPadding + (lastIndex / (points.length - 1 || 1)) * chartWidth;
                const normalizedLastEquity = (lastEquity - minEquity) / equityRange;
                const latestY = bottomPadding + chartHeight - (normalizedLastEquity * chartHeight);

                latestCircle.setAttribute('cx', latestX);
                latestCircle.setAttribute('cy', latestY);
                latestCircle.setAttribute('r', '6');
                latestCircle.style.fill = '#FF9933';
                latestCircle.style.filter = 'drop-shadow(0 0 10px rgba(255, 153, 51, 0.8))';
                latestCircle.style.animation = 'fadeInPoint 0.6s ease-in-out forwards';
            }

            function updateStatCards() {
                const stats = window.demoStats;

                // Update TOTAL P&L card
                const totalPnLCard = document.querySelectorAll('.stat-card')[0];
                if (totalPnLCard) {
                    const valueEl = totalPnLCard.querySelector('.stat-value');
                    const subtextEl = totalPnLCard.querySelector('.stat-subtext');
                    if (valueEl) {
                        valueEl.textContent = `+$${stats.totalPnL}.00`;
                        applyValueStyling(valueEl, stats.totalPnL);
                    }
                    if (subtextEl) subtextEl.textContent = `${stats.totalTrades} trades`;
                }

                // Update UNREALIZED card (stays same in this demo)
                // const unrealizedCard = document.querySelectorAll('.stat-card')[1];

                // Update REALIZED card
                const realizedCard = document.querySelectorAll('.stat-card')[2];
                if (realizedCard) {
                    const valueEl = realizedCard.querySelector('.stat-value');
                    const subtextEl = realizedCard.querySelector('.stat-subtext');
                    if (valueEl) {
                        valueEl.textContent = `+$${stats.realizedPnL}.00`;
                        applyValueStyling(valueEl, stats.realizedPnL);
                    }
                    if (subtextEl) subtextEl.textContent = `${stats.closedTrades} closed trades`;
                }

                // Update WIN RATE card
                const winRateCard = document.querySelectorAll('.stat-card')[3];
                if (winRateCard) {
                    const totalWinLoss = stats.wins + stats.losses;
                    const winRate = totalWinLoss > 0 ? Math.round((stats.wins / totalWinLoss) * 100) : 0;
                    const valueEl = winRateCard.querySelector('.stat-value');
                    const progressFill = winRateCard.querySelector('.stat-progress-fill');
                    if (valueEl) {
                        valueEl.textContent = `${winRate}%`;
                        applyValueStyling(valueEl, winRate);
                    }
                    if (progressFill) progressFill.style.width = `${winRate}%`;
                }
            }
        });

        // Spotlight hover effect for cards
        document.addEventListener('DOMContentLoaded', function() {
            const cardSelectors = [
                '.stat-card',
                '.panel',
                '.trades-panel',
                '.journal-panel',
                '.equity-panel',
                '.distribution-panel',
                '.activity-panel',
                '.metric-card'
            ];
            const cards = document.querySelectorAll(cardSelectors.join(','));

            cards.forEach(card => {
                let rafId = null;
                const handleMove = (event) => {
                    const rect = card.getBoundingClientRect();
                    const x = ((event.clientX - rect.left) / rect.width) * 100;
                    const y = ((event.clientY - rect.top) / rect.height) * 100;

                    if (rafId) cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        card.style.setProperty('--mx', `${x}%`);
                        card.style.setProperty('--my', `${y}%`);
                    });
                };

                const handleLeave = () => {
                    if (rafId) cancelAnimationFrame(rafId);
                    card.style.setProperty('--mx', '50%');
                    card.style.setProperty('--my', '50%');
                };

                card.addEventListener('mousemove', handleMove);
                card.addEventListener('mouseleave', handleLeave);
            });
        });
        // Monthly P&L Calendar Feature
        let currentMonth = new Date();

        const generateCalendar = (month, year) => {
            const calendarGrid = document.getElementById('calendarGrid');
            const monthDisplay = document.getElementById('currentMonth');
            
            // Get trades from localStorage
            const stored = localStorage.getItem('tradeHistory');
            let trades = [];
            try {
                trades = stored ? JSON.parse(stored) || [] : [];
            } catch (e) {
                trades = [];
            }

            // Build day P&L map
            const dayPnLMap = {};
            trades.forEach(trade => {
                if (typeof trade.pnlValue !== 'number') return;
                const tradeDate = Number.isNaN(Date.parse(trade.date)) ? null : new Date(Date.parse(trade.date));
                if (!tradeDate) return;
                
                if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
                    const dayKey = tradeDate.getDate();
                    dayPnLMap[dayKey] = (dayPnLMap[dayKey] || 0) + trade.pnlValue;
                }
            });

            // Clear calendar (keep headers)
            const headerBoxes = calendarGrid.querySelectorAll('.day-box.header');
            calendarGrid.innerHTML = '';
            headerBoxes.forEach(box => calendarGrid.appendChild(box));

            // Update month display
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthDisplay.textContent = `${monthNames[month]} ${year}`;

            // Get first day of month and total days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Add empty boxes for days before month starts
            for (let i = 0; i < firstDay; i++) {
                const emptyBox = document.createElement('div');
                emptyBox.className = 'day-box';
                calendarGrid.appendChild(emptyBox);
            }

            // Add day boxes
            for (let day = 1; day <= daysInMonth; day++) {
                const dayBox = document.createElement('div');
                dayBox.className = 'day-box';
                
                const dayPnL = dayPnLMap[day];
                if (dayPnL !== undefined) {
                    const pnlClass = dayPnL > 0 ? 'day-profit' : 'day-loss';
                    dayBox.classList.add(pnlClass);
                    dayBox.innerHTML = `<div class="day-number">${day}</div><div class="day-pnl">${dayPnL > 0 ? '+' : ''}$${Math.abs(dayPnL).toFixed(0)}</div>`;
                } else {
                    dayBox.innerHTML = `<div class="day-number">${day}</div>`;
                }

                // Add click handler for day details
                dayBox.addEventListener('click', () => showDayDetails(day, month, year, trades));
                calendarGrid.appendChild(dayBox);
            }
        };

        const showDayDetails = (day, month, year, trades) => {
            const popup = document.getElementById('dayDetailsPopup');
            const titleEl = document.getElementById('dayDetailsTitle');
            const listEl = document.getElementById('dayTradesList');

            // Format title
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            titleEl.textContent = `${monthNames[month]} ${day}, ${year}`;

            // Filter trades for this day
            const dayTrades = trades.filter(trade => {
                const tradeDate = Number.isNaN(Date.parse(trade.date)) ? null : new Date(Date.parse(trade.date));
                return tradeDate && 
                       tradeDate.getDate() === day && 
                       tradeDate.getMonth() === month && 
                       tradeDate.getFullYear() === year &&
                       typeof trade.pnlValue === 'number';
            });

            // Populate trades
            if (dayTrades.length === 0) {
                listEl.innerHTML = '<p style="text-align: center; color: #aaa;">No trades on this day</p>';
            } else {
                listEl.innerHTML = dayTrades.map(trade => `
                    <div class="day-trade-item">
                        <div class="trade-pair">${trade.symbol}</div>
                        <div class="trade-details">
                            <div><strong>Type:</strong> ${trade.type}</div>
                            <div><strong>Size:</strong> ${trade.size}</div>
                            <div><strong>Entry:</strong> ${trade.entry}</div>
                            <div><strong>Exit:</strong> ${trade.exit || '--'}</div>
                        </div>
                        <div class="trade-pnl ${trade.pnlValue > 0 ? 'profit' : 'loss'}">
                            ${trade.pnlValue > 0 ? '+' : ''}$${Math.abs(trade.pnlValue).toFixed(2)}
                        </div>
                    </div>
                `).join('');
            }

            popup.style.display = 'flex';
        };

        // Month navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            generateCalendar(currentMonth.getMonth(), currentMonth.getFullYear());
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            generateCalendar(currentMonth.getMonth(), currentMonth.getFullYear());
        });

        // Close popup
        document.querySelector('.popup-close')?.addEventListener('click', () => {
            document.getElementById('dayDetailsPopup').style.display = 'none';
        });

        document.getElementById('dayDetailsPopup')?.addEventListener('click', (e) => {
            if (e.target.id === 'dayDetailsPopup') {
                e.target.style.display = 'none';
            }
        });

        // Initial calendar generation
        generateCalendar(currentMonth.getMonth(), currentMonth.getFullYear());