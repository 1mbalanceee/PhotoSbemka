const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Load data helper
const LEADS_FILE = path.join(__dirname, 'leads.json');
const VISITS_FILE = path.join(__dirname, 'visits.json');

let memoryLeads = [];
let memoryId = 1;
let memoryVisits = [];

// Sync leads load
try {
  if (fs.existsSync(LEADS_FILE)) {
    memoryLeads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    if (memoryLeads.length > 0) {
      memoryId = Math.max(...memoryLeads.map(l => l.id)) + 1;
    }
  }
} catch (e) {
  console.error('Failed to load leads from file:', e);
}

// Sync visits load
try {
  if (fs.existsSync(VISITS_FILE)) {
    memoryVisits = JSON.parse(fs.readFileSync(VISITS_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load visits from file:', e);
}

const saveLeads = () => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(memoryLeads, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save leads to file:', e);
  }
};

const saveVisits = () => {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify(memoryVisits, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save visits to file:', e);
  }
};

// 1. Create a new lead
app.post('/api/leads', (req, res) => {
  try {
    const { name, contact, kind, when, msg, plan, date } = req.body;
    if (!name || !contact) return res.status(400).json({ error: 'Name and contact are required fields.' });

    const lead = { id: memoryId++, name, contact, kind, when, msg, plan, date, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    memoryLeads.unshift(lead);
    saveLeads();
    
    // Simulate slight delay for premium feedback
    setTimeout(() => res.status(201).json(lead), 500);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Get all leads
app.get('/api/leads', (req, res) => {
  return res.json(memoryLeads);
});

// 3. Delete a lead
app.delete('/api/leads/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = memoryLeads.length;
    memoryLeads = memoryLeads.filter(l => l.id != id);
    if (memoryLeads.length === initialLength) return res.status(404).json({ error: 'Not found' });
    saveLeads();
    
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Clear all leads
app.delete('/api/leads', (req, res) => {
  memoryLeads = [];
  saveLeads();
  return res.json({ success: true });
});

// 5. Create a new visit
app.post('/api/visits', (req, res) => {
  try {
    const { device, timestamp } = req.body || {};
    const visit = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      device: device || 'desktop',
      timestamp: timestamp || new Date().toISOString()
    };
    memoryVisits.unshift(visit);
    if (memoryVisits.length > 5000) {
      memoryVisits = memoryVisits.slice(0, 5000);
    }
    saveVisits();
    return res.status(201).json(visit);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. Get all visits
app.get('/api/visits', (req, res) => {
  return res.json(memoryVisits);
});

// 7. Clear all visits
app.delete('/api/visits', (req, res) => {
  memoryVisits = [];
  saveVisits();
  return res.json({ success: true });
});

// Serve static files
app.use(express.static(__dirname));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
}
