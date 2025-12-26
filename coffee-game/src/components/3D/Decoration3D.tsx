import React from 'react';

const Decoration3D: React.FC<{ 
  position: [number, number, number], 
  rotation?: number, 
  onClick?: () => void, 
  interactive?: boolean,
  type?: string 
}> = ({ position, rotation = 0, onClick, interactive = true, type = 'dec_plant_small' }) => {
  
  return (
    <group position={position} rotation={[0, (rotation * Math.PI) / 180, 0]} onClick={interactive ? (e) => {
      e.stopPropagation();
      if (onClick) onClick();
    } : undefined}>
      
      {/* Small Plant */}
      {type === 'dec_plant_small' && (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.2, 8]} />
            <meshToonMaterial color="#8b5a2b" />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshToonMaterial color="#2e7d32" />
          </mesh>
        </group>
      )}

      {/* Large Plant */}
      {type === 'dec_plant_large' && (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.2, 0.4, 8]} />
            <meshToonMaterial color="#5d4037" />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <coneGeometry args={[0.4, 1.2, 8]} />
            <meshToonMaterial color="#1b5e20" />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshToonMaterial color="#2e7b32" />
          </mesh>
        </group>
      )}

      {/* Floor Lamp */}
      {type === 'dec_lamp_floor' && (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <meshToonMaterial color="#333333" />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
            <meshToonMaterial color="#333333" />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 0.4, 16]} />
            <meshToonMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 1.4, 0]} intensity={0.8} color="#ffeb3b" distance={5} />
        </group>
      )}

      {/* Table Lamp */}
      {type === 'dec_lamp_table' && (
        <group scale={[0.6, 0.6, 0.6]} position={[0, 0.7, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 0.1, 16]} />
            <meshToonMaterial color="#222222" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
            <meshToonMaterial color="#f39c12" />
          </mesh>
          <pointLight position={[0, 0.4, 0]} intensity={0.4} color="#f1c40f" distance={2} />
        </group>
      )}

      {/* Rugs */}
      {type?.startsWith('dec_rug') && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[1.8, 1.2]} />
          <meshToonMaterial color={type === 'dec_rug_red' ? '#c0392b' : '#2980b9'} />
        </mesh>
      )}

      {/* Modern Clock */}
      {type === 'dec_clock' && (
        <group position={[0, 1.5, -0.45]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
            <meshToonMaterial color="white" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
             <boxGeometry args={[0.02, 0.15, 0.01]} />
             <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[0.05, 0, 0.06]} rotation={[0, 0, -Math.PI/3]}>
             <boxGeometry args={[0.02, 0.1, 0.01]} />
             <meshBasicMaterial color="black" />
          </mesh>
        </group>
      )}

      {/* Neon Sign */}
      {type === 'dec_neon_sign' && (
        <group position={[0, 1.6, -0.48]}>
          <mesh>
            <boxGeometry args={[0.8, 0.4, 0.05]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <torusGeometry args={[0.12, 0.02, 8, 24]} />
            <meshBasicMaterial color="#ff00ff" />
          </mesh>
          <pointLight position={[0, 0, 0.1]} intensity={1.5} color="#ff00ff" distance={3} />
        </group>
      )}

      {/* Wooden Shelf */}
      {type === 'dec_shelf_wood' && (
        <group position={[0, 1.2, -0.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.05, 0.3]} />
            <meshToonMaterial color="#5d4037" />
          </mesh>
          {/* Some tiny books/items on shelf */}
          <mesh position={[-0.2, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.15, 0.15]} />
            <meshToonMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.15, 0.15]} />
            <meshToonMaterial color="#3498db" />
          </mesh>
          <mesh position={[0.2, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.15, 0.15]} />
            <meshToonMaterial color="#f1c40f" />
          </mesh>
        </group>
      )}

      {/* Speaker */}
      {type === 'dec_speaker' && (
        <group position={[0, 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.5, 0.3]} />
            <meshToonMaterial color="#222222" />
          </mesh>
          <mesh position={[0, 0.1, 0.16]}>
            <circleGeometry args={[0.1, 16]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
          <mesh position={[0, -0.15, 0.16]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
        </group>
      )}

    </group>
  );
};

export default Decoration3D;
