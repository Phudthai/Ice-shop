import React from 'react';

const Decoration3D: React.FC<{ 
  position: [number, number, number], 
  rotation?: number, 
  onClick?: () => void, 
  interactive?: boolean,
  type?: string 
}> = ({ position, rotation = 0, onClick, interactive = true, type = 'dec_plant' }) => {
  
  return (
    <group position={position} rotation={[0, (rotation * Math.PI) / 180, 0]} onClick={interactive ? (e) => {
      e.stopPropagation();
      if (onClick) onClick();
    } : undefined}>
      {type === 'dec_plant' ? (
        <group>
          {/* Pot */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
            <meshToonMaterial color="#8b5a2b" />
          </mesh>
          {/* Stem */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
            <meshToonMaterial color="#4d2926" />
          </mesh>
          {/* Leaves (Stylized ball) */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshToonMaterial color="#2e7d32" />
          </mesh>
        </group>
      ) : (
        <group>
          {/* Lamp Base */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <meshToonMaterial color="#333333" />
          </mesh>
          {/* Lamp Pole */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
            <meshToonMaterial color="#333333" />
          </mesh>
          {/* Lamp Shade */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.3, 0.3, 16]} />
            <meshToonMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 1.1, 0]} intensity={0.5} color="#ffeb3b" distance={3} />
        </group>
      )}
    </group>
  );
};

export default Decoration3D;
