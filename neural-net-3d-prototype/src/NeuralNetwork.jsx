import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';

const LAYERS = [
  { size: 5, x: -6 },
  { size: 8, x: -2 },
  { size: 8, x: 2 },
  { size: 3, x: 6 }
];

export default function NeuralNetwork() {
  const nodes = useMemo(() => {
    const arr = [];
    LAYERS.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.size; i++) {
        const yOffset = (i - layer.size / 2) * 1.5 + 0.75;
        const zOffset = (Math.random() - 0.5) * 4;
        
        // Gradient colors from cyan to purple
        const color = new THREE.Color();
        color.lerpColors(
          new THREE.Color('#00f2fe'), 
          new THREE.Color('#b026ff'), 
          layerIndex / (LAYERS.length - 1)
        );

        arr.push({
          position: new THREE.Vector3(layer.x, yOffset, zOffset),
          layerIndex,
          color
        });
      }
    });
    return arr;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    nodes.forEach((node) => {
      if (node.layerIndex < LAYERS.length - 1) {
        nodes.forEach((nextNode) => {
          if (nextNode.layerIndex === node.layerIndex + 1) {
            lines.push([node.position, nextNode.position]);
          }
        });
      }
    });
    return lines;
  }, [nodes]);

  // Ref to group for slight breathing animation
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render connections */}
      {connections.map((pts, i) => (
        <Line 
          key={`line-${i}`} 
          points={pts.map(p => [p.x, p.y, p.z])}
          color="#ffffff"
          opacity={0.08}
          transparent
          lineWidth={1}
        />
      ))}

      {/* Render nodes */}
      {nodes.map((node, i) => (
        <Node key={`node-${i}`} node={node} index={i} />
      ))}

      {/* Dynamic Data Particles flowing through connections */}
      <DataParticles connections={connections} />
      
      {/* Floating background ambient particles */}
      <BackgroundParticles />
    </group>
  );
}

function DataParticles({ connections }) {
  const count = 60;
  const meshRef = useRef();

  const particles = useMemo(() => {
    return new Array(count).fill().map(() => {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      return {
        start: conn[0],
        end: conn[1],
        progress: Math.random(), // Random start progress
        speed: 0.002 + Math.random() * 0.004
      };
    });
  }, [connections]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    
    particles.forEach((p, i) => {
      p.progress += p.speed;
      if (p.progress >= 1) {
        p.progress = 0;
        const conn = connections[Math.floor(Math.random() * connections.length)];
        p.start = conn[0];
        p.end = conn[1];
      }

      dummy.position.copy(p.start).lerp(p.end, p.progress);
      
      // Scale based on progress (fade in and out)
      const scale = Math.sin(p.progress * Math.PI) * 0.8;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </instancedMesh>
  );
}

function BackgroundParticles() {
  const count = 1500;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create a sphere of particles around the network
      const r = 10 + Math.random() * 20;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const pointsRef = useRef();

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#4facfe" 
        transparent 
        opacity={0.4} 
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Node({ node, index }) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Generate some dummy stats
  const stats = useMemo(() => ({
    activation: (Math.random() * 0.9 + 0.1).toFixed(3),
    bias: (Math.random() * 2 - 1).toFixed(3),
    layer: node.layerIndex
  }), [node]);

  return (
    <mesh 
      position={node.position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); setActive(!active); }}
      scale={hovered ? 1.3 : (active ? 1.5 : 1)}
    >
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial 
        color={active ? '#ffffff' : node.color}
        emissive={active ? '#ffffff' : node.color}
        emissiveIntensity={hovered ? 4 : (active ? 6 : 2)}
        transparent
        opacity={0.9}
        roughness={0.2}
        metalness={0.8}
        toneMapped={false}
      />
      
      {hovered && (
        <Html center>
          <div className="node-tooltip">
            <div className="tooltip-header">Node {index}</div>
            <div className="tooltip-stat"><span>Layer</span> <span>{stats.layer}</span></div>
            <div className="tooltip-stat"><span>Activation</span> <span>{stats.activation}</span></div>
            <div className="tooltip-stat"><span>Bias</span> <span>{stats.bias}</span></div>
          </div>
        </Html>
      )}
    </mesh>
  );
}
