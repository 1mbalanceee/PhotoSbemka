const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

let LeadModel = null;
let memoryLeads = [];
let memoryId = 1;

try {
  const { Sequelize, DataTypes } = require('sequelize');
  const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
  const dbPath = isVercel ? '/tmp/database.sqlite' : path.join(__dirname, 'database.sqlite');
  
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });

  LeadModel = sequelize.define('Lead', {
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    contact: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    kind: { type: DataTypes.STRING, defaultValue: 'family' },
    when: { type: DataTypes.STRING, allowNull: true },
    msg: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.STRING, allowNull: false },
  }, { timestamps: true });

  if (!process.env.VERCEL) {
    sequelize.sync().catch(console.error);
  } else {
    // Attempt sync synchronously for Vercel
    sequelize.sync().catch(console.error);
  }
} catch (error) {
  console.warn('SQLite is not available, falling back to in-memory storage. Error:', error.message);
}

// 1. Create a new lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, contact, kind, when, msg, date } = req.body;
    if (!name || !contact) return res.status(400).json({ error: 'Name and contact are required fields.' });

    if (LeadModel) {
      const lead = await LeadModel.create({ name, contact, kind, when, msg, date });
      return res.status(201).json(lead);
    } else {
      const lead = { id: memoryId++, name, contact, kind, when, msg, date, createdAt: new Date(), updatedAt: new Date() };
      memoryLeads.unshift(lead);
      return res.status(201).json(lead);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    if (LeadModel) {
      const leads = await LeadModel.findAll({ order: [['id', 'DESC']] });
      return res.json(leads);
    } else {
      return res.json(memoryLeads);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Delete a lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (LeadModel) {
      const count = await LeadModel.destroy({ where: { id } });
      if (count === 0) return res.status(404).json({ error: 'Not found' });
    } else {
      const initialLength = memoryLeads.length;
      memoryLeads = memoryLeads.filter(l => l.id != id);
      if (memoryLeads.length === initialLength) return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Clear all leads
app.delete('/api/leads', async (req, res) => {
  try {
    if (LeadModel) {
      await LeadModel.destroy({ truncate: true });
    } else {
      memoryLeads = [];
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files
app.use(express.static(__dirname));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
}
