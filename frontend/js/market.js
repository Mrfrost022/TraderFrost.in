        // Market Page - TradingView Charts Initialization
        document.addEventListener('DOMContentLoaded', function() {
            waitForTradingView(initializeCharts);
        });

        function waitForTradingView(callback) {
            let attempts = 0;
            const maxAttempts = 40;
            const intervalMs = 200;

            const intervalId = setInterval(() => {
                attempts += 1;

                if (typeof TradingView !== 'undefined') {
                    clearInterval(intervalId);
                    callback();
                    return;
                }

                if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                    console.warn('TradingView library did not load in time.');
                }
            }, intervalMs);
        }

        function initializeCharts() {
            // Advanced Chart (Full Width)
            createAdvancedChart('advancedChart', 'BITSTAMP:BTCUSD');
            
            // Crypto Charts
            createChart('btcChart', 'BINANCE:BTCUSDT', 'small');
            createChart('ethChart', 'BINANCE:ETHUSDT', 'small');
            createChart('bnbChart', 'BINANCE:BNBUSDT', 'small');
            
            // Forex Charts
            createChart('eurusdChart', 'FX:EURUSD', 'small');
            createChart('gbpusdChart', 'FX:GBPUSD', 'small');
            createChart('usdjpyChart', 'FX:USDJPY', 'small');
            
            // Gold & Indices
            createChart('goldChart', 'OANDA:XAUUSD', 'small');
            createChart('nasdaqChart', 'NASDAQ:NDAQ', 'small');
            createChart('spxChart', 'SP:SPX', 'small');
        }

        function createAdvancedChart(elementId, symbol) {
            const container = document.getElementById(elementId);
            if (!container) return;

            new TradingView.widget({
                'autosize': true,
                'symbol': symbol,
                'interval': '15',
                'timezone': 'Etc/UTC',
                'theme': 'dark',
                'style': '1',
                'locale': 'en',
                'toolbar_bg': 'rgba(255, 153, 51, 0.05)',
                'enable_publishing': false,
                'allow_symbol_change': true,
                'withdateranges': true,
                'hide_top_toolbar': false,
                'hide_side_toolbar': false,
                'save_image': true,
                'details': true,
                'hotlist': true,
                'container_id': elementId,
                'enabled_features': [
                    'study_templates',
                    'items_favoriting',
                    'use_localstorage_for_settings'
                ],
                'client_id': 'traderfrost.com',
                'user_id': 'public_user'
            });
        }

        function createChart(elementId, symbol, size = 'medium') {
            const container = document.getElementById(elementId);
            if (!container) return;

            const widgetConfig = {
                'autosize': true,
                'symbol': symbol,
                'interval': '1D',
                'timezone': 'Etc/UTC',
                'theme': 'dark',
                'style': '1',
                'locale': 'en',
                'toolbar_bg': 'rgba(255, 153, 51, 0.05)',
                'enable_publishing': false,
                'allow_symbol_change': false,
                'show_interval_td_button': true,
                'show_popup_button': true,
                'details': true,
                'hotlist': false,
                'watchlist': false,
                'height': size === 'small' ? 320 : 500,
                'container_id': elementId,
                'client_id': 'traderfrost.com',
                'user_id': 'public_user'
            };

            try {
                new TradingView.MediumWidget(widgetConfig);
            } catch (e) {
                // Fallback to widget if MediumWidget not available
                try {
                    new TradingView.widget(widgetConfig);
                } catch (error) {
                    console.warn('TradingView widget failed for', elementId, error);
                }
            }
        }

        // Handle responsive chart resize
        window.addEventListener('resize', function() {
            // TradingView widgets auto-resize, but we can add custom logic here
            adjustChartsForViewport();
        });

        function adjustChartsForViewport() {
            const isMobile = window.innerWidth < 768;
            const chartCards = document.querySelectorAll('.chart-card');
            
            chartCards.forEach(card => {
                if (isMobile) {
                    card.style.minHeight = '300px';
                } else {
                    card.style.minHeight = '350px';
                }
            });
        }

        // Initialize on page load
        adjustChartsForViewport();

        // Smooth scroll to top button (if added later)
        const handleScroll = () => {
            const scrollBtn = document.getElementById('scrollToTop');
            if (scrollBtn) {
                if (window.pageYOffset > 300) {
                    scrollBtn.style.display = 'block';
                } else {
                    scrollBtn.style.display = 'none';
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Update market time display
        function updateMarketTime() {
            const timeDisplay = document.getElementById('toolbarDateTime');
            if (timeDisplay) {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                timeDisplay.textContent = formatter.format(now);
            }
        }

        // Update time display every second
        setInterval(updateMarketTime, 1000);
        updateMarketTime(); // Initial call
