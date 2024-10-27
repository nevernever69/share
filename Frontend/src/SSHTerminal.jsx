import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Book, Flag, Server, Upload, Key, Power } from 'lucide-react';

const SSHTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sshConfig, setSshConfig] = useState({
    host: '',
    username: '',
    port: '22',
    keyFile: null
  });
  const [connecting, setConnecting] = useState(false);
  const terminalRef = useRef(null);
  const historyEndRef = useRef(null);

  // Auto-scroll terminal to bottom when history updates
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        handleDisconnect();
      }
    };
  }, [sessionId]);

  const handleKeyFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSshConfig(prev => ({
          ...prev,
          keyFile: e.target.result
        }));
        showAlert('Key file loaded successfully', 'success');
      };
      reader.onerror = () => {
        showAlert('Failed to load key file');
      };
      reader.readAsText(file);
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
      const response = await fetch('https://api.nevernever.me/api/ssh/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sshConfig),
      });

      const data = await response.json();

      if (response.ok && data.sessionId) {
        setSessionId(data.sessionId);
        setConnected(true);
        addToHistory('system', 'Successfully connected to SSH server');
        showAlert('Connected successfully', 'success');
      } else {
        throw new Error(data.error || 'Connection failed');
      }
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
      await fetch('https://api.nevernever.me/api/ssh/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } finally {
      setSessionId(null);
      setConnected(false);
      addToHistory('system', 'Disconnected from SSH server');
      showAlert('Disconnected successfully', 'success');
    }
  };

  const addToHistory = (type, content) => {
    setHistory(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const handleCommand = async (command) => {
    if (!connected || !sessionId) {
      addToHistory('error', 'Not connected to SSH server');
      return;
    }

    addToHistory('command', command);
    try {
      const response = await fetch('https://api.nevernever.me/api/ssh/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, command }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.output) {
          addToHistory('output', data.output);
        }
      } else {
        throw new Error(data.error || 'Command execution failed');
      }
    } catch (error) {
      addToHistory('error', `Command execution failed: ${error.message}`);
    }
  };

  // Alert Component
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
              <h1 className="text-2xl font-bold mb-4">Lab Manual</h1>
              <p className="mb-4">Welcome to the Cloud Forensics Lab. This environment allows you to connect to remote servers and perform forensic analysis.</p>
              
              <h2 className="text-xl font-bold mt-6 mb-3">Quick Start Guide</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Enter your SSH server details in the connection panel</li>
                <li>Upload your private key (.pem) file</li>
                <li>Click Connect to establish the SSH connection</li>
                <li>Once connected, use the terminal to execute commands</li>
              </ol>

              <h2 className="text-xl font-bold mt-6 mb-3">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Secure SSH connections with key authentication</li>
                <li>Real-time command execution</li>
                <li>Command history with timestamps</li>
                <li>Color-coded output for different message types</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSHTerminal;
