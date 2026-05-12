import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Server, 
  Database, 
  MessageSquare, 
  Cpu, 
  Globe, 
  Shield, 
  Zap, 
  BookOpen, 
  Layers,
  Search,
  Bell,
  User,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Activity,
  HardDrive,
  Cloud
} from 'lucide-react';
import SystemDesignCanvas from './components/SystemDesignCanvas';
import './App.css';

const sections = [
  { id: 'fundamentals', icon: BookOpen, name: 'Fundamentals', description: 'Core principles of scalable systems' },
  { id: 'components', icon: Layers, name: 'Components', description: 'Visual building blocks for architecture' },
  { id: 'patterns', icon: Layout, name: 'Patterns', description: 'Common architectural solutions' },
  { id: 'casestudies', icon: Globe, name: 'Case Studies', description: 'Real-world system breakdowns' },
  { id: 'ai-architect', icon: Sparkles, name: 'AI Architect', description: 'AI-powered design assistant' },
];

const patternsData = [
  { 
    title: 'Database Sharding', 
    icon: Database, 
    content: 'Splitting a large dataset into smaller, manageable pieces across multiple servers.',
    details: ['Horizontal Partitioning', 'Consistent Hashing', 'Hotspot Management']
  },
  { 
    title: 'Microservices Mesh', 
    icon: Layout, 
    content: 'Managing service-to-service communication with a dedicated infrastructure layer.',
    details: ['Service Discovery', 'Load Balancing', 'Circuit Breaking']
  },
  { 
    title: 'Event Sourcing', 
    icon: MessageSquare, 
    content: 'Capturing all changes to an application state as a sequence of events.',
    details: ['Event Store', 'Snapshots', 'CQRS Integration']
  },
  { 
    title: 'Leader Election', 
    icon: Shield, 
    content: 'Designating one node as the master to coordinate distributed actions.',
    details: ['Bully Algorithm', 'Raft Consensus', 'Zookeeper Implementation']
  }
];

const componentsData = [
  { name: 'Load Balancer', icon: Zap, color: '#6366f1', desc: 'Distributes incoming traffic across multiple servers.' },
  { name: 'API Gateway', icon: Shield, color: '#a855f7', desc: 'Entry point for all clients, handles auth and routing.' },
  { name: 'Microservices', icon: Server, color: '#10b981', desc: 'Small, independent services communicating via APIs.' },
  { name: 'SQL Database', icon: Database, color: '#f59e0b', desc: 'Relational storage for structured data and ACID compliance.' },
  { name: 'NoSQL Store', icon: HardDrive, color: '#ec4899', desc: 'Flexible storage for high-volume unstructured data.' },
  { name: 'Message Queue', icon: MessageSquare, color: '#3b82f6', desc: 'Asynchronous communication between services.' },
  { name: 'CDN', icon: Cloud, color: '#06b6d4', desc: 'Global network for serving static assets with low latency.' },
  { name: 'Cache (Redis)', icon: Activity, color: '#ef4444', desc: 'In-memory data store for fast read operations.' },
];

const caseStudies = [
  {
    title: 'YouTube Architecture',
    company: 'Google',
    tags: ['Video Streaming', 'Scalability'],
    architecture: {
      nodes: [
        { id: '1', type: 'client', label: 'Users', position: '1 / 2', description: 'Web/Mobile Clients' },
        { id: '2', type: 'lb', label: 'Load Balancer', position: '2 / 2', description: 'Geo-distributed LB' },
        { id: '3', type: 'server', label: 'Video Service', position: '3 / 1', description: 'Encoding & Streaming' },
        { id: '4', type: 'server', label: 'Metadata Service', position: '3 / 3', description: 'User info & Comments' },
        { id: '5', type: 'db', label: 'Vitess (MySQL)', position: '4 / 2', description: 'Sharded SQL DB' }
      ]
    }
  },
  {
    title: 'Uber Real-time Dispatch',
    company: 'Uber',
    tags: ['Geo-location', 'Concurrency'],
    architecture: {
      nodes: [
        { id: '1', type: 'client', label: 'Riders/Drivers', position: '1 / 2', description: 'Mobile Apps' },
        { id: '2', type: 'lb', label: 'API Gateway', position: '2 / 2', description: 'Rate limiting & Auth' },
        { id: '3', type: 'server', label: 'Dispatch Service', position: '3 / 2', description: 'Matching Logic' },
        { id: '4', type: 'db', label: 'Schemaless', position: '4 / 2', description: 'NoSQL for Trips' }
      ]
    }
  }
];

