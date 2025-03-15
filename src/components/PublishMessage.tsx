import { useState } from 'react';
import { useNats } from '../contexts/NatsContext';

const PublishMessage = () => {
  const { publishMessage, isConnected, error } = useNats();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [publishStatus, setPublishStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim() || !message.trim()) {
      setPublishStatus({
        success: false,
        message: 'Topic and message are required'
      });
      return;
    }
    
    try {
      await publishMessage(topic, message);
      setPublishStatus({
        success: true,
        message: `Message published to topic "${topic}"`
      });
      
      // Clear the message field but keep the topic
      setMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPublishStatus(null);
      }, 3000);
    } catch (err: any) {
      setPublishStatus({
        success: false,
        message: `Failed to publish: ${err.message}`
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Publish Message</h2>
        <p className="text-gray-500">Connect to NATS to publish messages</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Publish Message</h2>
      
      <form onSubmit={handlePublish} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message content"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Publish Message
        </button>
        
        {publishStatus && (
          <div className={`text-sm mt-2 ${publishStatus.success ? 'text-green-500' : 'text-red-500'}`}>
            {publishStatus.message}
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-sm mt-2">
            Error: {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default PublishMessage; 