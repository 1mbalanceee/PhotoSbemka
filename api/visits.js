// Simple in-memory visits storage for Vercel serverless functions with optional Vercel KV support
let memoryVisits = [];

export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Helper to load visits from Vercel KV or fall back to RAM
  const getVisits = async () => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const response = await fetch(`${process.env.KV_REST_API_URL}/get/visits`, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        const data = await response.json();
        return JSON.parse(data.result || '[]');
      } catch (err) {
        console.error('Vercel KV read error:', err);
      }
    }
    return memoryVisits;
  };

  // Helper to save visits to Vercel KV and RAM
  const saveVisits = async (list) => {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        await fetch(`${process.env.KV_REST_API_URL}/set/visits`, {
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
    memoryVisits = list;
  };

  // POST /api/visits — record a visit
  if (req.method === 'POST') {
    const { device, timestamp } = req.body || {};
    const newVisit = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      device: device || 'desktop',
      timestamp: timestamp || new Date().toISOString()
    };
    
    const currentVisits = await getVisits();
    currentVisits.unshift(newVisit);
    
    // Cap at 3000 visits to optimize free storage tier
    const capped = currentVisits.slice(0, 3000);
    await saveVisits(capped);
    
    return res.status(201).json(newVisit);
  }

  // GET /api/visits — retrieve all visits
  if (req.method === 'GET') {
    const currentVisits = await getVisits();
    return res.status(200).json(currentVisits);
  }

  // DELETE /api/visits — clear all visits
  if (req.method === 'DELETE') {
    await saveVisits([]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
