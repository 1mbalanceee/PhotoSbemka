import { createClient } from 'redis';

// Simple in-memory visits storage for Vercel serverless functions with optional Redis support
let memoryVisits = [];

export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse the URL to check for query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);

  // DIAGNOSTIC ENDPOINT
  if (req.method === 'GET' && url.searchParams.get('test') === 'true') {
    const redisUrl = process.env.KV_URL || process.env.STORAGE_SBEMKA_REDIS_URL || process.env.REDIS_URL;
    const envKeys = Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('redis') || 
      k.toLowerCase().includes('storage') ||
      k.toLowerCase().includes('url')
    );
    
    let diag = {
      status: 'idle',
      env_keys_found: envKeys,
      has_url: !!redisUrl,
      url_length: redisUrl ? redisUrl.length : 0,
      url_prefix: redisUrl ? redisUrl.substring(0, 15) : 'none',
      error: null,
      stack: null,
      result: null
    };

    if (redisUrl) {
      let client;
      try {
        diag.status = 'creating_client';
        client = createClient({ 
          url: redisUrl,
          socket: {
            connectTimeout: 5000 // 5 seconds timeout
          }
        });
        diag.status = 'client_created';
        
        await client.connect();
        diag.status = 'connected';
        
        await client.set('nk_test_ping', 'pong_' + Date.now());
        const pingVal = await client.get('nk_test_ping');
        diag.status = 'ping_pong_success';
        diag.result = pingVal;
        
        await client.disconnect();
      } catch (err) {
        diag.error = err.message || String(err);
        diag.stack = err.stack;
        if (client) {
          try { await client.disconnect(); } catch (e) {}
        }
      }
    }
    return res.status(200).json(diag);
  }

  // Helper to connect to Redis
  const getRedisClient = async () => {
    const redisUrl = process.env.KV_URL || process.env.STORAGE_SBEMKA_REDIS_URL || process.env.REDIS_URL;
    if (redisUrl) {
      try {
        const client = createClient({ 
          url: redisUrl,
          socket: {
            connectTimeout: 3000
          }
        });
        client.on('error', err => console.error('Redis Client Error', err));
        await client.connect();
        return client;
      } catch (err) {
        console.error('Failed to create or connect Redis client:', err);
      }
    }
    return null;
  };

  // Helper to load visits from Redis or fall back to RAM
  const getVisits = async () => {
    const client = await getRedisClient();
    if (client) {
      try {
        const data = await client.get('visits');
        await client.disconnect();
        return JSON.parse(data || '[]');
      } catch (err) {
        console.error('Redis read visits error:', err);
        try { await client.disconnect(); } catch (e) {}
      }
    }
    return memoryVisits;
  };

  // Helper to save visits to Redis and RAM
  const saveVisits = async (list) => {
    const client = await getRedisClient();
    if (client) {
      try {
        await client.set('visits', JSON.stringify(list));
        await client.disconnect();
      } catch (err) {
        console.error('Redis write visits error:', err);
        try { await client.disconnect(); } catch (e) {}
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
    
    // Cap at 3000 visits to optimize storage space
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
