// server.js
import express from 'express';
import { Client } from 'ssh2';
import { promisify } from 'util';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Store active SSH connections
const activeConnections = new Map();

// Helper function to create SSH client
const createSSHClient = (config) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      resolve(conn);
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey: config.keyFile,
    });
  });
};

// Connect endpoint
app.post('/api/ssh/connect', async (req, res) => {
  try {
    const { host, username, port, keyFile } = req.body;
    
    // Create unique session ID
    const sessionId = `${username}@${host}-${Date.now()}`;
    
    // Create SSH connection
    const conn = await createSSHClient({
      host,
      username,
      port: parseInt(port, 10),
      keyFile,
    });
    
    // Store connection
  console.log(conn)
    activeConnections.set(sessionId, conn);
    
    // Send session ID back to client
    res.json({ sessionId, message: 'Connected successfully' });
  } catch (error) {
    console.error('SSH Connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute command endpoint
app.post('/api/ssh/execute', async (req, res) => {
  const { sessionId, command } = req.body;
  
  try {
    const conn = activeConnections.get(sessionId);
    if (!conn) {
      throw new Error('No active connection found');
    }
    
    const exec = promisify(conn.exec).bind(conn);
    
    let output = '';
    let error = '';
    
    const stream = await exec(command);
    
    stream.on('data', (data) => {
      output += data.toString();
    });
    
    stream.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    stream.on('close', () => {
      if (error) {
        res.status(400).json({ error });
      } else {
        res.json({ output });
      }
    });
  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect endpoint
app.post('/api/ssh/disconnect', async (req, res) => {
  const { sessionId } = req.body;
  
  try {
    const conn = activeConnections.get(sessionId);
    if (conn) {
      conn.end();
      activeConnections.delete(sessionId);
      res.json({ message: 'Disconnected successfully' });
    } else {
      res.status(404).json({ error: 'No active connection found' });
    }
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clean up connections when server shuts down
process.on('SIGTERM', () => {
  activeConnections.forEach((conn) => {
    conn.end();
  });
  activeConnections.clear();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
