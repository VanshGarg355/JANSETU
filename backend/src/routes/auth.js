const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

const DEMO_USER = {
  id: 'demo-user-101',
  email: 'citizen@jansetu.in',
  name: 'Rajesh Sharma',
  father_name: 'Suresh Sharma',
  mother_name: 'Kamlesh Sharma',
  dob: '1978-05-14',
  gender: 'Male',
  mobile: '9876543210',
  address: 'Village Meerut, District Meerut, Uttar Pradesh - 201301',
  state: 'Uttar Pradesh',
  district: 'Meerut',
  pincode: '201301',
  category: 'OBC',
  occupation: 'Farmer',
  annual_income: '120000',
  is_admin: true,
  created_at: new Date().toISOString()
};

// Signup
router.post('/signup', async (req, res) => {
  const {
    email, password, name, father_name, mother_name, dob, gender, mobile,
    address, state, district, pincode, category, annual_income, occupation
  } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const profileData = {
    name: name || 'Citizen User',
    father_name: father_name || null,
    mother_name: mother_name || null,
    dob: dob || null,
    gender: gender || null,
    mobile: mobile || null,
    address: address || null,
    state: state || 'All India',
    district: district || null,
    pincode: pincode || null,
    category: category || 'General',
    annual_income: annual_income || null,
    occupation: occupation || 'General'
  };

  // Demo mode
  if (!supabase) {
    const user = {
      ...DEMO_USER,
      ...profileData,
      id: 'user-' + Date.now(),
      email
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
        data: {
          name, father_name, mother_name, dob, gender, mobile,
          address, state, district, pincode, category, annual_income, occupation
        }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    // Store in profiles table
    if (data.user) {
      await supabase.from('profiles').upsert([
        {
          auth_user_id: data.user.id,
          ...profileData
        }
      ]);
    }

    res.json({
      user: { ...data.user, ...profileData },
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

    let userProfile = null;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single();
      userProfile = profileData;
    } catch (e) {
      // profile lookup is best-effort; continue with auth user
    }

    res.json({
      user: { ...data.user, ...(userProfile || {}) },
      access_token: data.session.access_token,
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Own Profile (linked to authenticated user)
router.get('/profile', async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

  if (!supabase || !token || token.startsWith('demo-token')) {
    return res.json({ ...DEMO_USER, demo: true });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

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

// Update Own Profile (linked to authenticated user)
router.patch('/profile', async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const updates = req.body || {};

  if (!supabase || !token || token.startsWith('demo-token')) {
    return res.json({
      user: { ...DEMO_USER, ...updates },
      message: 'Profile updated successfully (Demo Mode)'
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert([
        {
          auth_user_id: user.id,
          ...updates
        }
      ])
      .select()
      .single();

    if (updateError) return res.status(400).json({ error: updateError.message });

    res.json({ user: profile || { ...user, ...updates }, message: 'Profile updated successfully' });
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
