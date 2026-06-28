"use client";
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import NeuralNetwork from './NeuralNetwork';
import { VaultFile } from '@/lib/vault';
import { Activity } from 'lucide-react';

export default function NeuralNetworkView({ files }: { files: VaultFile[] }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#020205']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2fe" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4facfe" />
        <Suspense fallback={null}>
          <NeuralNetwork files={files} />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} maxDistance={30} minDistance={5} />
        
        {/* Postprocessing for mind-blowing bloom effect */}
        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={2.0} 
          />
        </EffectComposer>
      </Canvas>

      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, 
        padding: '24px', 
        pointerEvents: 'none',
        fontFamily: 'monospace',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #333',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#00f2fe' }}>3D Nexus</h1>
          <p style={{ margin: '0 0 16px 0', color: '#aaa', fontSize: '0.9rem' }}>Real-time Vault Neural Visualization</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem' }}>
            <Activity size={16} /> Active Network
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#888' }}>
            {files.length} Nodes Synchronized
          </div>
        </div>
      </div>
    </div>
  );
}
