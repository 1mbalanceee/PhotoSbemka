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


// Determine database path. On Vercel, the file system is read-only except for /tmp.
// We check process.env.VERCEL to detect Vercel environment.
const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const dbPath = isVercel
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '..', 'database.sqlite');

console.log(`Database path: ${dbPath}`);

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

// Database sync promise to ensure tables exist
let dbSyncPromise = null;
const ensureDbSynced = () => {
  if (!dbSyncPromise) {
    dbSyncPromise = sequelize.authenticate()
      .then(() => sequelize.sync())
      .then(() => console.log('Database synchronized successfully.'))
      .catch(err => {
        console.error('Failed to sync database:', err);
        dbSyncPromise = null;
        throw err;
      });
  }
  return dbSyncPromise;
};

// Middleware to ensure DB is synced before processing request (essential for serverless)
app.use(async (req, res, next) => {
  try {
    await ensureDbSynced();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database Initialization Error' });
  }
});

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

// Export Express app for Vercel serverless environment
module.exports = app;
