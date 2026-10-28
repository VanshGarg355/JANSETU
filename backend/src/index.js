const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

const authRoutes = require('./routes/auth');
const schemeRoutes = require('./routes/schemes');
const dbtRoutes = require('./routes/dbt');
const aiRoutes = require('./routes/ai');
const savedRoutes = require('./routes/savedSchemes');
const loansRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'JanSetu — Build for Bharat 2026',
    mode: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'live' : 'demo',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/dbt', dbtRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/saved-schemes', savedRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 JanSetu Backend is running on: http://localhost:${PORT}`);
  console.log(`📡 Mode: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'LIVE (Supabase Connected)' : 'DEMO MODE (Full Mock & Verified Data Active)'}`);
  console.log(`🤖 AI Sahayak: ${(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY) ? 'Live API Key Connected' : 'Verified Knowledge Base Grounded Engine'}`);
  console.log(`====================================================`);
});
