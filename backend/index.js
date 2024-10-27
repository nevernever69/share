import express from 'express';
import { Client } from 'ssh2';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(cors());

// Store active SSH connections and their associated WebSocket connections
const activeConnections = new Map();

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
      privateKey: config.privateKey,
    });
  });
};

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const sessionId = req.url.split('/ssh/')[1];
  const connection = activeConnections.get(sessionId);
  
  if (!connection) {
    ws.close();
    return;
  }
  
  connection.ws = ws;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { type, command, signal } = data;
      
      if (type === 'command') {
        const conn = connection.ssh;
        
        conn.exec(command, (err, stream) => {
          if (err) {
            ws.send(JSON.stringify({
              type: 'error',
              content: err.message
            }));
            return;
          }
          
          let output = '';
          
          stream.on('data', (data) => {
            output += data.toString();
            ws.send(JSON.stringify({
              type: 'output',
              content: data.toString()
            }));
          });
          
          stream.stderr.on('data', (data) => {
            ws.send(JSON.stringify({
              type: 'error',
              content: data.toString()
            }));
          });
          
          stream.on('close', () => {
            // Update current directory after command execution
            if (command.startsWith('cd ')) {
              conn.exec('pwd', (err, pwdStream) => {
                if (!err) {
                  let pwd = '';
                  pwdStream.on('data', (data) => {
                    pwd += data.toString();
                  });
                  pwdStream.on('close', () => {
                    ws.send(JSON.stringify({
                      type: 'directory',
                      path: pwd.trim()
                    }));
                  });
                }
              });
            }
          });
        });
      } else if (type === 'signal' && signal === 'SIGINT') {
        // Handle Ctrl+C
        // Note: Implementation depends on your SSH library's capabilities
        connection.currentStream?.signal('INT');
      } else if (type === 'completion') {
        // Handle tab completion
        // You would need to implement command completion logic here
        // This is a simple example that could be expanded
        conn.exec(`compgen -c ${command}`, (err, stream) => {
          if (!err) {
            let completions = '';
            stream.on('data', (data) => {
              completions += data.toString();
            });
            stream.on('close', () => {
              ws.send(JSON.stringify({
                type: 'completion',
                suggestions: completions.split('\n').filter(Boolean)
              }));
            });
          }
        });
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        content: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    const connection = activeConnections.get(sessionId);
    if (connection) {
      connection.ssh.end();
      activeConnections.delete(sessionId);
    }
  });
});

// Connect endpoint
app.post('/api/ssh/connect', async (req, res) => {
  try {
    const { host, username, port, privateKey } = req.body;
    const sessionId = uuidv4();
    
    const sshClient = await createSSHClient({
      host,
      username,
      port: parseInt(port, 10),
      privateKey
    });
    
    activeConnections.set(sessionId, {
      ssh: sshClient,
      ws: null,
      currentStream: null
    });
    
    res.json({ sessionId, message: 'Connected successfully' });
  } catch (error) {
    console.error('SSH Connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect endpoint
app.post('/api/ssh/disconnect', async (req, res) => {
  const { sessionId } = req.body;
  
  try {
    const connection = activeConnections.get(sessionId);
    if (connection) {
      connection.ssh.end();
      if (connection.ws) {
        connection.ws.close();
      }
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
  activeConnections.forEach((connection) => {
    connection.ssh.end();
    if (connection.ws) {
      connection.ws.close();
    }
  });
  activeConnections.clear();
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
