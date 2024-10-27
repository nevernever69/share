import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Book, Flag, Server, Upload, Key, Power, Folder, Command, AlertCircle, CheckCircle, Coffee, Info } from 'lucide-react';
import LabEnvironment from './SSHInterface';
import LoadingScreen from './Loading';
const InvestigationTips = ({ showTips }) => (
  showTips && (
    <div className="fixed top-12 right-20 p-4 bg-gray-800 text-gray-100 rounded-lg shadow-lg w-64 z-50">
      <h3 className="font-bold text-lg">Investigation Tips</h3>
      <ul className="mt-2 text-sm list-disc list-inside space-y-1">
        <li>Document all commands and findings</li>
        <li>Create copies of important evidence</li>
        <li>Maintain chain of custody</li>
        <li>Note all timestamps</li>
      </ul>
    </div>
  )
);
const SSHTerminal = () => {
  const [showTips, setShowTips] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentDirectory, setCurrentDirectory] = useState('~');
 
  const [sshConfig, setSshConfig] = useState({
    host: '35.95.74.215',
    username: 'ubuntu',
    port: '22',
    keyFile: null
  });
  const [connecting, setConnecting] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef(null);
  const historyEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // WebSocket connection setup
  useEffect(() => {
    if (sessionId) {
      setupWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:3001/ssh/${sessionId}`);
    
    ws.onopen = () => {
      addToHistory('system', 'Terminal connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'output':
          addToHistory('output', data.content);
          break;
        case 'error':
          addToHistory('error', data.content);
          break;
        case 'directory':
          setCurrentDirectory(data.path);
          break;
        default:
          addToHistory('system', data.content);
      }
      setIsProcessing(false);
    };

    ws.onclose = () => {
      addToHistory('system', 'Terminal connection closed');
      setConnected(false);
      setSessionId(null);
    };

    ws.onerror = (error) => {
      addToHistory('error', 'WebSocket error occurred');
      showAlert('Connection error occurred', 'error');
    };

    wsRef.current = ws;
  };

  const handleKeyFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSshConfig(prev => ({
            ...prev,
            keyFile: e.target.result
          }));
          showAlert('Key file loaded successfully', 'success');
        };
        reader.readAsText(file);
      } catch (error) {
        showAlert('Failed to load key file: ' + error.message);
      }
    }
  };

  const showAlert = (message, type = 'error') => {
    setAlertMessage({ text: message, type });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleConnect = async () => {
    if (!sshConfig.host || !sshConfig.username || !sshConfig.keyFile) {
      showAlert('Please fill in all required fields');
      return;
    }

    setConnecting(true);
    try {
      const response = await fetch('http://localhost:3001/api/ssh/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: sshConfig.host,
          username: sshConfig.username,
          port: sshConfig.port,
          privateKey: sshConfig.keyFile
        }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      setSessionId(data.sessionId);
      setConnected(true);
      addToHistory('system', `Connected to ${sshConfig.host} as ${sshConfig.username}`);
      showAlert('Connected successfully', 'success');
    } catch (error) {
      showAlert(`Connection failed: ${error.message}`);
      addToHistory('error', `Connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/ssh/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setSessionId(null);
      setConnected(false);
      setCurrentDirectory('~');
      addToHistory('system', 'Disconnected from SSH server');
      showAlert('Disconnected successfully', 'success');
    }
  };

  const addToHistory = (type, content) => {
    setHistory(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const handleCommand = async (command) => {
    if (!connected || !sessionId || !wsRef.current) {
      addToHistory('error', 'Not connected to SSH server');
      return;
    }

    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    addToHistory('command', command);
    setIsProcessing(true);

    try {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        command: command
      }));
    } catch (error) {
      addToHistory('error', `Failed to send command: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (isProcessing && e.key === 'c' && e.ctrlKey) {
      wsRef.current?.send(JSON.stringify({
        type: 'signal',
        signal: 'SIGINT'
      }));
      setIsProcessing(false);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (wsRef.current && input.trim()) {
        wsRef.current.send(JSON.stringify({
          type: 'completion',
          command: input
        }));
      }
    }
  };

  // ... [Previous Alert, ConnectionPanel, and TerminalWindow components remain the same] ...
const Alert = ({ message, type }) => (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white z-50 animate-fade-in`}>
      <p className="text-sm">{message}</p>
    </div>
  );

  const ConnectionPanel = () => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Key className="w-5 h-5 mr-2" />
        SSH Connection
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Host*</label>
          <input
            defaultValue="35.95.74.215"
            type="text"
            value={sshConfig.host}
            onChange={(e) => setSshConfig(prev => ({ ...prev, host: e.target.value }))}
            placeholder="example.com"
            className="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username*</label>
          <input
            type="text"
            value={sshConfig.username}
            onChange={(e) => setSshConfig(prev => ({ ...prev, username: e.target.value }))}
            placeholder="ubuntu"
            className="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Port</label>
          <input
            type="text"
            value={sshConfig.port}
            onChange={(e) => setSshConfig(prev => ({ ...prev, port: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Private Key (.pem)*</label>
          <div className="flex items-center space-x-2">
            <label className="flex-1 cursor-pointer">
              <div className="px-3 py-2 bg-gray-700 rounded-md flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                {sshConfig.keyFile ? 'Key file loaded' : 'Upload key file'}
              </div>
              <input
                type="file"
                accept=".pem"
                onChange={handleKeyFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleConnect}
            disabled={connecting || !sshConfig.keyFile}
            className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors ${
              connecting || !sshConfig.keyFile
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{connecting ? 'Connecting...' : 'Connect'}</span>
          </button>
          {connected && (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const TerminalWindow = () => (
    <div className="flex flex-col h-full">
      <div 
        ref={terminalRef}
        className="flex-1 bg-gray-900 p-4 font-mono text-sm overflow-y-auto"
      >
        {history.map((entry, index) => (
          <div 
            key={index} 
            className={`mb-2 ${
              entry.type === 'system' ? 'text-blue-400' :
              entry.type === 'error' ? 'text-red-400' :
              entry.type === 'command' ? 'text-green-400' :
              'text-gray-100'
            }`}
          >
            <span className="text-gray-500 text-xs mr-2">
              {entry.timestamp.toLocaleTimeString()}
            </span>
            {entry.content}
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>
      {connected && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              handleCommand(input.trim());
              setInput('');
            }
          }}
          className="flex items-center p-2 bg-gray-800 border-t border-gray-700"
        >
          <span className="text-green-400 mr-2">{sshConfig.username}@{sshConfig.host}:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none focus:ring-0"
            autoFocus
          />
        </form>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
    {alertMessage && (
      <Alert message={alertMessage.text} type={alertMessage.type} />
    )}
    {showTips && <InvestigationTips showTips={showTips} />}
    
    <nav className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Terminal className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-bold">Cloud Forensics Lab</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowManual(!showManual)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Book className="w-4 h-4" />
            <span>Lab Manual</span>
          </button>
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>Investigation Tips</span>
          </button>
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-md">
            <Server className={`w-4 h-4 ${connected ? 'text-green-400' : 'text-red-400'}`} />
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </nav>

    <div className="flex h-[calc(100vh-4rem)]">
      <div className={`flex-1 ${showManual ? 'w-1/2' : 'w-full'} flex`}>
        {!connected ? (
          <div className="flex-1 p-4">
            <ConnectionPanel />
          </div>
        ) : (
          <TerminalWindow />
        )}
      </div>
        {showManual && (
  <div className="w-1/2 border-l border-gray-700 p-4 overflow-y-auto">
    <div className="prose prose-invert">
      <h1 className="text-2xl font-bold mb-4">Lab Manual - Challenge Scenario 1</h1>
      
      {/* Introduction Section */}
      <h2 className="text-xl font-bold mt-6 mb-3">Introduction</h2>
      <p>This CTF simulates a real-world cloud server breach incident that requires digital forensics investigation. The challenge contains multiple flags hidden throughout the system, each representing different aspects of the breach and forensic artifacts.</p>

      {/* Challenge Scenario */}
      <h2 className="text-xl font-bold mt-6 mb-3">Challenge Scenario 1</h2>
      <p>A company's cloud server has been potentially compromised. Security monitoring has detected suspicious activities, including <i>unauthorized access attempts, unusual database operations, suspicious network connections</i>, and <i>possible data exfiltration</i>.
      <p className='py-2'>
      Your task is to investigate the incident, collect evidence, and recover all flags that document the breach!
      </p>
      </p>

      {/* Step-by-Step Investigation Guide */}
      <h3 className="font-bold mb-2 py-2">Phase 1: Initial System Survey</h3>
<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Check running processes
ps aux`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Review user accounts
cat /etc/passwd`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Examine system logs
cat /var/log/syslog`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Check for suspicious files
find / -type f -name "*.sh" -o -name "*.py" -o -name "*.exe" 2&gt;/dev/null`}
  </code>
</pre>

<h3 className="font-bold mb-2">Phase 2: Deep Investigation</h3>
<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Analyze web server configuration
cat /etc/apache2/apache2.conf`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Review database access
cat /var/log/mysql/mysql.log`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Check for hidden files
find / -type f -name ".*" 2&gt;/dev/null`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Examine network connections
netstat -tulnp`}
  </code>
</pre>

<h3 className="font-bold mb-2">Phase 3: Evidence Collection</h3>
<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Gather relevant logs
tar -cvzf logs.tar.gz /var/log`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Extract suspicious files
cp /path/to/suspicious_file /path/to/evidence_directory`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Document findings
echo "Finding details" &gt;&gt; investigation_report.txt`}
  </code>
</pre>

<pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
  <code className="text-sm text-gray-300 font-mono">
    {`# Create timeline
last -F`}
  </code>
</pre>


      {/* Toggle Button for Solutions */}
      <button 
        onClick={() => setShowSolution(!showSolution)} 
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-6">
        {showSolution ? "Hide Solutions" : "Show Solutions"}
      </button>

      {/* Detailed Solutions */}
      {showSolution && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-3">Detailed Solutions</h2>

          {/* Flag 1 to 10 Solutions */}
          <h3 className="font-bold mb-2">Flag 1: Suspicious User Discovery</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Check for suspicious users
cat /etc/passwd
ls -la /home

# Find Flag 1 in user password
grep "hacker" /etc/shadow`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag1{'{'}Susp1c10us_User_Found{'}'}</p>

          <h3 className="font-bold mb-2">Flag 2: Bash History Analysis</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Check bash history of suspicious user
cat /home/hacker/.bash_history`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag2{'{'}Weak_DB_Creds_1n_H1story{'}'}</p>

          <h3 className="font-bold mb-2">Flag 3: Database Investigation</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# List MySQL users and permissions
mysql -e "SELECT user,host,authentication_string FROM mysql.user;"`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag3{'{'}DB_Dump_3xf1ltrat10n{'}'}</p>

          <h3 className="font-bold mb-2">Flag 4: Database Dump Analysis</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Examine suspicious database dump
cat /var/log/mysql/suspicious_dump.sql`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag4{'{'}DB_Dump_D1sc0very{'}'}</p>

          <h3 className="font-bold mb-2">Flag 5: Web Shell Detection</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Search for hidden files in web root
find /var/www/html -type f -name ".*"
cat /var/www/html/images/.hidden.php`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag5{'{'}W3bsh3ll_L0cated{'}'}</p>

          <h3 className="font-bold mb-2">Flag 6: Network Connection Analysis</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Review suspicious network connections
cat /var/log/suspicious/netstat.log`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag6{'{'}Susp1c10us_C0nnect10ns{'}'}</p>

          <h3 className="font-bold mb-2">Flag 7: Encrypted Data Recovery</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Decrypt hidden data
openssl enc -aes-256-cbc -d -salt -k "forensics" -in /opt/hidden/.encrypted_data`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag7{'{'}3ncrypt3d_D4ta_F0und{'}'}</p>

          <h3 className="font-bold mb-2">Flag 8: Web Log Analysis</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Examine Apache access logs
grep "hidden.php" /var/log/apache2/access.log`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag8{'{'}W3b_L0gs_R3v34l_Truth{'}'}</p>

          <h3 className="font-bold mb-2">Flag 9: Memory Analysis</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Analyze memory dump
strings /opt/hidden/memory.dmp | grep "Flag"`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag9{'{'}M3m0ry_Dump_4nalys1s{'}'}</p>

          <h3 className="font-bold mb-2">Flag 10: Final Challenge</h3>
          <pre className="bg-gray-900 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700">
            <code className="text-sm text-gray-300 font-mono">
              {`# Combine all flags and decrypt final secret
cat /root/README.txt
# Use each flag in order to unlock final clue`}
            </code>
          </pre>
          <p className="text-green-400 font-mono">Flag10{'{'}M4st3r_0f_F0rens1cs{'}'}</p>
        </>
      )}
    </div>
  </div>
)}


      </div>
    </div>
  );
};

export default SSHTerminal;