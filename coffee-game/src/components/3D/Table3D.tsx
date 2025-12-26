import React from 'react';

const Table3D: React.FC<{ 
  position: [number, number, number], 
  rotation?: number, 
  onClick?: () => void, 
  interactive?: boolean,
  type?: string 
}> = ({ position, rotation = 0, onClick, interactive = true, type = 'table_wood' }) => {
  
  // Decide colors based on type
  let topColor = "#ffffff";
  let legColor = "#444444";
  
  if (type === 'table_wood') topColor = "#8b5a2b";
  else if (type === 'table_marble') topColor = "#333333"; // Black marble
  else if (type === 'table_glass') topColor = "#aaddff"; // Light blue glass
  
  return (
    <group position={position} rotation={[0, (rotation * Math.PI) / 180, 0]} onClick={interactive ? (e) => {
      e.stopPropagation();
      if (onClick) onClick();
    } : undefined}>
      {/* Table Top */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshToonMaterial color={topColor} transparent={type === 'table_glass'} opacity={type === 'table_glass' ? 0.7 : 1} />
      </mesh>
      {/* Table Leg */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.1, 0.7, 8]} />
        <meshToonMaterial color={legColor} />
      </mesh>
      {/* Table Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshToonMaterial color={legColor} />
      </mesh>
    </group>
  );
};

export default Table3D;
