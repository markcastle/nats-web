import { useState, useEffect } from 'react';
import { useNats } from '../contexts/NatsContext';

interface Message {
  id: string;
  topic: string;
  content: string;
  timestamp: Date;
}

const SubscribeToTopic = () => {
  const { subscribeToTopic, isConnected, error, activeSubscriptions } = useNats();
  const [topic, setTopic] = useState('');
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscribeStatus, setSubscribeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Update subscriptions list when activeSubscriptions changes
  useEffect(() => {
    setSubscriptions(Array.from(activeSubscriptions.keys()));
  }, [activeSubscriptions]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setSubscribeStatus({
        success: false,
        message: 'Topic is required'
      });
      return;
    }
    
    // Check if already subscribed
    if (subscriptions.includes(topic)) {
      setSubscribeStatus({
        success: false,
        message: `Already subscribed to topic "${topic}"`
      });
      return;
    }
    
    try {
      await subscribeToTopic(topic, (messageContent) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          topic,
          content: messageContent,
          timestamp: new Date()
        };
        
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      });
      
      setSubscribeStatus({
        success: true,
        message: `Subscribed to topic "${topic}"`
      });
      
      // Clear the topic field
      setTopic('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubscribeStatus(null);
      }, 3000);
    } catch (err: any) {
      setSubscribeStatus({
        success: false,
        message: `Failed to subscribe: ${err.message}`
      });
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  if (!isConnected) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Subscribe to Topics</h2>
        <p className="text-gray-500">Connect to NATS to subscribe to topics</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Subscribe to Topics</h2>
      
      <form onSubmit={handleSubscribe} className="space-y-4 mb-6">
        <div>
          <label htmlFor="subscribeTopic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <div className="flex">
            <input
              id="subscribeTopic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-r-md transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
        
        {subscribeStatus && (
          <div className={`text-sm mt-2 ${subscribeStatus.success ? 'text-green-500' : 'text-red-500'}`}>
            {subscribeStatus.message}
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm mt-2">
            Error: {error}
          </div>
        )}
      </form>
      
      {/* Active Subscriptions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Active Subscriptions</h3>
        {subscriptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subscriptions.map((sub) => (
              <span 
                key={sub} 
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {sub}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active subscriptions</p>
        )}
      </div>
      
      {/* Messages */}
      <div>
        <h3 className="text-lg font-medium mb-2">Received Messages</h3>
        {messages.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {msg.topic}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No messages received</p>
        )}
      </div>
    </div>
  );
};

export default SubscribeToTopic; 