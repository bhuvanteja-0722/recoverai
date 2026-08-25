import { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import DetectSection from './components/DetectSection';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <div className="min-h-screen bg-[#050508] text-[#e8e8f0] bg-grid relative selection:bg-[#00D4FF]/20 selection:text-[#00D4FF]">
      <Navigation currentView={view} onViewChange={setView} />
      {view === 'landing' ? (
        <main>
          <Hero onEnter={() => setView('dashboard')} />
          <DetectSection />
        </main>
      ) : (
        <main className="pt-16">
          <Dashboard />
        </main>
      )}
    </div>
  );
}
