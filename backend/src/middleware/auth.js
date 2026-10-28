const { supabase } = require('../supabaseClient');

const DEMO_USER = {
  id: 'demo-user-101',
  email: 'citizen@jansetu.in',
  name: 'Rajesh Sharma',
  occupation: 'Farmer',
  state: 'Uttar Pradesh',
  is_admin: true
};

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // If running in demo mode or using demo token
  if (!supabase || !token || token === 'demo-token') {
    req.user = DEMO_USER;
    return next();
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired authentication session' });
    }
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth service internal error' });
  }
}

module.exports = authMiddleware;
