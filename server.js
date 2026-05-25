const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// In-memory array for test format
let memoryLeads = [];
let memoryId = 1;

// 1. Create a new lead
app.post('/api/leads', (req, res) => {
  try {
    const { name, contact, kind, when, msg, date } = req.body;
    if (!name || !contact) return res.status(400).json({ error: 'Name and contact are required fields.' });

    const lead = { id: memoryId++, name, contact, kind, when, msg, date, createdAt: new Date(), updatedAt: new Date() };
    memoryLeads.unshift(lead);
    
    // Simulate slight delay
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
    
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Clear all leads
app.delete('/api/leads', (req, res) => {
  memoryLeads = [];
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
