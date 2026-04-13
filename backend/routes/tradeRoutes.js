import express from "express";

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.json({ message: "Trade route working" });
});

export default router;