/**
 * Utility to test direct WebSocket connections
 * This can help determine if the issue is with the NATS library or with the WebSocket connection itself
 */

/**
 * Tests a direct WebSocket connection to the given URL
 * @param url The WebSocket URL to test
 * @returns A promise that resolves with connection status or rejects with an error
 */
export function testWebSocketConnection(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Testing direct WebSocket connection to: ${url}`);
      
      // Create a WebSocket connection
      const socket = new WebSocket(url);
      
      // Set a timeout for the connection attempt
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('Connection timeout: The WebSocket connection attempt timed out after 10 seconds'));
      }, 10000);
      
      // Connection opened successfully
      socket.addEventListener('open', (event) => {
        clearTimeout(timeout);
        console.log('Direct WebSocket connection successful!', event);
        
        // Close the socket after successful test
        setTimeout(() => {
          socket.close();
        }, 1000);
        
        resolve('WebSocket connection successful! This confirms your browser can establish a WebSocket connection to the server.');
      });
      
      // Connection error
      socket.addEventListener('error', (event) => {
        clearTimeout(timeout);
        console.error('WebSocket connection error:', event);
        reject(new Error('WebSocket connection failed. This indicates a network, firewall, or server configuration issue.'));
      });
      
      // Connection closed
      socket.addEventListener('close', (event) => {
        clearTimeout(timeout);
        console.log('WebSocket connection closed:', event);
        
        if (event.wasClean) {
          resolve(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
          reject(new Error(`WebSocket connection closed unexpectedly, code=${event.code}`));
        }
      });
      
    } catch (error: any) {
      console.error('Error creating WebSocket:', error);
      reject(new Error(`Failed to create WebSocket: ${error.message}`));
    }
  });
} 