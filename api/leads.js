// Simple in-memory leads storage for Vercel serverless functions with optional Vercel KV support
let memoryLeads = [];

export default async (req, res) => {
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

  // Helper to load leads from Vercel KV or fall back to RAM
  const getLeads = async () => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const response = await fetch(`${process.env.KV_REST_API_URL}/get/leads`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        const data = await response.json();
        return JSON.parse(data.result || '[]');
      } catch (err) {
        console.error('Vercel KV read error:', err);
      }
    }
    return memoryLeads;
  };

  // Helper to save leads to Vercel KV and RAM
  const saveLeads = async (list) => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        await fetch(`${process.env.KV_REST_API_URL}/set/leads`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(list)
        });
      } catch (err) {
        console.error('Vercel KV write error:', err);
      }
    }
    memoryLeads = list;
  };

  // POST /api/leads — create a new lead
  if (req.method === 'POST' && !leadId) {
    const { name, contact, kind, when, msg, plan, date } = req.body || {};
    if (!name || !contact) {
      return res.status(400).json({ error: 'Name and contact are required fields.' });
    }
    const currentLeads = await getLeads();
    const nextId = currentLeads.length > 0 ? Math.max(...currentLeads.map(l => l.id)) + 1 : 1;
    const lead = {
      id: nextId,
      name, contact, kind, when, msg, plan, date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    currentLeads.unshift(lead);
    await saveLeads(currentLeads);
    return res.status(201).json(lead);
  }

  // GET /api/leads — get all leads
  if (req.method === 'GET') {
    const currentLeads = await getLeads();
    return res.status(200).json(currentLeads);
  }

  // DELETE /api/leads/:id — delete one lead
  if (req.method === 'DELETE' && leadId) {
    let currentLeads = await getLeads();
    const initialLength = currentLeads.length;
    currentLeads = currentLeads.filter(l => l.id != leadId);
    if (currentLeads.length === initialLength) {
      return res.status(404).json({ error: 'Not found' });
    }
    await saveLeads(currentLeads);
    return res.status(200).json({ success: true });
  }

  // DELETE /api/leads — clear all leads
  if (req.method === 'DELETE' && !leadId) {
    await saveLeads([]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
