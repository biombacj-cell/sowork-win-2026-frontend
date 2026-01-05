
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PollingRadar from './pages/PollingRadar';
import PollingData from './pages/PollingData';
import WarRoom from './pages/WarRoom';
import ContentLab from './pages/ContentLab';
import DNALab from './pages/DNALab';
import AssetVault from './pages/AssetVault';
import Account from './pages/Account';
import Login from './pages/Login';
import TacticalTraining from './pages/TacticalTraining';
import { BrandDNA } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dna, setDna] = useState<BrandDNA>(dbService.getDNA());
  const [deploymentTopic, setDeploymentTopic] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => {
      setDna(dbService.getDNA());
    };
    window.addEventListener('dnaUpdated', handleUpdate);
    return () => window.removeEventListener('dnaUpdated', handleUpdate);
  }, []);

  const handleSetDna = (newDna: BrandDNA) => {
    const saved = dbService.saveDNA(newDna);
    setDna(saved);
  };

  const handleStartDeployment = (topic: string) => {
    setDeploymentTopic(topic);
    setActiveTab('content');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard dna={dna} onOpenVault={() => setActiveTab('vault')} setActiveTab={setActiveTab} onDeploy={handleStartDeployment} />;
      case 'polls':
        return <PollingData dna={dna} />;
      case 'training':
        return <TacticalTraining dna={dna} />;
      case 'polling':
        return <PollingRadar dna={dna} onDeploy={handleStartDeployment} setActiveTab={setActiveTab} />;
      case 'warroom':
        return <WarRoom dna={dna} />;
      case 'content':
        return <ContentLab dna={dna} prefilledTopic={deploymentTopic} />;
      case 'dna':
        return <DNALab dna={dna} setDna={handleSetDna} setActiveTab={setActiveTab} />;
      case 'vault':
        return <AssetVault />;
      case 'account':
        return <Account onLogout={handleLogout} />;
      default:
        return <Dashboard dna={dna} onOpenVault={() => setActiveTab('vault')} setActiveTab={setActiveTab} onDeploy={handleStartDeployment} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} dna={dna}>
      {renderContent()}
    </Layout>
  );
};

export default App;
