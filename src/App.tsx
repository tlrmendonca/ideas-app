import React from 'react';
import './App.css';
import Canvas from './components/Canvas';
import sampleData from './data/sampleData.json';

function App() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false);
  const [debugMode, setDebugMode] = React.useState(false);

  return (
    <div className="App">
      <div className={`sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-content">
          {/* Empty for now */}
        </div>
      </div>
      
      <div className="hamburger-menu" onClick={() => setSidebarExpanded(!sidebarExpanded)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="debug-toggle" onClick={() => setDebugMode(!debugMode)}>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <defs>
            <pattern id="grid-icon" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="black" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="20" height="20" fill="url(#grid-icon)" />
        </svg>
      </div>

      <main className="App-main">
        <Canvas data={sampleData} debugMode={debugMode} />
      </main>
    </div>
  );
}

export default App;
