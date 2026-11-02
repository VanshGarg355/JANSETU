const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;

if (url && serviceKey && !url.includes('your-project') && !serviceKey.includes('your-service-role')) {
  try {
    supabase = createClient(url, serviceKey);
    console.log('✅ Connected to Supabase Live Database');
  } catch (err) {
    console.warn('⚠️ Supabase initialization failed, running in Demo Mode');
    supabase = null;
  }
} else {
  console.log('ℹ️ Running in Demo Mode (Simulated Database & Verified Datasets Active)');
}

module.exports = { supabase };
