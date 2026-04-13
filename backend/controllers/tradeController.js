const Trade = require('../models/Trade');

// Save a new trade
const saveTrade = async (req, res) => {
    try {
        const tradeData = req.body;
        const trade = new Trade(tradeData);
        const savedTrade = await trade.save();
        res.status(201).json(savedTrade);
    } catch (error) {
        res.status(500).json({ message: 'Error saving trade', error: error.message });
    }
};

// Get all trades
const getTrades = async (req, res) => {
    try {
        const trades = await Trade.find().sort({ createdAt: -1 });
        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trades', error: error.message });
    }
};

// Delete a trade by ID
const deleteTrade = async (req, res) => {
    try {
        const { id } = req.params;
        await Trade.findByIdAndDelete(id);
        res.status(200).json({ message: 'Trade deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting trade', error: error.message });
    }
};

module.exports = {
    saveTrade,
    getTrades,
    deleteTrade
};
