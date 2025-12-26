import React from 'react';

const Chair3D: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshToonMaterial color="#a0522d" />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.225]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.6, 0.05]} />
        <meshToonMaterial color="#a0522d" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, 0.225, -0.2]} castShadow>
        <boxGeometry args={[0.05, 0.45, 0.05]} />
        <meshToonMaterial color="#444444" />
      </mesh>
      <mesh position={[0.2, 0.225, -0.2]} castShadow>
        <boxGeometry args={[0.05, 0.45, 0.05]} />
        <meshToonMaterial color="#444444" />
      </mesh>
      <mesh position={[-0.2, 0.225, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.45, 0.05]} />
        <meshToonMaterial color="#444444" />
      </mesh>
      <mesh position={[0.2, 0.225, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.45, 0.05]} />
        <meshToonMaterial color="#444444" />
      </mesh>
    </group>
  );
};

export default Chair3D;
