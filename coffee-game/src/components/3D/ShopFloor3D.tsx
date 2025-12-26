import React from 'react';

interface ShopFloorProps {
  onClick?: (e: any) => void;
  onPointerMove?: (e: any) => void;
}

const ShopFloor3D: React.FC<ShopFloorProps> = ({ onClick, onPointerMove }) => {
  const gridSize = 10;

  return (
    <group>
      {/* Main Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[gridSize / 2 - 0.5, 0, gridSize / 2 - 0.5]} receiveShadow onClick={onClick} onPointerMove={onPointerMove}>
        <planeGeometry args={[gridSize, gridSize]} />
        <meshToonMaterial color="#8b4513" />
      </mesh>

      {/* Grid Lines (Optional for style) */}
      <gridHelper 
        args={[gridSize, gridSize, 0xffffff, 0x000000]} 
        position={[gridSize / 2 - 0.5, 0.01, gridSize / 2 - 0.5]} 
      />

      {/* Individual Tiles for future texture swapping */}
      {Array.from({ length: gridSize }).map((_, row) =>
        Array.from({ length: gridSize }).map((_, col) => (
          <mesh 
            key={`${row}-${col}`} 
            position={[col, 0.005, row]} 
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[0.95, 0.95]} />
            <meshToonMaterial color="#a0522d" />
          </mesh>
        ))
      )}
    </group>
  );
};

export default ShopFloor3D;
