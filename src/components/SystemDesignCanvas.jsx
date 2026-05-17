import React from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Globe, Shield, MessageSquare, Zap } from 'lucide-react';

const ComponentIcon = ({ type }) => {
  switch (type) {
    case 'client': return <Globe size={24} />;
    case 'lb': return <Zap size={24} />;
    case 'server': return <Server size={24} />;
    case 'db': return <Database size={24} />;
    case 'cache': return <Zap size={24} />;
    case 'queue': return <MessageSquare size={24} />;
    case 'auth': return <Shield size={24} />;
    default: return <Server size={24} />;
  }
};

const SystemDesignCanvas = ({ architecture, onNodeClick }) => {
  if (!architecture) return null;

  return (
    <div className="canvas-container">
      <div className="canvas-grid">
        {architecture.nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`canvas-node ${node.type}`}
            onClick={() => onNodeClick && onNodeClick(node)}
            style={{ 
              gridArea: node.position,
              borderColor: node.color || 'var(--accent-primary)'
            }}
          >
            <div className="node-header">
              <ComponentIcon type={node.type} />
              <span>{node.label}</span>
            </div>
            <div className="node-body">
              <small>{node.description}</small>
            </div>
          </motion.div>
        ))}
        
        {/* SVG for connections would go here, but for simplicity we use CSS Grid flow */}
      </div>
      
      <style jsx>{`
        .canvas-container {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          padding: 40px;
          border: 1px dashed var(--glass-border);
          min-height: 400px;
          margin-top: 24px;
        }
        .canvas-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 100px);
          gap: 40px;
          position: relative;
        }
        .canvas-node {
          background: var(--bg-tertiary);
          border: 2px solid;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 2;
          box-shadow: var(--shadow-lg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .canvas-node:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 0 15px var(--accent-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .node-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .node-body {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }
        .client { grid-area: 1 / 2; color: #3b82f6; }
        .lb { grid-area: 2 / 2; color: #6366f1; }
        .server { grid-area: 3 / 2; color: #10b981; }
        .db { grid-area: 4 / 2; color: #f59e0b; }
      `}</style>
    </div>
  );
};

export default SystemDesignCanvas;
