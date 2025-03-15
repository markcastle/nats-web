import { NatsProvider } from './contexts/NatsContext'
import ConnectionForm from './components/ConnectionForm'
import PublishMessage from './components/PublishMessage'
import SubscribeToTopic from './components/SubscribeToTopic'
import CreateTopic from './components/CreateTopic'
import './App.css'

function App() {
  return (
    <NatsProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-indigo-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">NATS Web Client</h1>
            <p className="mt-2 text-indigo-100">Connect, publish, and subscribe to NATS topics</p>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ConnectionForm />
              <CreateTopic />
            </div>
            <div>
              <PublishMessage />
              <SubscribeToTopic />
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} NATS Web Client</p>
          </div>
        </footer>
      </div>
    </NatsProvider>
  )
}

export default App
