const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

const DEMO_USER = {
  id: 'demo-user-101',
  email: 'citizen@jansetu.in',
  name: 'Rajesh Sharma',
  occupation: 'Farmer',
  state: 'Uttar Pradesh',
  category: 'OBC',
  is_admin: true,
  created_at: new Date().toISOString()
};

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name, occupation, state, category } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Demo mode
  if (!supabase) {
    const user = {
      ...DEMO_USER,
      id: 'user-' + Date.now(),
      email,
      name: name || 'Citizen User',
      occupation: occupation || 'General',
      state: state || 'All India',
      category: category || 'General'
    };
    return res.json({
      user,
      access_token: 'demo-token-' + Date.now(),
      message: 'Signup successful (Demo Mode)'
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, occupation, state, category }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    // Store in profiles table
    if (data.user) {
      await supabase.from('profiles').upsert([
        {
          auth_user_id: data.user.id,
          name,
          email,
          occupation,
          state,
          category
        }
      ]);
    }

    res.json({
      user: data.user,
      access_token: data.session?.access_token || 'pending-verification',
      message: 'Registration successful'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!supabase) {
    return res.json({
      user: { ...DEMO_USER, email: email || DEMO_USER.email },
      access_token: 'demo-token',
      message: 'Logged in successfully (Demo Mode)'
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      user: data.user,
      access_token: data.session.access_token,
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Profile / Current User
router.get('/me', async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  if (!supabase || !token || token.startsWith('demo-token')) {
    return res.json(DEMO_USER);
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    res.json(profile || user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
