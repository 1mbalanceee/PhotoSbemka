// Simple in-memory leads storage for Vercel serverless functions
// No Express, no SQLite, no Sequelize — just plain Node.js handler

let memoryLeads = [];
let memoryId = 1;

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse the URL to check for /api/leads/:id pattern
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean); // ["api", "leads", "123"]
  const leadId = pathParts.length === 3 ? pathParts[2] : null;

  // POST /api/leads — create a new lead
  if (req.method === 'POST' && !leadId) {
    const { name, contact, kind, when, msg, date } = req.body || {};
    if (!name || !contact) {
      return res.status(400).json({ error: 'Name and contact are required fields.' });
    }
    const lead = {
      id: memoryId++,
      name, contact, kind, when, msg, date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryLeads.unshift(lead);
    return res.status(201).json(lead);
  }

  // GET /api/leads — get all leads
  if (req.method === 'GET') {
    return res.status(200).json(memoryLeads);
  }

  // DELETE /api/leads/:id — delete one lead
  if (req.method === 'DELETE' && leadId) {
    const initialLength = memoryLeads.length;
    memoryLeads = memoryLeads.filter(l => l.id != leadId);
    if (memoryLeads.length === initialLength) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({ success: true });
  }

  // DELETE /api/leads — clear all leads
  if (req.method === 'DELETE' && !leadId) {
    memoryLeads = [];
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
