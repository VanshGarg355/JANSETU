const express = require('express');
const router = express.Router();
const familyDocs = require('../data/demoFamilyDocuments.json');

// GET /api/documents/family - List all family members and their uploaded documents
router.get('/family', (req, res) => {
  res.json({
    family_name: "Sharma Family (Meerut, UP)",
    household_head: "Rajesh Sharma",
    total_members: familyDocs.length,
    members: familyDocs
  });
});

// GET /api/documents/summary - Aggregate statistics for the Digital Locker
router.get('/summary', (req, res) => {
  let totalDocs = 0;
  let verifiedDocs = 0;
  let pendingActionDocs = 0;

  familyDocs.forEach(member => {
    (member.documents || []).forEach(doc => {
      totalDocs += 1;
      if (doc.status === 'verified') verifiedDocs += 1;
      if (doc.status === 'action_required') pendingActionDocs += 1;
    });
  });

  res.json({
    total_documents: totalDocs,
    verified_documents: verifiedDocs,
    action_required_documents: pendingActionDocs,
    locker_provider: "National DigiLocker & JanSetu Trust Protocol",
    last_synced: new Date().toISOString()
  });
});

// GET /api/documents/member/:id - Get specific member documents (e.g. 'farmer', 'student', 'pension', 'mother')
router.get('/member/:id', (req, res) => {
  const query = req.params.id.toLowerCase();
  const member = familyDocs.find(m => 
    m.id.toLowerCase() === query || 
    m.member_id.toLowerCase() === query ||
    m.name.toLowerCase().includes(query) ||
    m.role_key.toLowerCase() === query
  );

  if (!member) {
    return res.status(404).json({
      error: 'Family member not found',
      available_members: familyDocs.map(m => ({ id: m.id, name: m.name, role: m.role }))
    });
  }

  res.json(member);
});

// POST /api/documents/toggle-status - Simulate re-verification or verification toggle
router.post('/toggle-status', (req, res) => {
  const { memberId, docId } = req.body;
  
  const member = familyDocs.find(m => m.id === memberId || m.member_id === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const doc = member.documents.find(d => d.id === docId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Toggle status
  doc.status = doc.status === 'verified' ? 'action_required' : 'verified';
  doc.last_verified_at = new Date().toISOString();

  res.json({
    success: true,
    message: `Document "${doc.name}" updated successfully.`,
    updated_doc: doc
  });
});

module.exports = router;
