// Page Loader
window.addEventListener('load', () => {
    document.getElementById('pageLoader').classList.add('hidden');
});

// Risk Management Calculator
function generateRiskPlan() {
    const capitalInput = document.getElementById('capital');
    const capital = parseFloat(capitalInput.value);

    if (!capital || capital <= 0) {
        alert('Please enter a valid trading capital amount');
        capitalInput.focus();
        return;
    }

    // Calculate risk metrics
    const riskPerTrade = capital * 0.01; // 1% of capital
    const dailyRisk = capital * 0.02; // 2% of capital
    const weeklyRisk = capital * 0.05; // 5% of capital
    const maxTrades = 3; // Fixed value

    // Update result display
    document.getElementById('riskPerTrade').textContent = '$' + riskPerTrade.toFixed(2);
    document.getElementById('dailyRisk').textContent = '$' + dailyRisk.toFixed(2);
    document.getElementById('weeklyRisk').textContent = '$' + weeklyRisk.toFixed(2);
    document.getElementById('maxTrades').textContent = maxTrades;

    // Show results and advice with animation
    document.getElementById('resultsContainer').classList.add('show');
    document.getElementById('adviceContainer').classList.add('show');

    // Scroll to results
    setTimeout(() => {
        document.getElementById('resultsContainer').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 300);
}

// Allow Enter key to generate plan
document.getElementById('capital').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateRiskPlan();
    }
});
