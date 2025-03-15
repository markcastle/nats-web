import { useState } from 'react';
import { useNats } from '../contexts/NatsContext';
import { testWebSocketConnection } from '../utils/websocketTest';

const ConnectionForm = () => {
  const { connectToNats, disconnect, isConnected, error } = useNats();
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  const [connectionType, setConnectionType] = useState<'url' | 'urlWithAuth'>('url');
  const [isConnecting, setIsConnecting] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showRawUrl, setShowRawUrl] = useState(false);
  const [testingWebSocket, setTestingWebSocket] = useState(false);
  const [wsTestResult, setWsTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Process URL to handle special characters in credentials
  const processUrl = (url: string): string => {
    try {
      // If URL already contains credentials, ensure they're properly encoded
      if (url.includes('@')) {
        // Extract parts of the URL
        const urlObj = new URL(url);
        const protocol = urlObj.protocol; // ws:// or wss://
        const credentials = urlObj.username && urlObj.password 
          ? `${encodeURIComponent(urlObj.username)}:${encodeURIComponent(urlObj.password)}@` 
          : '';
        const host = urlObj.host; // hostname:port
        const path = urlObj.pathname + urlObj.search + urlObj.hash;
        
        // Reconstruct the URL with encoded credentials
        return `${protocol}//${credentials}${host}${path}`;
      }
      return url;
    } catch (err) {
      console.error('Error processing URL:', err);
      return url; // Return original URL if there's an error
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsConnecting(true);
      
      // Validate URL format
      if (!serverUrl.startsWith('ws://') && !serverUrl.startsWith('wss://')) {
        throw new Error('URL must start with ws:// or wss:// for WebSocket connections');
      }
      
      // Process the URL to handle special characters in credentials
      const processedUrl = processUrl(serverUrl);
      console.log('Attempting to connect to:', showRawUrl ? processedUrl : serverUrl.replace(/\/\/([^@]*?)@/, '//***@'));
      
      if (connectionType === 'url' && token) {
        // Connect with separate token
        await connectToNats(processedUrl, token);
      } else {
        // Connect with URL only (auth may be embedded)
        await connectToNats(processedUrl);
      }
    } catch (err: any) {
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setServerUrl(url);
    
    // Check if URL contains authentication
    if (url.includes('@')) {
      setConnectionType('urlWithAuth');
    } else {
      setConnectionType('url');
    }
    
    // Clear previous test results when URL changes
    setWsTestResult(null);
  };

  const handleTestWebSocket = async () => {
    if (!serverUrl) return;
    
    try {
      setTestingWebSocket(true);
      setWsTestResult(null);
      
      // Validate URL format
      if (!serverUrl.startsWith('ws://') && !serverUrl.startsWith('wss://')) {
        throw new Error('URL must start with ws:// or wss:// for WebSocket connections');
      }
      
      // Process the URL to handle special characters in credentials
      const processedUrl = processUrl(serverUrl);
      
      // Test direct WebSocket connection
      const result = await testWebSocketConnection(processedUrl);
      setWsTestResult({
        success: true,
        message: result
      });
    } catch (err: any) {
      console.error('WebSocket test error:', err);
      setWsTestResult({
        success: false,
        message: err.message || 'Unknown error during WebSocket test'
      });
    } finally {
      setTestingWebSocket(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">NATS Connection</h2>
      
      {isConnected ? (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-600 font-medium">Connected to NATS</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">Server: {serverUrl.replace(/\/\/([^@]*?)@/, '//***@')}</p>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm text-blue-800">
            <p className="font-medium">Important NATS WebSocket Requirements:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Use <strong>WebSocket URLs</strong> that start with <code className="bg-blue-100 px-1 rounded">ws://</code> or <code className="bg-blue-100 px-1 rounded">wss://</code></li>
              <li>Your NATS server <strong>must be configured</strong> to support WebSocket connections</li>
              <li>The WebSocket port is often <strong>different</strong> from the standard NATS port (4222)</li>
              <li>Common WebSocket ports are <code className="bg-blue-100 px-1 rounded">8080</code> or <code className="bg-blue-100 px-1 rounded">8443</code> for secure connections</li>
            </ul>
          </div>
          
          <div>
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-1">
              NATS Server URL
            </label>
            <input
              id="serverUrl"
              type="text"
              value={serverUrl}
              onChange={handleUrlChange}
              placeholder="wss://nats.example.com:8443 or wss://user:pass@nats.example.com:8443"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: wss://sandbox.nats.io:8443 or wss://user:password@nats.example.com:8443
            </p>
          </div>

          {connectionType === 'url' && (
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Token (Optional)
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter auth token if required"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              id="advancedMode"
              type="checkbox"
              checked={advancedMode}
              onChange={() => setAdvancedMode(!advancedMode)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="advancedMode" className="ml-2 block text-sm text-gray-700">
              Show advanced options
            </label>
          </div>

          {advancedMode && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Advanced Options</h3>
              
              <div className="flex items-center mb-2">
                <input
                  id="showRawUrl"
                  type="checkbox"
                  checked={showRawUrl}
                  onChange={() => setShowRawUrl(!showRawUrl)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showRawUrl" className="ml-2 block text-sm text-gray-700">
                  Show raw URL in console logs (includes credentials)
                </label>
              </div>
              
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleTestWebSocket}
                  disabled={testingWebSocket || !serverUrl}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded transition-colors flex items-center"
                >
                  {testingWebSocket ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing WebSocket...
                    </>
                  ) : (
                    'Test Direct WebSocket Connection'
                  )}
                </button>
                
                {wsTestResult && (
                  <div className={`mt-2 text-xs p-2 rounded ${wsTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="font-medium">{wsTestResult.success ? 'Success:' : 'Error:'}</p>
                    <p>{wsTestResult.message}</p>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                <p className="font-medium">NATS Server WebSocket Configuration:</p>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                  <code>
{`# In nats-server.conf:
websocket {
  port: 8080
  no_tls: true
}

# For secure WebSocket (wss://):
websocket {
  port: 8443
  tls {
    cert_file: "/path/to/cert.pem"
    key_file: "/path/to/key.pem"
  }
}`}
                  </code>
                </pre>
                <p className="mt-2">Or with Docker:</p>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                  <code>
{`docker run -p 4222:4222 -p 8080:8080 nats:latest \\
  -js -m 8222 --websocket_port 8080`}
                  </code>
                </pre>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isConnecting}
              className={`flex-1 ${isConnecting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-medium py-2 px-4 rounded transition-colors flex justify-center items-center`}
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect to NATS'
              )}
            </button>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-medium">Connection Error:</p>
              <p>{error}</p>
              
              <div className="mt-2 text-xs">
                <p className="font-medium">Troubleshooting steps:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Make sure you're using WebSocket URLs (ws:// or wss://)</li>
                  <li>Verify your NATS server has WebSocket support enabled</li>
                  <li>Check that you're using the correct WebSocket port (often 8080 or 8443)</li>
                  <li>Try the "Test Direct WebSocket Connection" option to check basic connectivity</li>
                  <li>Check your browser's console for more detailed error information</li>
                </ul>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default ConnectionForm; 