import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import NeuralNetwork from './NeuralNetwork';
import { Activity } from 'lucide-react';

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2fe" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4facfe" />
        <Suspense fallback={null}>
          <NeuralNetwork />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} maxDistance={30} minDistance={5} />
        
        {/* Postprocessing for mind-blowing bloom effect */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={2.0} 
          />
        </EffectComposer>
      </Canvas>

      <div className="ui-container">
        <div className="glass-panel" style={{ alignSelf: 'flex-start', maxWidth: '350px' }}>
          <h1>Neural Nexus</h1>
          <p>Real-time WebGL data flow visualization.</p>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={24} color="#00f2fe" /> Active
              </span>
              <span className="stat-label">Network Status</span>
            </div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ alignSelf: 'flex-end', textAlign: 'right', minWidth: '250px' }}>
          <h2>Architecture</h2>
          <div className="stats-row">
            <div className="stat" style={{ alignItems: 'flex-end' }}>
              <span className="stat-value">4</span>
              <span className="stat-label">Layers</span>
            </div>
            <div className="stat" style={{ alignItems: 'flex-end' }}>
              <span className="stat-value">24</span>
              <span className="stat-label">Nodes</span>
            </div>
            <div className="stat" style={{ alignItems: 'flex-end' }}>
              <span className="stat-value">136</span>
              <span className="stat-label">Synapses</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
