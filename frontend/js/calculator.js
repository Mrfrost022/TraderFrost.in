function calculateProfit() {
    // Get form values
    const currencyPair = document.getElementById('currencyPair').value;
    const tradeType = document.getElementById('tradeType').value;
    const lotSize = parseFloat(document.getElementById('lotSize').value);
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const exitPrice = parseFloat(document.getElementById('exitPrice').value);

    // Validate inputs
    if (!currencyPair || !tradeType || !lotSize || !entryPrice || !exitPrice) {
        alert('Please fill in all fields');
        return;
    }

    if (lotSize <= 0 || entryPrice <= 0 || exitPrice <= 0) {
        alert('All values must be greater than 0');
        return;
    }

    // Determine pip multiplier (JPY pairs use 100, others use 10000)
    const isJPYPair = currencyPair.includes('JPY');
    const pipMultiplier = isJPYPair ? 100 : 10000;

    // Calculate pips
    let pips = 0;
    if (tradeType === 'buy') {
        pips = (exitPrice - entryPrice) * pipMultiplier;
    } else {
        pips = (entryPrice - exitPrice) * pipMultiplier;
    }

    // Pip value per standard lot (1 lot = 100,000 units)
    const pipValuePerLot = 10; // USD

    // Calculate profit/loss
    const profitLoss = pips * lotSize * pipValuePerLot;

    // Calculate percentage change
    const percentageChange = (profitLoss / (lotSize * entryPrice * 100000)) * 100;

    // Update results
    const pipsElement = document.getElementById('pipsValue');
    const profitLossElement = document.getElementById('profitLossValue');
    const percentageElement = document.getElementById('percentageValue');
    const resultsSection = document.getElementById('resultsSection');

    // Format pips
    pipsElement.textContent = pips.toFixed(2);
    pipsElement.className = 'calc-result-value ' + (pips > 0 ? 'positive' : pips < 0 ? 'negative' : 'neutral');

    // Format profit/loss
    profitLossElement.textContent = '$' + profitLoss.toFixed(2);
    profitLossElement.className = 'calc-result-value ' + (profitLoss > 0 ? 'positive' : profitLoss < 0 ? 'negative' : 'neutral');

    // Format percentage
    percentageElement.textContent = percentageChange.toFixed(2) + '%';
    percentageElement.className = 'calc-result-value ' + (percentageChange > 0 ? 'positive' : percentageChange < 0 ? 'negative' : 'neutral');

    // Show results section
    resultsSection.classList.add('show');
}

// Allow Enter key to calculate
document.getElementById('calculatorForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        calculateProfit();
    }
});
