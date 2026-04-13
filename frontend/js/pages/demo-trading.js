(function () {
    const STORAGE_KEY = 'tf_demo_portfolio_v1';
    const CURRENCY = 'USD';

    const state = {
        data: null,
        chartRange: '1W',
        openSort: { key: 'pnl', direction: 'desc' },
        historySort: { key: 'closedAt', direction: 'desc' }
    };

    const el = {};

    function formatMoney(value) {
        const sign = value >= 0 ? '+' : '-';
        return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function formatUnsignedMoney(value) {
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function formatPct(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }

    function formatDateTime(ts) {
        const d = new Date(ts);
        return d.toLocaleString();
    }

    function hoursSince(ts) {
        return (Date.now() - ts) / 3600000;
    }

    function copyDefaultData() {
        const now = Date.now();
        const oneHour = 3600000;
        const oneDay = 86400000;

        const data = {
            account: {
                startingBalance: 10000,
                virtualBalance: 10000,
                riskPerTradePct: 1.5,
                maxAllowedDrawdownPct: 12
            },
            openPositions: [
                { id: 'op1', symbol: 'EURUSD', type: 'Buy', lot: 1.2, entry: 1.0815, current: 1.0834, sl: 1.0784, tp: 1.0875, openedAt: now - oneHour * 9 },
                { id: 'op2', symbol: 'XAUUSD', type: 'Sell', lot: 0.5, entry: 2168.3, current: 2163.6, sl: 2175.8, tp: 2152.0, openedAt: now - oneHour * 3.5 },
                { id: 'op3', symbol: 'BTCUSD', type: 'Buy', lot: 0.15, entry: 68210, current: 68780, sl: 67100, tp: 70600, openedAt: now - oneHour * 16 }
            ],
            tradeHistory: [
                { id: 'h1', symbol: 'GBPUSD', type: 'Sell', entry: 1.2748, exit: 1.2712, lot: 1.0, pnl: 360, closedAt: now - oneDay * 1.1 },
                { id: 'h2', symbol: 'NAS100', type: 'Buy', entry: 18340.0, exit: 18302.0, lot: 0.3, pnl: -114, closedAt: now - oneDay * 2.2 },
                { id: 'h3', symbol: 'USDJPY', type: 'Buy', entry: 150.15, exit: 150.48, lot: 1.4, pnl: 308, closedAt: now - oneDay * 3.7 },
                { id: 'h4', symbol: 'ETHUSD', type: 'Buy', entry: 3468, exit: 3518, lot: 0.65, pnl: 325, closedAt: now - oneDay * 5.2 },
                { id: 'h5', symbol: 'XAUUSD', type: 'Sell', entry: 2155, exit: 2158, lot: 0.5, pnl: -150, closedAt: now - oneDay * 6.6 }
            ],
            equityCurve: buildDefaultCurve(now, 10000),
            activity: [
                { id: 'a1', text: 'Closed GBPUSD trade with +$360.00 profit.', ts: now - oneHour * 28 },
                { id: 'a2', text: 'Opened XAUUSD short position (0.5 lot).', ts: now - oneHour * 4 },
                { id: 'a3', text: 'Portfolio crossed +5% growth this week.', ts: now - oneHour * 2.3 }
            ]
        };

        return data;
    }

    function buildDefaultCurve(now, start) {
        const points = [];
        const days = 45;
        let v = start;
        for (let i = days; i >= 0; i -= 1) {
            const t = now - i * 86400000;
            const drift = Math.sin(i * 0.35) * 55 + Math.cos(i * 0.16) * 35;
            v += drift * 0.08;
            points.push({ t, v: Math.max(7000, v) });
        }
        return points;
    }

    function loadData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            state.data = copyDefaultData();
            saveData();
            return;
        }
        try {
            state.data = JSON.parse(raw);
        } catch (err) {
            state.data = copyDefaultData();
            saveData();
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    }

    function pnlForPosition(position) {
        const direction = position.type.toLowerCase() === 'buy' ? 1 : -1;
        const move = (position.current - position.entry) * direction;
        const multiplier = symbolMultiplier(position.symbol);
        return move * position.lot * multiplier;
    }

    function symbolMultiplier(symbol) {
        if (symbol.includes('USD') && symbol.length === 6) return 100000;
        if (symbol === 'XAUUSD') return 100;
        if (symbol.includes('BTC') || symbol.includes('ETH')) return 1;
        if (symbol.includes('NAS') || symbol.includes('SPX')) return 10;
        return 1000;
    }

    function computeMetrics() {
        const data = state.data;
        const floatingPnL = data.openPositions.reduce((sum, p) => sum + pnlForPosition(p), 0);
        const totalClosedPnL = data.tradeHistory.reduce((sum, t) => sum + t.pnl, 0);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayPnL = data.tradeHistory
            .filter((t) => t.closedAt >= todayStart.getTime())
            .reduce((sum, t) => sum + t.pnl, 0);

        const usedMargin = data.openPositions.reduce((sum, p) => sum + p.lot * 220, 0);
        const equity = data.account.virtualBalance + totalClosedPnL + floatingPnL;
        const freeMargin = equity - usedMargin;
        const growthPct = ((equity - data.account.startingBalance) / data.account.startingBalance) * 100;

        return {
            virtualBalance: data.account.virtualBalance,
            equity,
            usedMargin,
            freeMargin,
            floatingPnL,
            todayPnL,
            totalPnL: totalClosedPnL + floatingPnL,
            growthPct
        };
    }

    function renderOverview() {
        const m = computeMetrics();
        const marginLevel = m.usedMargin > 0 ? (m.equity / m.usedMargin) * 100 : 0;
        const closedTrades = state.data.tradeHistory;
        const wins = closedTrades.filter((t) => t.pnl > 0).length;
        const winRate = closedTrades.length ? (wins / closedTrades.length) * 100 : 0;

        el.overviewSummary.innerHTML = `
            <article class="overview-summary-main">
                <span class="overview-badge">Live Account Health</span>
                <div class="overview-main-value">${formatUnsignedMoney(m.equity)}</div>
                <div class="overview-main-meta">
                    <span>Margin Level: <strong>${marginLevel.toFixed(1)}%</strong></span>
                    <span>Open Trades: <strong>${state.data.openPositions.length}</strong></span>
                    <span class="overview-growth ${m.growthPct >= 0 ? 'positive' : 'negative'}">Growth ${formatPct(m.growthPct)}</span>
                </div>
            </article>
            <article class="overview-summary-side">
                <div class="overview-mini-item"><span class="mini-label">Win Rate</span><strong>${winRate.toFixed(1)}%</strong></div>
                <div class="overview-mini-bar"><span style="width:${Math.max(0, Math.min(100, winRate)).toFixed(1)}%"></span></div>
                <div class="overview-mini-item"><span class="mini-label">Free Margin Buffer</span><strong>${m.equity > 0 ? ((m.freeMargin / m.equity) * 100).toFixed(1) : '0.0'}%</strong></div>
                <div class="overview-mini-bar"><span style="width:${Math.max(0, Math.min(100, m.equity > 0 ? (m.freeMargin / m.equity) * 100 : 0)).toFixed(1)}%"></span></div>
            </article>
        `;

        const freeMarginBuffer = m.equity > 0 ? (m.freeMargin / m.equity) * 100 : 0;
        const usedMarginRatio = m.equity > 0 ? (m.usedMargin / m.equity) * 100 : 0;

        const entries = [
            {
                label: 'Account Balance',
                desc: 'Current virtual capital',
                icon: '$',
                format: 'moneyUnsigned',
                target: m.virtualBalance,
                valueClass: 'neutral',
                trendPct: ((m.virtualBalance - state.data.account.startingBalance) / state.data.account.startingBalance) * 100
            },
            {
                label: 'Equity',
                desc: 'Balance including open trades',
                icon: '=',
                format: 'moneyUnsigned',
                target: m.equity,
                valueClass: 'neutral',
                trendPct: m.growthPct
            },
            {
                label: 'Total PnL',
                desc: 'Open + closed performance',
                icon: 'P',
                format: 'moneySigned',
                target: m.totalPnL,
                valueClass: m.totalPnL >= 0 ? 'positive' : 'negative',
                trendPct: m.growthPct
            },
            {
                label: "Today's PnL",
                desc: 'Today closed-trade result',
                icon: 'D',
                format: 'moneySigned',
                target: m.todayPnL,
                valueClass: m.todayPnL >= 0 ? 'positive' : 'negative',
                trendPct: m.equity > 0 ? (m.todayPnL / m.equity) * 100 : 0
            },
            {
                label: 'Free Margin',
                desc: 'Available for new positions',
                icon: 'F',
                format: 'moneySigned',
                target: m.freeMargin,
                valueClass: m.freeMargin >= 0 ? 'positive' : 'negative',
                trendPct: freeMarginBuffer
            },
            {
                label: 'Used Margin',
                desc: 'Capital locked in trades',
                icon: 'U',
                format: 'moneyUnsigned',
                target: m.usedMargin,
                valueClass: 'neutral',
                trendPct: usedMarginRatio
            },
            {
                label: 'Margin Level',
                desc: 'Equity / used margin ratio',
                icon: 'M',
                format: 'pct',
                target: marginLevel,
                valueClass: marginLevel >= 100 ? 'positive' : 'negative',
                trendPct: marginLevel - 100
            },
            {
                label: 'Account Growth %',
                desc: 'Return vs start balance',
                icon: 'G',
                format: 'pctSigned',
                target: m.growthPct,
                valueClass: m.growthPct >= 0 ? 'positive' : 'negative',
                trendPct: m.growthPct
            }
        ];

        el.overviewGrid.innerHTML = entries
            .map((it) => {
                const trendClass = it.trendPct >= 0 ? 'positive' : 'negative';
                const trendArrow = it.trendPct >= 0 ? '&uarr;' : '&darr;';
                return `
                    <article class="overview-card">
                        <div class="overview-card__head">
                            <div class="overview-card__icon">${it.icon}</div>
                            <div class="overview-card__meta">
                                <div class="overview-card__label">${it.label}</div>
                                <div class="overview-card__desc">${it.desc}</div>
                            </div>
                            <div class="overview-trend ${trendClass}">${trendArrow} ${Math.abs(it.trendPct).toFixed(1)}%</div>
                        </div>
                        <div class="overview-card__value ${it.valueClass} overview-animated" data-format="${it.format}" data-target="${it.target}">--</div>
                    </article>
                `;
            })
            .join('');

        animateOverviewValues();
    }

    function formatCounterValue(format, value) {
        if (format === 'moneyUnsigned') return formatUnsignedMoney(Math.max(0, value));
        if (format === 'moneySigned') return formatMoney(value);
        if (format === 'pct') return `${Math.max(0, value).toFixed(1)}%`;
        if (format === 'pctSigned') return formatPct(value);
        return String(value);
    }

    function animateOverviewValues() {
        const nodes = document.querySelectorAll('.overview-animated');
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        nodes.forEach((node) => {
            const target = Number(node.dataset.target || '0');
            const format = node.dataset.format || 'moneySigned';

            if (reduceMotion) {
                node.textContent = formatCounterValue(format, target);
                return;
            }

            const duration = 680;
            const start = performance.now();
            const from = 0;

            const step = (time) => {
                const progress = Math.min(1, (time - start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = from + (target - from) * eased;
                node.textContent = formatCounterValue(format, current);
                if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        });
    }

    function renderOverviewSkeleton() {
        el.overviewSummary.innerHTML = `
            <article class="overview-summary-main skeleton-card"></article>
            <article class="overview-summary-side skeleton-card"></article>
        `;

        el.overviewGrid.innerHTML = Array.from({ length: 8 })
            .map(() => `<article class="overview-card is-skeleton"><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div></article>`)
            .join('');
    }

    function drawPerformanceChart() {
        const canvas = el.portfolioChart;
        const ctx = canvas.getContext('2d');
        const parentWidth = canvas.clientWidth;
        const ratio = window.devicePixelRatio || 1;
        const width = Math.floor(parentWidth * ratio);
        const height = Math.floor(280 * ratio);
        canvas.width = width;
        canvas.height = height;

        const rangeMs = {
            '1D': 86400000,
            '1W': 7 * 86400000,
            '1M': 30 * 86400000,
            ALL: Number.MAX_SAFE_INTEGER
        };

        const now = Date.now();
        const points = state.data.equityCurve.filter((p) => now - p.t <= rangeMs[state.chartRange]);
        const safePoints = points.length > 1 ? points : state.data.equityCurve.slice(-2);

        let min = Math.min(...safePoints.map((p) => p.v));
        let max = Math.max(...safePoints.map((p) => p.v));
        if (max === min) {
            min -= 1;
            max += 1;
        }

        const pad = { l: 56 * ratio, r: 24 * ratio, t: 18 * ratio, b: 34 * ratio };
        const plotW = width - pad.l - pad.r;
        const plotH = height - pad.t - pad.b;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255,153,51,0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(255,255,255,0.09)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i += 1) {
            const y = pad.t + (plotH * i) / 4;
            ctx.beginPath();
            ctx.moveTo(pad.l, y);
            ctx.lineTo(width - pad.r, y);
            ctx.stroke();
        }

        const xy = safePoints.map((p, idx) => {
            const x = pad.l + (idx / (safePoints.length - 1)) * plotW;
            const y = pad.t + ((max - p.v) / (max - min)) * plotH;
            return { x, y };
        });

        const grd = ctx.createLinearGradient(0, pad.t, 0, pad.t + plotH);
        grd.addColorStop(0, 'rgba(255,153,51,0.35)');
        grd.addColorStop(1, 'rgba(255,153,51,0.02)');

        ctx.beginPath();
        ctx.moveTo(xy[0].x, xy[0].y);
        for (let i = 1; i < xy.length; i += 1) {
            const p = xy[i];
            ctx.lineTo(p.x, p.y);
        }
        ctx.lineWidth = 2 * ratio;
        ctx.strokeStyle = '#ff9933';
        ctx.shadowColor = 'rgba(255,153,51,0.6)';
        ctx.shadowBlur = 8 * ratio;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.lineTo(xy[xy.length - 1].x, height - pad.b);
        ctx.lineTo(xy[0].x, height - pad.b);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.fillStyle = '#9ca0aa';
        ctx.font = `${11 * ratio}px Segoe UI`;
        ctx.fillText(`${CURRENCY} ${Math.round(max).toLocaleString()}`, 8 * ratio, pad.t + 10 * ratio);
        ctx.fillText(`${CURRENCY} ${Math.round(min).toLocaleString()}`, 8 * ratio, height - pad.b);
    }

    function sortByConfig(list, config, customValues) {
        const sorted = [...list].sort((a, b) => {
            const va = customValues(a, config.key);
            const vb = customValues(b, config.key);
            if (typeof va === 'number' && typeof vb === 'number') return va - vb;
            return String(va).localeCompare(String(vb));
        });
        return config.direction === 'asc' ? sorted : sorted.reverse();
    }

    function renderOpenPositions() {
        const rows = sortByConfig(state.data.openPositions, state.openSort, (p, key) => {
            if (key === 'pnl') return pnlForPosition(p);
            if (key === 'duration') return hoursSince(p.openedAt);
            return p[key];
        });

        el.openPositionsBody.innerHTML = rows
            .map((p) => {
                const pnl = pnlForPosition(p);
                const durationH = hoursSince(p.openedAt);
                return `
                    <tr>
                        <td>${p.symbol}</td>
                        <td><span class="type-pill ${p.type.toLowerCase()}">${p.type}</span></td>
                        <td>${p.lot.toFixed(2)}</td>
                        <td>${p.entry}</td>
                        <td>${p.current}</td>
                        <td>${p.sl}</td>
                        <td>${p.tp}</td>
                        <td class="${pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${formatMoney(pnl)}</td>
                        <td>${durationH.toFixed(1)}h</td>
                        <td><button class="table-action-btn" data-close-id="${p.id}">Close Trade</button></td>
                    </tr>`;
            })
            .join('');
    }

    function renderHistory() {
        const rows = sortByConfig(state.data.tradeHistory, state.historySort, (h, key) => h[key]);

        el.tradeHistoryBody.innerHTML = rows
            .map((t) => {
                const result = t.pnl >= 0 ? 'Win' : 'Loss';
                return `
                    <tr>
                        <td>${t.symbol}</td>
                        <td><span class="type-pill ${t.type.toLowerCase()}">${t.type}</span></td>
                        <td>${t.entry}</td>
                        <td>${t.exit}</td>
                        <td>${t.lot.toFixed(2)}</td>
                        <td class="${t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${formatMoney(t.pnl)}</td>
                        <td>${formatDateTime(t.closedAt)}</td>
                        <td><span class="result-pill ${result.toLowerCase()}">${result}</span></td>
                    </tr>`;
            })
            .join('');
    }

    function renderStats() {
        const closed = state.data.tradeHistory;
        const wins = closed.filter((t) => t.pnl > 0);
        const losses = closed.filter((t) => t.pnl < 0);
        const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
        const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
        const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
        const lossRate = closed.length ? (losses.length / closed.length) * 100 : 0;
        const avgWin = wins.length ? grossProfit / wins.length : 0;
        const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
        const best = closed.length ? Math.max(...closed.map((t) => t.pnl)) : 0;
        const worst = closed.length ? Math.min(...closed.map((t) => t.pnl)) : 0;
        const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
        const maxDrawdown = estimateMaxDrawdown(state.data.equityCurve);

        const cards = [
            ['Total Trades', String(closed.length)],
            ['Win Rate', `${winRate.toFixed(1)}%`],
            ['Loss Rate', `${lossRate.toFixed(1)}%`],
            ['Profit Factor', profitFactor.toFixed(2)],
            ['Average Win', formatMoney(avgWin)],
            ['Average Loss', formatMoney(avgLoss)],
            ['Best Trade', formatMoney(best)],
            ['Worst Trade', formatMoney(worst)],
            ['Max Drawdown', `${maxDrawdown.toFixed(2)}%`]
        ];

        el.statsGrid.innerHTML = cards
            .map((it) => `<article class="metric-card"><div class="label">${it[0]}</div><div class="value ${numericMood(it[1])}">${it[1]}</div></article>`)
            .join('');
    }

    function numericMood(valueText) {
        if (valueText.startsWith('-')) return 'negative';
        if (valueText.startsWith('+')) return 'positive';
        return '';
    }

    function estimateMaxDrawdown(curve) {
        let peak = -Infinity;
        let maxDd = 0;
        curve.forEach((p) => {
            if (p.v > peak) peak = p.v;
            const dd = peak ? ((peak - p.v) / peak) * 100 : 0;
            if (dd > maxDd) maxDd = dd;
        });
        return maxDd;
    }

    function renderRisk() {
        const exposureBySymbol = {};
        const exposureByAsset = { Forex: 0, Crypto: 0, Commodity: 0, Index: 0 };

        state.data.openPositions.forEach((p) => {
            const notional = p.current * p.lot * Math.max(1, symbolMultiplier(p.symbol) / 10000);
            exposureBySymbol[p.symbol] = (exposureBySymbol[p.symbol] || 0) + notional;

            if (p.symbol.length === 6 && p.symbol.includes('USD')) exposureByAsset.Forex += notional;
            else if (p.symbol.includes('BTC') || p.symbol.includes('ETH')) exposureByAsset.Crypto += notional;
            else if (p.symbol.includes('XAU')) exposureByAsset.Commodity += notional;
            else exposureByAsset.Index += notional;
        });

        const topSymbol = Object.entries(exposureBySymbol)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1)[0] || ['N/A', 0];

        const topAsset = Object.entries(exposureByAsset)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1)[0] || ['N/A', 0];

        const riskCards = [
            ['Risk Per Trade', `${state.data.account.riskPerTradePct.toFixed(2)}%`],
            ['Max Drawdown', `${estimateMaxDrawdown(state.data.equityCurve).toFixed(2)}%`],
            ['Exposure by Symbol', `${topSymbol[0]} (${formatUnsignedMoney(topSymbol[1])})`],
            ['Exposure by Asset Type', `${topAsset[0]} (${formatUnsignedMoney(topAsset[1])})`]
        ];

        el.riskGrid.innerHTML = riskCards
            .map((it) => `<article class="metric-card"><div class="label">${it[0]}</div><div class="value">${it[1]}</div></article>`)
            .join('');
    }

    function renderActivity() {
        const items = [...state.data.activity].sort((a, b) => b.ts - a.ts).slice(0, 10);
        el.activityList.innerHTML = items
            .map((a) => `<li><span>${a.text}</span><span>${formatDateTime(a.ts)}</span></li>`)
            .join('');
    }

    function addActivity(text) {
        state.data.activity.unshift({ id: `a_${Date.now()}`, text, ts: Date.now() });
        state.data.activity = state.data.activity.slice(0, 30);
    }

    function closeTrade(id) {
        const idx = state.data.openPositions.findIndex((p) => p.id === id);
        if (idx < 0) return;
        const p = state.data.openPositions[idx];
        const pnl = pnlForPosition(p);

        state.data.tradeHistory.unshift({
            id: `h_${Date.now()}`,
            symbol: p.symbol,
            type: p.type,
            entry: p.entry,
            exit: p.current,
            lot: p.lot,
            pnl,
            closedAt: Date.now()
        });

        state.data.openPositions.splice(idx, 1);
        addActivity(`Closed ${p.symbol} ${p.type} position at ${formatMoney(pnl)}.`);

        // Add current equity snapshot
        const metrics = computeMetrics();
        state.data.equityCurve.push({ t: Date.now(), v: metrics.equity });
        saveData();
        renderAll();
    }

    function resetDemoAccount() {
        state.data = copyDefaultData();
        addActivity('Demo account reset to default portfolio state.');
        saveData();
        renderAll();
    }

    function depositFunds() {
        const input = window.prompt('Enter virtual deposit amount (USD):', '1000');
        if (!input) return;
        const amount = Number(input);
        if (!Number.isFinite(amount) || amount <= 0) {
            window.alert('Please enter a valid positive amount.');
            return;
        }
        state.data.account.virtualBalance += amount;
        state.data.account.startingBalance += amount;
        addActivity(`Deposited ${formatUnsignedMoney(amount)} virtual funds.`);
        saveData();
        renderAll();
    }

    function startNewTrade() {
        const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'NAS100'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const type = Math.random() > 0.5 ? 'Buy' : 'Sell';
        const lot = Number((0.2 + Math.random() * 1.2).toFixed(2));
        const base = symbol.includes('USD') && symbol.length === 6
            ? 1 + Math.random() * 0.8
            : symbol === 'XAUUSD'
                ? 2140 + Math.random() * 60
                : symbol.includes('BTC')
                    ? 62000 + Math.random() * 9000
                    : 17000 + Math.random() * 2500;
        const entry = Number(base.toFixed(symbol.length === 6 ? 5 : 2));
        const current = Number((entry * (1 + (Math.random() - 0.5) * 0.004)).toFixed(symbol.length === 6 ? 5 : 2));
        const sl = Number((entry * (type === 'Buy' ? 0.995 : 1.005)).toFixed(symbol.length === 6 ? 5 : 2));
        const tp = Number((entry * (type === 'Buy' ? 1.007 : 0.993)).toFixed(symbol.length === 6 ? 5 : 2));

        state.data.openPositions.unshift({
            id: `op_${Date.now()}`,
            symbol,
            type,
            lot,
            entry,
            current,
            sl,
            tp,
            openedAt: Date.now()
        });

        addActivity(`Started new ${type} trade on ${symbol} (${lot} lot).`);
        saveData();
        renderAll();
    }

    function exportHistoryCsv() {
        const headers = ['Symbol', 'Type', 'Entry', 'Exit', 'Lot', 'PnL', 'ClosedAt'];
        const lines = [headers.join(',')];
        state.data.tradeHistory.forEach((t) => {
            lines.push([t.symbol, t.type, t.entry, t.exit, t.lot, t.pnl, new Date(t.closedAt).toISOString()].join(','));
        });

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'demo-trade-history.csv';
        a.click();
        URL.revokeObjectURL(url);

        addActivity('Exported trade history CSV.');
        saveData();
        renderActivity();
    }

    function bindTableSorting() {
        const openHeaders = document.querySelectorAll('#openPositionsTable thead th[data-sort]');
        openHeaders.forEach((th) => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                if (state.openSort.key === key) {
                    state.openSort.direction = state.openSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    state.openSort.key = key;
                    state.openSort.direction = 'asc';
                }
                renderOpenPositions();
            });
        });

        const historyHeaders = document.querySelectorAll('#tradeHistoryTable thead th[data-sort]');
        historyHeaders.forEach((th) => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                if (state.historySort.key === key) {
                    state.historySort.direction = state.historySort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    state.historySort.key = key;
                    state.historySort.direction = 'asc';
                }
                renderHistory();
            });
        });
    }

    function bindEvents() {
        el.chartFilters.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-range]');
            if (!btn) return;
            state.chartRange = btn.dataset.range;
            [...el.chartFilters.querySelectorAll('button')].forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            drawPerformanceChart();
        });

        el.openPositionsBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-close-id]');
            if (!btn) return;
            closeTrade(btn.dataset.closeId);
        });

        el.resetDemoBtn.addEventListener('click', () => {
            if (!window.confirm('Reset demo account and replace current portfolio data?')) return;
            resetDemoAccount();
        });

        el.newTradeBtn.addEventListener('click', startNewTrade);
        el.depositBtn.addEventListener('click', depositFunds);
        el.exportBtn.addEventListener('click', exportHistoryCsv);

        window.addEventListener('resize', drawPerformanceChart);
    }

    function cacheElements() {
        el.overviewGrid = document.getElementById('overviewGrid');
        el.overviewSummary = document.getElementById('overviewSummary');
        el.portfolioChart = document.getElementById('portfolioChart');
        el.chartFilters = document.getElementById('chartFilters');
        el.openPositionsBody = document.getElementById('openPositionsBody');
        el.tradeHistoryBody = document.getElementById('tradeHistoryBody');
        el.statsGrid = document.getElementById('statsGrid');
        el.riskGrid = document.getElementById('riskGrid');
        el.activityList = document.getElementById('activityList');
        el.resetDemoBtn = document.getElementById('resetDemoBtn');
        el.newTradeBtn = document.getElementById('newTradeBtn');
        el.exportBtn = document.getElementById('exportBtn');
        el.depositBtn = document.getElementById('depositBtn');
    }

    function renderAll() {
        renderOverview();
        drawPerformanceChart();
        renderOpenPositions();
        renderHistory();
        renderStats();
        renderRisk();
        renderActivity();
    }

    document.addEventListener('DOMContentLoaded', () => {
        cacheElements();
        renderOverviewSkeleton();
        loadData();
        bindTableSorting();
        bindEvents();
        setTimeout(renderAll, 260);
    });
})();
