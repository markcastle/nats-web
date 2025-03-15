import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NatsConnection, Subscription, StringCodec } from 'nats';
import { createBrowserNatsConnection } from '../utils/natsUtils';

interface NatsContextType {
  connection: NatsConnection | null;
  isConnected: boolean;
  error: string | null;
  connectToNats: (serverUrl: string, token?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  publishMessage: (topic: string, message: string) => Promise<void>;
  subscribeToTopic: (topic: string, callback: (message: string) => void) => Promise<Subscription | null>;
  createTopic: (topic: string) => Promise<void>;
  activeSubscriptions: Map<string, Subscription>;
}

const NatsContext = createContext<NatsContextType | undefined>(undefined);

export const useNats = () => {
  const context = useContext(NatsContext);
  if (context === undefined) {
    throw new Error('useNats must be used within a NatsProvider');
  }
  return context;
};

interface NatsProviderProps {
  children: ReactNode;
}

export const NatsProvider = ({ children }: NatsProviderProps) => {
  const [connection, setConnection] = useState<NatsConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubscriptions] = useState<Map<string, Subscription>>(new Map());

  // Clean up connection on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.close().catch(console.error);
      }
    };
  }, [connection]);

  const connectToNats = async (serverUrl: string, token?: string) => {
    try {
      setError(null);
      
      // Use our browser-specific connection utility
      const nc = await createBrowserNatsConnection(serverUrl, token);
      
      console.log('NATS connection established');
      setConnection(nc);
      setIsConnected(true);
      
      // Set up disconnect handler
      nc.closed().then(() => {
        console.log('NATS connection closed');
        setIsConnected(false);
        setConnection(null);
      }).catch((err) => {
        console.error('NATS connection closed with error:', err);
        setError(`Connection closed with error: ${err.message}`);
        setIsConnected(false);
        setConnection(null);
      });
      
    } catch (err: any) {
      console.error('Failed to connect to NATS:', err);
      setError(`Failed to connect: ${err.message}`);
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    if (connection) {
      try {
        // Close all active subscriptions
        for (const sub of activeSubscriptions.values()) {
          sub.unsubscribe();
        }
        activeSubscriptions.clear();
        
        // Close the connection
        await connection.close();
        setConnection(null);
        setIsConnected(false);
      } catch (err: any) {
        setError(`Failed to disconnect: ${err.message}`);
      }
    }
  };

  const publishMessage = async (topic: string, message: string) => {
    if (!connection) {
      setError('Not connected to NATS');
      return;
    }

    try {
      const sc = StringCodec();
      connection.publish(topic, sc.encode(message));
    } catch (err: any) {
      setError(`Failed to publish message: ${err.message}`);
    }
  };

  const subscribeToTopic = async (topic: string, callback: (message: string) => void) => {
    if (!connection) {
      setError('Not connected to NATS');
      return null;
    }

    try {
      const sc = StringCodec();
      const sub = connection.subscribe(topic);
      
      // Store the subscription
      activeSubscriptions.set(topic, sub);
      
      // Process messages
      (async () => {
        for await (const msg of sub) {
          const data = sc.decode(msg.data);
          callback(data);
        }
      })().catch((err) => {
        setError(`Subscription error: ${err.message}`);
      });
      
      return sub;
    } catch (err: any) {
      setError(`Failed to subscribe: ${err.message}`);
      return null;
    }
  };

  // In NATS, topics are created implicitly when publishing to them
  // This is just a wrapper around publishMessage for clarity
  const createTopic = async (topic: string) => {
    if (!connection) {
      setError('Not connected to NATS');
      return;
    }

    try {
      const sc = StringCodec();
      connection.publish(topic, sc.encode('Topic created'));
    } catch (err: any) {
      setError(`Failed to create topic: ${err.message}`);
    }
  };

  const value = {
    connection,
    isConnected,
    error,
    connectToNats,
    disconnect,
    publishMessage,
    subscribeToTopic,
    createTopic,
    activeSubscriptions
  };

  return <NatsContext.Provider value={value}>{children}</NatsContext.Provider>;
}; 