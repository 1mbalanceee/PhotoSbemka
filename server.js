const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Force Vercel's static analysis (Node File Trace) to bundle the sqlite3 native module
try {
  require('sqlite3');
} catch (e) {
  console.warn('sqlite3 native preload warning:', e.message);
}

const app = express();
const PORT = process.env.PORT || 8080;

// Determine database path. On Vercel, the file system is read-only except for /tmp.
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const dbPath = isVercel
  ? '/tmp/database.sqlite'
  : path.join(__dirname, 'database.sqlite');

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Turn off query logging for cleaner server output
});

// Define the Lead Model
const Lead = sequelize.define('Lead', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  kind: {
    type: DataTypes.STRING,
    defaultValue: 'family',
  },
  when: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  msg: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true, // Auto adds createdAt, updatedAt
});

// Middleware
app.use(express.json());

// API Endpoints

// 1. Create a new lead (submission from contact form)
app.post('/api/leads', async (req, res) => {
  try {
    const { name, contact, kind, when, msg, date } = req.body;
    
    if (!name || !contact) {
      return res.status(400).json({ error: 'Name and contact are required fields.' });
    }

    const lead = await Lead.create({ name, contact, kind, when, msg, date });
    return res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Get all leads (sorted by newest first)
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.findAll({
      order: [['id', 'DESC']],
    });
    return res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Delete a specific lead by ID
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await Lead.destroy({ where: { id } });
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Clear all leads
app.delete('/api/leads', async (req, res) => {
  try {
    await Lead.destroy({ truncate: true });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error clearing leads:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Route wildcard: send all other requests to index.html for client-side routing (/admin, /story, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Sync Database and start server
async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Creates tables if they do not exist
    console.log('Database connected and synchronized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database/server:', error);
    process.exit(1);
  }
}

// Export Express app for Vercel serverless environment
if (process.env.VERCEL) {
  // Sync db synchronously for Vercel before requests
  sequelize.sync().catch(console.error);
  module.exports = app;
} else {
  start();
}
