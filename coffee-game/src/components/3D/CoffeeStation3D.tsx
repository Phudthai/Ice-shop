import React from 'react';
import { Html } from '@react-three/drei';

interface CoffeeStationProps {
  position: [number, number, number];
  onClick?: () => void;
  state?: string;
  progress?: number;
  rotation?: number;
}

const CoffeeStation3D: React.FC<CoffeeStationProps & { interactive?: boolean }> = ({ 
  position, 
  onClick, 
  state = 'idle', 
  progress = 0, 
  rotation = 0,
  interactive = true
}) => {
  return (
    <group position={position} rotation={[0, (rotation * Math.PI) / 180, 0]} onClick={interactive ? (e) => {
      e.stopPropagation();
      if (onClick) onClick();
    } : undefined}>
      {/* UI Overlays */}
      <Html position={[0, 1.5, 0]} center distanceFactor={10}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          {state && (
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 8px',
              borderRadius: '5px',
              fontSize: '10px',
              color: 'white',
              whiteSpace: 'nowrap'
            }}>
              {state}
            </div>
          )}
          {progress > 0 && (
            <div style={{
              width: '40px',
              height: '4px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '2px',
              overflow: 'hidden',
              border: '1px solid white'
            }}>
              <div style={{
                width: `${progress * 100}%`,
                height: '100%',
                background: '#4CAF50'
              }} />
            </div>
          )}
        </div>
      </Html>

      {/* Counter */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 0.8]} />
        <meshToonMaterial color="#d2b48c" />
      </mesh>
      
      {/* Coffee Machine */}
      <group position={[0, 0.9, 0]}>
        {/* Main Body */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.6, 0.5, 0.5]} />
          <meshToonMaterial color="#444444" />
        </mesh>
        {/* Top Part */}
        <mesh position={[0, 0.55, -0.1]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.3]} />
          <meshToonMaterial color="#666666" />
        </mesh>
        {/* Drip Tray */}
        <mesh position={[0, 0.05, 0.15]}>
          <boxGeometry args={[0.4, 0.05, 0.2]} />
          <meshToonMaterial color="#222222" />
        </mesh>
        {/* Portafilter (Handle) */}
        <mesh position={[0.2, 0.3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshToonMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
};

export default CoffeeStation3D;
