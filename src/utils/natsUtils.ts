import { connect, NatsConnection } from 'nats.ws';
import { NatsAuthOptions } from '../contexts/NatsContext';

/**
 * Creates a NATS connection using the official NATS.ws client
 * @param serverUrl The WebSocket URL of the NATS server
 * @param authOptions Authentication options (token or username/password)
 * @param timeout Optional connection timeout
 * @returns A Promise that resolves to a NatsConnection
 */
export async function createBrowserNatsConnection(
  serverUrl: string,
  authOptions: NatsAuthOptions = {},
  timeout?: number
): Promise<NatsConnection> {
  // Ensure URL starts with ws:// or wss://
  if (!serverUrl.startsWith('ws://') && !serverUrl.startsWith('wss://')) {
    throw new Error('NATS server URL must start with ws:// or wss:// for browser connections');
  }

  try {
    console.log('Connecting to NATS with official nats.ws client:', serverUrl);
    
    // Configure connection options
    const options: any = {
      servers: [serverUrl],
      reconnect: true,
      reconnectTimeWait: 2000,
      maxReconnectAttempts: 10,
      timeout: timeout || 30000, // Use provided timeout or default to 30 seconds
      pingInterval: 30000,
      maxPingOut: 3
    };

    // Add authentication if provided
    if (authOptions.token) {
      options.token = authOptions.token;
      console.log('Using token authentication');
    } else if (authOptions.username) {
      options.user = authOptions.username;
      options.pass = authOptions.password || '';
      console.log('Using username/password authentication');
    } else {
      console.log('No authentication provided');
    }
    
    // Log connection attempt details (safely)
    console.log('NATS connection options:', {
      ...options,
      servers: options.servers,
      token: options.token ? '***' : undefined,
      user: options.user ? '***' : undefined,
      pass: options.pass ? '***' : undefined
    });
    
    // Connect using the official client
    return await connect(options);
  } catch (error: any) {
    console.error('NATS connection error details:', error);
    
    // Provide user-friendly error messages
    if (error.message?.includes('refused') || error.code === 'ECONNREFUSED') {
      throw new Error(
        'Connection refused: The NATS server refused the connection. ' +
        'Please verify the server is running and accessible at the provided URL.'
      );
    } else if (error.message?.includes('timeout')) {
      throw new Error(
        'Connection timeout: The connection to the NATS server timed out. ' +
        'Please check your network connection and verify the server URL is correct.'
      );
    } else if (error.message?.includes('authentication') || error.message?.includes('Authorization')) {
      throw new Error(
        'Authentication failed: The provided credentials or token were rejected by the server. ' +
        'Please verify your authentication details.'
      );
    } else if (error.message?.includes('certificate') || error.message?.includes('SSL')) {
      throw new Error(
        'SSL/TLS error: There was an issue with the server\'s security certificate. ' +
        'This might be due to a self-signed certificate or certificate validation issue.'
      );
    } else {
      // For any other errors, include the original error message for debugging
      throw new Error(
        `Connection failed: ${error.message || 'Unknown error'}. ` +
        'Please check the console for more details.'
      );
    }
  }
} 