// Simple in-memory visits storage for Vercel serverless functions
let memoryVisits = [];

export default (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST /api/visits — record a visit
  if (req.method === 'POST') {
    const { device, timestamp } = req.body || {};
    const newVisit = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      device: device || 'desktop',
      timestamp: timestamp || new Date().toISOString()
    };
    memoryVisits.unshift(newVisit);
    
    // Keep max 5000 visits to prevent memory leak
    if (memoryVisits.length > 5000) {
      memoryVisits = memoryVisits.slice(0, 5000);
    }
    return res.status(201).json(newVisit);
  }

  // GET /api/visits — retrieve all visits
  if (req.method === 'GET') {
    return res.status(200).json(memoryVisits);
  }

  // DELETE /api/visits — clear all visits
  if (req.method === 'DELETE') {
    memoryVisits = [];
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
