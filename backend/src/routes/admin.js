const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const demoSchemes = require('../data/demoSchemes.json');
const demoIssues = require('../data/demoDbtIssues.json');

// Stats endpoint
router.get('/stats', authMiddleware, (req, res) => {
  res.json({
    total_schemes: demoSchemes.length,
    active_dbt_rules: demoIssues.reduce((acc, issue) => acc + (issue.rules?.length || 0), 0),
    registered_citizens: 148,
    resolved_dbt_cases: 532,
    database_status: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Connected (Supabase)' : 'Demo Mode (Local Verified Data)',
    ai_status: (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY) ? 'Live AI Key Loaded' : 'Verified RAG Knowledge Engine'
  });
});

// Admin schemes CRUD
router.post('/schemes', authMiddleware, (req, res) => {
  const newScheme = {
    id: demoSchemes.length + 1,
    ...req.body,
    last_verified: new Date().toISOString().split('T')[0],
    status: 'verified'
  };
  demoSchemes.unshift(newScheme);
  res.status(201).json({ message: 'Scheme added successfully', scheme: newScheme });
});

router.delete('/schemes/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const index = demoSchemes.findIndex(s => String(s.id) === String(id));
  if (index !== -1) {
    demoSchemes.splice(index, 1);
  }
  res.json({ success: true, message: `Scheme ${id} deleted` });
});

module.exports = router;
