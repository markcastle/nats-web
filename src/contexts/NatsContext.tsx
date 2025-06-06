import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NatsConnection, Subscription, StringCodec } from 'nats';
import { createBrowserNatsConnection } from '../utils/natsUtils';

// Define authentication options type
export interface NatsAuthOptions {
  token?: string;
  username?: string;
  password?: string;
}

interface NatsContextType {
  connection: NatsConnection | null;
  isConnected: boolean;
  error: string | null;
  connectToNats: (serverUrl: string, authOptions?: NatsAuthOptions, timeout?: number) => Promise<void>;
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
  const [activeSubscriptions, setActiveSubscriptions] = useState<Map<string, Subscription>>(new Map());

  // Clean up connection on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.close().catch(console.error);
      }
    };
  }, [connection]);

  // Helper function to safely update subscriptions
  const updateSubscriptions = (updater: (map: Map<string, Subscription>) => void) => {
    setActiveSubscriptions(prevMap => {
      const newMap = new Map(prevMap);
      updater(newMap);
      return newMap;
    });
  };

  const connectToNats = async (serverUrl: string, authOptions: NatsAuthOptions = {}, timeout?: number) => {
    try {
      setError(null);
      
      // Use our browser-specific connection utility
      const nc = await createBrowserNatsConnection(serverUrl, authOptions, timeout);
      
      console.log('NATS connection established');
      setConnection(nc);
      setIsConnected(true);
      
      // Set up disconnect handler
      nc.closed().then(() => {
        console.log('NATS connection closed');
        setIsConnected(false);
        setConnection(null);
        // Clear subscriptions on disconnect
        setActiveSubscriptions(new Map());
      }).catch((err) => {
        console.error('NATS connection closed with error:', err);
        setError(`Connection closed with error: ${err.message}`);
        setIsConnected(false);
        setConnection(null);
        // Clear subscriptions on error
        setActiveSubscriptions(new Map());
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
        setActiveSubscriptions(new Map());
        
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
      
      // Store the subscription using our helper
      updateSubscriptions(map => map.set(topic, sub));
      
      // Process messages
      (async () => {
        try {
          for await (const msg of sub) {
            const data = sc.decode(msg.data);
            callback(data);
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          console.error(`Error processing messages for topic ${topic}:`, err);
          setError(`Subscription error for topic ${topic}: ${errorMessage}`);
          // Remove the subscription using our helper
          updateSubscriptions(map => map.delete(topic));
        }
      })();
      
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