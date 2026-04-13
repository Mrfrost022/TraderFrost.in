import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  pair: {
    type: String,
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: {
    type: Number
  },
  lotSize: {
    type: Number
  },
  session: {
    type: String
  },
  result: {
    type: String
  },
  notes: {
    type: String
  },
  screenshot: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;