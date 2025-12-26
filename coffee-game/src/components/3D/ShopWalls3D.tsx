import React from 'react';

export const ShopWalls3D: React.FC = () => {
  const gridSize = 10;
  const wallHeight = 4;

  return (
    <group>
      {/* Back Wall (Left side from camera) */}
      <mesh position={[-0.5, wallHeight / 2, gridSize / 2 - 0.5]} receiveShadow castShadow>
        <boxGeometry args={[0.1, wallHeight, gridSize]} />
        <meshToonMaterial color="#f5f5dc" />
      </mesh>

      {/* Side Wall (Right side from camera) */}
      <mesh position={[gridSize / 2 - 0.5, wallHeight / 2, -0.5]} receiveShadow castShadow>
        <boxGeometry args={[gridSize, wallHeight, 0.1]} />
        <meshToonMaterial color="#f5f5dc" />
      </mesh>
      
      {/* Wall Trim/Baseboard */}
      <mesh position={[-0.45, 0.1, gridSize / 2 - 0.5]}>
        <boxGeometry args={[0.05, 0.2, gridSize]} />
        <meshToonMaterial color="#8b4513" />
      </mesh>
      <mesh position={[gridSize / 2 - 0.5, 0.1, -0.45]}>
        <boxGeometry args={[gridSize, 0.2, 0.05]} />
        <meshToonMaterial color="#8b4513" />
      </mesh>
    </group>
  );
};

export default ShopWalls3D;
