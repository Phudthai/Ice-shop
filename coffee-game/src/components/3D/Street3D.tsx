import React from 'react';

const Street3D: React.FC = () => {
  // Matching Phaser: Row 10 to 12, Col -5 to 15
  const cols = Array.from({ length: 20 }, (_, i) => i - 5);
  const rows = Array.from({ length: 3 }, (_, i) => i + 10);

  return (
    <group>
      {rows.map((row) =>
        cols.map((col) => (
          <mesh 
            key={`${row}-${col}`} 
            position={[col, -0.01, row]} 
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[0.98, 0.98]} />
            <meshToonMaterial color="#555555" />
          </mesh>
        ))
      )}
      
      {/* Sidewalk edge */}
      <mesh position={[4.5, -0.05, 9.6]} receiveShadow>
        <boxGeometry args={[20, 0.1, 0.2]} />
        <meshToonMaterial color="#888888" />
      </mesh>
    </group>
  );
};

export default Street3D;
