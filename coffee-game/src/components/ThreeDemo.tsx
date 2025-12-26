import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Stars, Sky, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

function StylizedTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 6]} />
        <meshToonMaterial color="#4d2926" />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.8, 7, 7]} />
        <meshToonMaterial color="#2d5a27" />
      </mesh>
      <mesh position={[0.4, 1.2, 0.3]}>
        <sphereGeometry args={[0.5, 7, 7]} />
        <meshToonMaterial color="#3a7a32" />
      </mesh>
    </group>
  );
}

function FloatingIsland() {
  return (
    <group>
      {/* Main Island Body */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[4, 3, 1, 8]} />
        <meshToonMaterial color="#5a8a4a" />
      </mesh>
      {/* Rocks underneath */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[3, 2, 8]} />
        <meshToonMaterial color="#4a4a4a" />
      </mesh>
      
      {/* Decorations */}
      <StylizedTree position={[-1.5, 0, -1]} />
      <StylizedTree position={[1, 0, 1.5]} />
      
      {/* Floating Coffee Cup */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <group position={[0, 1.5, 0]}>
          {/* Cup Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.3, 0.6, 12]} />
            <meshToonMaterial color="#ffffff" />
          </mesh>
          {/* Handle */}
          <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.15, 0.05, 8, 16]} />
            <meshToonMaterial color="#ffffff" />
          </mesh>
          {/* Coffee Surface */}
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.05, 12]} />
            <meshToonMaterial color="#4d2926" />
          </mesh>
          {/* Steam (Glowing particles) */}
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

const ThreeDemo: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #87ceeb, #e0f6ff)' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={45} />
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} enableDamping />
        
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffccaa" />

        {/* Environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Scene */}
        <FloatingIsland />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />

        {/* Post Processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'sans-serif',
        pointerEvents: 'none',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        <h1>3D Stylized Demo</h1>
        <p>Three.js + React Three Fiber</p>
        <p style={{ fontSize: '14px', opacity: 0.8 }}>Low-poly, Toon Shading, Bloom Effects</p>
      </div>
    </div>
  );
};

export default ThreeDemo;
