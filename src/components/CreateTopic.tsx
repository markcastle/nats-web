import { useState } from 'react';
import { useNats } from '../contexts/NatsContext';

const CreateTopic = () => {
  const { createTopic, isConnected, error } = useNats();
  const [topic, setTopic] = useState('');
  const [createStatus, setCreateStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setCreateStatus({
        success: false,
        message: 'Topic name is required'
      });
      return;
    }
    
    try {
      await createTopic(topic);
      setCreateStatus({
        success: true,
        message: `Topic "${topic}" created successfully`
      });
      
      // Clear the topic field
      setTopic('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCreateStatus(null);
      }, 3000);
    } catch (err: any) {
      setCreateStatus({
        success: false,
        message: `Failed to create topic: ${err.message}`
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Topic</h2>
        <p className="text-gray-500">Connect to NATS to create topics</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Topic</h2>
      
      <form onSubmit={handleCreateTopic} className="space-y-4">
        <div>
          <label htmlFor="topicName" className="block text-sm font-medium text-gray-700 mb-1">
            Topic Name
          </label>
          <input
            id="topicName"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter new topic name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: In NATS, topics are created implicitly when publishing to them
          </p>
        </div>
        
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Create Topic
        </button>
        
        {createStatus && (
          <div className={`text-sm mt-2 ${createStatus.success ? 'text-green-500' : 'text-red-500'}`}>
            {createStatus.message}
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

export default CreateTopic; 