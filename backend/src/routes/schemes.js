const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const demoSchemes = require('../data/demoSchemes.json');

// List schemes with search, category filtering, and eligibility matching
router.get('/', async (req, res) => {
  const { q, category, occupation } = req.query;

  if (!supabase) {
    let results = [...demoSchemes];

    if (q) {
      const term = q.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.name_hi && s.name_hi.includes(term)) ||
        s.description.toLowerCase().includes(term) ||
        s.benefits.toLowerCase().includes(term)
      );
    }

    if (category && category !== 'All') {
      results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (occupation) {
      const occ = occupation.toLowerCase();
      results = results.filter(s =>
        s.description.toLowerCase().includes(occ) ||
        s.eligibility_criteria.toLowerCase().includes(occ) ||
        s.category.toLowerCase().includes(occ)
      );
    }

    return res.json(results);
  }

  try {
    let query = supabase.from('schemes').select('*, scheme_translations(*)');

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data && data.length > 0 ? data : demoSchemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!supabase) {
    const scheme = demoSchemes.find(s => String(s.id) === String(id));
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    return res.json(scheme);
  }

  try {
    const { data, error } = await supabase
      .from('schemes')
      .select('*, scheme_translations(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      const fallback = demoSchemes.find(s => String(s.id) === String(id));
      if (fallback) return res.json(fallback);
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
