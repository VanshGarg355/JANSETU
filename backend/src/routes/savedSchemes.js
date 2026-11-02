const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const demoSchemes = require('../data/demoSchemes.json');

// In-memory store for demo mode
let savedList = [
  {
    id: 1,
    scheme_id: 1,
    scheme: demoSchemes[0],
    saved_at: new Date().toISOString(),
    notes: 'Primary agriculture subsidy'
  },
  {
    id: 2,
    scheme_id: 2,
    scheme: demoSchemes[1],
    saved_at: new Date().toISOString(),
    notes: 'Family health protection'
  }
];

// GET saved schemes
router.get('/', authMiddleware, (req, res) => {
  res.json(savedList);
});

// POST save scheme
router.post('/', authMiddleware, (req, res) => {
  const { scheme_id, notes } = req.body;
  const scheme = demoSchemes.find(s => String(s.id) === String(scheme_id));
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });

  const alreadySaved = savedList.find(s => String(s.scheme_id) === String(scheme_id));
  if (alreadySaved) {
    return res.json({ message: 'Already in your saved schemes', saved: alreadySaved });
  }

  const newEntry = {
    id: Date.now(),
    scheme_id: scheme.id,
    scheme,
    saved_at: new Date().toISOString(),
    notes: notes || 'Bookmarked by citizen'
  };

  savedList.push(newEntry);
  res.status(201).json(newEntry);
});

// DELETE saved scheme
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  savedList = savedList.filter(s => String(s.scheme_id) !== String(id) && String(s.id) !== String(id));
  res.json({ success: true, message: 'Scheme removed from saved list' });
});

module.exports = router;
