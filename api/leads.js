import { createClient } from 'redis';

// Simple in-memory leads storage for Vercel serverless functions with optional Redis support
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

  // Helper to connect to Redis
  const getRedisClient = async () => {
    const redisUrl = process.env.STORAGE_SBEMKA_REDIS_URL || process.env.REDIS_URL;
    if (redisUrl) {
      try {
        const client = createClient({ url: redisUrl });
        client.on('error', err => console.error('Redis Client Error', err));
        await client.connect();
        return client;
      } catch (err) {
        console.error('Failed to create or connect Redis client:', err);
      }
    }
    return null;
  };

  // Helper to load leads from Redis or fall back to RAM
  const getLeads = async () => {
    const client = await getRedisClient();
    if (client) {
      try {
        const data = await client.get('leads');
        await client.disconnect();
        return JSON.parse(data || '[]');
      } catch (err) {
        console.error('Redis read leads error:', err);
        try { await client.disconnect(); } catch (e) {}
      }
    }
    return memoryLeads;
  };

  // Helper to save leads to Redis and RAM
  const saveLeads = async (list) => {
    const client = await getRedisClient();
    if (client) {
      try {
        await client.set('leads', JSON.stringify(list));
        await client.disconnect();
      } catch (err) {
        console.error('Redis write leads error:', err);
        try { await client.disconnect(); } catch (e) {}
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
