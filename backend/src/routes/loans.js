const express = require('express');
const router = express.Router();
const demoLoans = require('../data/demoLoans.json');

// GET loans with filtering by type (formal vs suspicious)
router.get('/', (req, res) => {
  const { type } = req.query;
  if (type) {
    return res.json(demoLoans.filter(l => l.type === type));
  }
  res.json(demoLoans);
});

module.exports = router;
