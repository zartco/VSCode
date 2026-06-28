"use client";
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { VaultFile } from '@/lib/vault';

interface NeuralNetworkProps {
  files: VaultFile[];
}

export default function NeuralNetwork({ files }: NeuralNetworkProps) {
  // Group files by folder
  const layers = useMemo(() => {
    const folders = Array.from(new Set(files.map(f => f.folder))).sort();
    return folders.map((folder, i) => {
      return {
        name: folder,
        index: i,
        files: files.filter(f => f.folder === folder)
      };
    });
  }, [files]);

  const nodes = useMemo(() => {
    const arr: any[] = [];
    const totalLayers = layers.length;
    
    layers.forEach((layer, layerIndex) => {
      const x = (layerIndex - totalLayers / 2) * 4;
      
      layer.files.forEach((file, i) => {
        const yOffset = (i - layer.files.length / 2) * 1.5 + 0.75;
        const zOffset = (Math.random() - 0.5) * 4;
        
        // Gradient colors from cyan to purple
        const color = new THREE.Color();
        color.lerpColors(
          new THREE.Color('#00f2fe'), 
          new THREE.Color('#b026ff'), 
          totalLayers > 1 ? layerIndex / (totalLayers - 1) : 0.5
        );

        arr.push({
          position: new THREE.Vector3(x, yOffset, zOffset),
          layerIndex,
          color,
          file
        });
      });
    });
    return arr;
  }, [layers]);

  const connections = useMemo(() => {
    const lines: THREE.Vector3[][] = [];

    // ⚡ Bolt: Pre-group nodes by layerIndex to avoid O(n²) filtering inside the loop
    const nodesByLayer: Record<number, typeof nodes> = {};
    nodes.forEach(node => {
      if (!nodesByLayer[node.layerIndex]) {
        nodesByLayer[node.layerIndex] = [];
      }
      nodesByLayer[node.layerIndex].push(node);
    });

    nodes.forEach((node) => {
      // Connect to the next layer sequentially to keep the flowing look
      if (node.layerIndex < layers.length - 1) {
        // Look up next layer nodes in O(1) instead of O(N) filtering
        const nextLayerNodes = nodesByLayer[node.layerIndex + 1] || [];
        
        // Find nodes with shared tags
        let connected = false;
        if (node.file.tags && node.file.tags.length > 0) {
          nextLayerNodes.forEach((nextNode) => {
            const hasSharedTag = node.file.tags.some((tag: string) => nextNode.file.tags?.includes(tag));
            if (hasSharedTag) {
              lines.push([node.position, nextNode.position]);
              connected = true;
            }
          });
        }
        
        // If no shared tags, connect to a random node in next layer to ensure flow
        if (!connected && nextLayerNodes.length > 0) {
           const randomNext = nextLayerNodes[Math.floor(Math.random() * nextLayerNodes.length)];
           lines.push([node.position, randomNext.position]);
        }
      }
    });
    return lines;
  }, [nodes, layers]);

  // Ref to group for slight breathing animation
  const groupRef = useRef<THREE.Group>(null);

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
          points={pts.map(p => [p.x, p.y, p.z]) as [number, number, number][]}
          color="#ffffff"
          opacity={0.08}
          transparent
          lineWidth={1}
        />
      ))}

      {/* Render nodes */}
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node.position}>
          <sphereGeometry args={[0.25, 32, 32]} />
          {/* Glowing emissive material */}
          <meshStandardMaterial 
            color={node.color}
            emissive={node.color}
            emissiveIntensity={2}
            transparent
            opacity={0.9}
            roughness={0.2}
            metalness={0.8}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Dynamic Data Particles flowing through connections */}
      {connections.length > 0 && <DataParticles connections={connections} />}
      
      {/* Floating background ambient particles */}
      <BackgroundParticles />
    </group>
  );
}

function DataParticles({ connections }: { connections: THREE.Vector3[][] }) {
  const count = Math.min(connections.length * 2, 60);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      return {
        start: conn[0],
        end: conn[1],
        progress: Math.random(), // Random start progress
        speed: 0.002 + Math.random() * 0.004
      };
    });
  }, [connections, count]);

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
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
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

  const pointsRef = useRef<THREE.Points>(null);

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