function App() {
  const [activeSection, setActiveSection] = useState('fundamentals');
  const [selectedCase, setSelectedCase] = useState(caseStudies[0]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);

  const handleAiDesign = () => {
    setIsDesigning(true);
    setTimeout(() => {
      setIsDesigning(false);
      setActiveSection('casestudies'); // Show the result as a "case study"
    }, 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'fundamentals':
        return (
          <div className="content-grid">
            {[
              { title: 'Latency vs Throughput', icon: Activity, content: 'Understanding the trade-off between speed and volume.' },
              { title: 'Consistency Models', icon: Shield, content: 'Strong, Eventual, and Causal consistency explained.' },
              { title: 'DNS Resolution', icon: Globe, content: 'How the internet finds your IP address.' },
              { title: 'Protocols (HTTP, gRPC, WebSocket)', icon: Zap, content: 'Choosing the right communication layer.' },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card glass-panel"
              >
                <div className="card-icon">
                  <item.icon size={24} color="#6366f1" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <button className="text-button">Learn More <ChevronRight size={16} /></button>
              </motion.div>
            ))}
          </div>
        );
      case 'components':
        return (
          <div className="content-grid">
            {componentsData.map((comp, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.02 }}
                className="card glass-panel component-card"
              >
                <div className="card-icon" style={{ backgroundColor: `${comp.color}20` }}>
                  <comp.icon size={24} color={comp.color} />
                </div>
                <h3>{comp.name}</h3>
                <p>{comp.desc}</p>
              </motion.div>
            ))}
          </div>
        );
      case 'patterns':
        return (
          <div className="content-grid">
            {patternsData.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card glass-panel pattern-card"
              >
                <div className="card-icon">
                  <item.icon size={24} color="#a855f7" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <div className="pattern-details">
                  {item.details.map(d => <span key={d} className="detail-chip">{d}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'casestudies':
        return (
          <div className="casestudy-view">
            <div className="casestudy-sidebar">
              {caseStudies.map((study, index) => (
                <button 
                  key={index} 
                  className={`study-item ${selectedCase.title === study.title ? 'active' : ''}`}
                  onClick={() => setSelectedCase(study)}
                >
                  <h4>{study.title}</h4>
                  <span>{study.company}</span>
                </button>
              ))}
            </div>
            <div className="casestudy-content glass-panel">
              <div className="study-header">
                <h2>{selectedCase.title}</h2>
                <div className="tags">
                  {selectedCase.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
              <SystemDesignCanvas architecture={selectedCase.architecture} />
              <div className="study-details">
                <h3>Key Challenges</h3>
                <ul>
                  <li>Handling massive write traffic.</li>
                  <li>Low-latency retrieval of high-volume data.</li>
                  <li>Ensuring zero data loss during partitions.</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'ai-architect':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ai-container glass-panel"
          >
            <div className="ai-header">
              <Sparkles size={48} color="#a855f7" className="pulse" />
              <h2>System Architect AI</h2>
              <p>Harnessing machine learning to synthesize production-grade architectures.</p>
            </div>
            <div className="ai-chat-area">
              <div className="message bot">
                {isDesigning ? "Analyzing requirements and simulating traffic patterns..." : "I'm ready. Tell me about the system you want to build. (e.g., 'E-commerce platform with search and checkout')"}
              </div>
              {isDesigning && (
                <div className="design-loader">
                  <div className="progress-bar"><div className="progress"></div></div>
                </div>
              )}
            </div>
            {!isDesigning && (
              <div className="ai-input-area">
                <input 
                  type="text" 
                  placeholder="Describe your system requirements..." 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button className="primary-button" onClick={handleAiDesign}>
                  Generate Architecture <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="logo">
          <Layers size={32} color="#6366f1" />
          <span>SysDesign<span style={{color: 'var(--accent-secondary)'}}>.AI</span></span>
        </div>
        <nav>
          {sections.map((section) => (
            <button 
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={20} />
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="pro-badge">MASTER PLAN</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <div className="search-bar glass-panel">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search concepts, components, patterns..." />
          </div>
          <div className="nav-actions">
            <button className="icon-button"><Bell size={20} /></button>
            <button className="icon-button user-profile"><User size={20} /></button>
          </div>
        </header>

        <section className="view-container">
          <header className="view-header">
            <motion.h1
              key={`h1-${activeSection}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {sections.find(s => s.id === activeSection)?.name}
            </motion.h1>
            <motion.p
              key={`p-${activeSection}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {sections.find(s => s.id === activeSection)?.description}
            </motion.p>
          </header>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default App;
