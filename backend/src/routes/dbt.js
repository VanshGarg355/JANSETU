const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const demoIssues = require('../data/demoDbtIssues.json');
const demoScenarios = require('../data/demoScenarios.json');
const PDFDocument = require('pdfkit');

// List of in-memory diagnostic sessions for demo mode
const inMemoryHistory = {};

// 1. List all DBT issue types
router.get('/issues', (req, res) => {
  res.json(demoIssues);
});

// 2. Get questions for an issue
router.get('/issues/:id/questions', (req, res) => {
  const { id } = req.params;
  const issue = demoIssues.find(i => String(i.id) === String(id));
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue.questions);
});

// 3. Get pre-configured demo scenarios for live testing
router.get('/scenarios', (req, res) => {
  res.json(demoScenarios);
});

// 4. Diagnose an issue based on citizen's answers
router.post('/issues/:id/diagnose', async (req, res) => {
  const { id } = req.params;
  const { answers, citizen_name, language } = req.body; // answers = { questionId: "selected option text" }

  const issue = demoIssues.find(i => String(i.id) === String(id));
  if (!issue) return res.status(404).json({ error: 'DBT issue not found' });

  // Evaluation algorithm:
  // Match citizen answers against rules
  let matchedRule = null;
  const answerValues = Object.values(answers || {});

  for (const rule of issue.rules) {
    const isMatch = rule.match.some(m => answerValues.some(ans => ans.includes(m) || m.includes(ans)));
    if (isMatch) {
      matchedRule = rule;
      break;
    }
  }

  // Fallback to default rule if no strict pattern matches
  if (!matchedRule) {
    matchedRule = issue.rules[issue.rules.length - 1];
  }

  const historyId = 'DIAG-' + Date.now().toString(36).toUpperCase();

  const diagnosticResult = {
    history_id: historyId,
    issue_id: issue.id,
    issue_title: language === 'hi' ? issue.title_hi : issue.title,
    citizen_name: citizen_name || 'Citizen Beneficiary',
    diagnosed_at: new Date().toISOString(),
    cause: language === 'hi' ? matchedRule.cause_hi : matchedRule.cause,
    severity: matchedRule.severity,
    guidance: language === 'hi' ? matchedRule.guidance_hi : matchedRule.guidance,
    action_steps: matchedRule.action_steps || [],
    escalation_authority: matchedRule.escalation_authority,
    escalation_url: matchedRule.escalation_url,
    user_answers: answers
  };

  // Cache in memory for PDF generation
  inMemoryHistory[historyId] = diagnosticResult;

  // If supabase is active, also persist
  if (supabase) {
    try {
      await supabase.from('diagnostic_history').insert([
        {
          issue_id: issue.id,
          answers,
          result: diagnosticResult
        }
      ]);
    } catch (e) {
      console.warn('DB insert skipped in demo');
    }
  }

  res.json(diagnosticResult);
});

// 5. Generate and download PDF Diagnostic Report
router.get('/history/:hid/report', (req, res) => {
  const { hid } = req.params;
  const data = inMemoryHistory[hid] || {
    history_id: hid,
    issue_title: 'DBT Payment Disbursal Diagnosis',
    citizen_name: 'Verified Citizen',
    diagnosed_at: new Date().toISOString(),
    cause: 'NPCI Aadhaar-Bank Seeding or e-KYC Requirement',
    severity: 'High',
    guidance: 'Direct Benefit Transfer requires mapping your primary bank account in the NPCI central mapper with Aadhaar seeding.',
    action_steps: [
      'Visit your bank branch with original Aadhaar Card and Passbook.',
      'Submit the Aadhaar Seeding / Mandate Consent form for DBT.',
      'Verify status on resident.uidai.gov.in.'
    ],
    escalation_authority: 'Bank Branch Manager / UIDAI / PFMS',
    escalation_url: 'https://pfms.nic.in/'
  };

  try {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="JanSetu_Diagnostic_Report_${hid}.pdf"`);

    doc.pipe(res);

    // Header with warm taupe styling
    doc.rect(0, 0, 612, 90).fill('#3F3A37');
    doc.fillColor('#D3C3B9').fontSize(22).text('JANSETU - DBT FAILURE DETECTIVE', 50, 25, { bold: true });
    doc.fillColor('#BDAFA6').fontSize(11).text('Government Direct Benefit Transfer Diagnostic & Resolution Report', 50, 52);

    doc.moveDown(3);

    // Report Meta Box
    doc.fillColor('#2A2725').fontSize(14).text(`Diagnostic Case Reference: ${data.history_id}`, 50, 110, { bold: true });
    doc.fontSize(10).fillColor('#69615C');
    doc.text(`Generated On: ${new Date(data.diagnosed_at).toLocaleString('en-IN')}`);
    doc.text(`Beneficiary Name: ${data.citizen_name}`);
    doc.text(`Issue Category: ${data.issue_title}`);

    doc.moveDown();
    doc.rect(50, 175, 512, 1).fill('#BDAFA6');
    doc.moveDown(1.5);

    // Primary Diagnosis
    doc.fillColor('#2A2725').fontSize(14).text('Root Cause Identified:', 50, 195, { bold: true });
    doc.fillColor('#3F3A37').fontSize(12).text(data.cause);
    doc.fontSize(10).fillColor('#7E756F').text(`Severity Level: ${data.severity || 'High'}`);

    doc.moveDown();

    // Guidance
    doc.fillColor('#2A2725').fontSize(13).text('Official Resolution Guidance:', 50, 255, { bold: true });
    doc.fontSize(10).fillColor('#3F3A37').text(data.guidance, { width: 512, align: 'justify' });

    doc.moveDown();

    // Action Steps
    if (data.action_steps && data.action_steps.length > 0) {
      doc.fillColor('#2A2725').fontSize(12).text('Recommended Action Steps:', { bold: true });
      doc.moveDown(0.5);
      data.action_steps.forEach((step, idx) => {
        doc.fillColor('#3F3A37').fontSize(10).text(`${idx + 1}. ${step}`, { indent: 15 });
        doc.moveDown(0.3);
      });
    }

    doc.moveDown();

    // Escalation Section
    doc.fillColor('#2A2725').fontSize(12).text('Escalation & Official Portal:', { bold: true });
    doc.fillColor('#544E4A').fontSize(10).text(`Authority: ${data.escalation_authority || 'Local Branch / PFMS'}`);
    if (data.escalation_url) {
      doc.fillColor('#2A2725').text(`Official URL: ${data.escalation_url}`);
    }

    // Disclaimer Footer
    doc.rect(50, 680, 512, 70).fill('#F5F2EF');
    doc.fillColor('#69615C').fontSize(8).text(
      'DISCLAIMER: JanSetu is an independent civic assistance platform. This diagnosis is generated from rule-based government guidelines. JanSetu does not disburse funds or represent an official government authority. For official payment records, always consult https://pfms.nic.in/ or your respective scheme portal.',
      60,
      690,
      { width: 492, align: 'center' }
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF report: ' + err.message });
  }
});

module.exports = router;
