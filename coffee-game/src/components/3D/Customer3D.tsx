import React, { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Customer3DProps {
  id: string;
  position: [number, number, number];
  color?: string;
  onClick?: () => void;
  order?: { name: string } | null;
  patience?: number;
  state?: string;
  seatIndex?: number;
}

const Customer3D: React.FC<Customer3DProps> = memo(({ 
  id,
  position, 
  onClick, 
  order, 
  patience = 100,
  state = 'walking',
  seatIndex = 0
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  
  const targetPos = useRef(new THREE.Vector3(...position));
  const velocity = useRef(0);

  // --- Randomized Style Logic (using ID as seed) ---
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (s: number) => {
    const x = Math.sin(seed + s) * 10000;
    return x - Math.floor(x);
  };

  const style = React.useMemo(() => {
    const hairTypes = ['spiky', 'flat', 'bowl', 'cap', 'headphones'];
    const skinTones = ['#ffe0bd', '#ffd1a4', '#e8beac', '#9f5d3d'];
    const shirtColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead', '#d4a5a5', '#9b59b6'];
    const pantColors = ['#2c3e50', '#34495e', '#7f8c8d', '#333333', '#1a1a1a'];
    
    return {
      hairType: hairTypes[Math.floor(random(1) * hairTypes.length)],
      skinTone: skinTones[Math.floor(random(2) * skinTones.length)],
      shirtColor: shirtColors[Math.floor(random(3) * shirtColors.length)],
      pantColor: pantColors[Math.floor(random(4) * pantColors.length)],
      hairColor: ['#4d2926', '#1a1a1a', '#d4a017', '#804000'][Math.floor(random(5) * 4)],
      hasGlasses: random(6) > 0.7,
      heightScale: 0.9 + random(7) * 0.2
    };
  }, [id]);

  // Subscribe to raw position updates (independent of React state)
  React.useEffect(() => {
    const handleMove = (e: any) => {
      if (e.detail.id === id) {
        targetPos.current.set(e.detail.x, 0, e.detail.y);
      }
    };
    window.addEventListener('customer-move', handleMove);
    return () => window.removeEventListener('customer-move', handleMove);
  }, [id]);

  // Update target position for high-level events (like sitting) via props
  const isSitting = state === 'sitting';
  React.useEffect(() => {
    if (isSitting) {
       targetPos.current.set(position[0] + (seatIndex === 0 ? -0.4 : 0.4), 0, position[2]);
    } else {
       targetPos.current.set(position[0], 0, position[2]);
    }
  }, [position, isSitting, seatIndex]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Smooth Movement (Lerp)
    const prevPos = groupRef.current.position.clone();
    groupRef.current.position.lerp(targetPos.current, 0.15);
    
    // Calculate velocity for animation intensity
    const distMoved = groupRef.current.position.distanceTo(prevPos);
    velocity.current = THREE.MathUtils.lerp(velocity.current, distMoved / delta, 0.1);

    // 2. Look Direction
    if (distMoved > 0.001 && !isSitting) {
      const direction = new THREE.Vector3().subVectors(targetPos.current, groupRef.current.position).normalize();
      const targetRotation = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.2);
    } else if (isSitting) {
      const targetRotation = seatIndex === 0 ? Math.PI / 2 : -Math.PI / 2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1);
    }

    // 3. Walking Animation (Legs/Arms swing)
    const time = state.clock.getElapsedTime();
    const walkSpeed = 10;
    const isMoving = velocity.current > 0.1;

    if (isMoving && !isSitting) {
      const swing = Math.sin(time * walkSpeed) * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -swing * 0.6;
        leftArmRef.current.rotation.z = -0.1 - Math.abs(swing) * 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = swing * 0.6;
        rightArmRef.current.rotation.z = 0.1 + Math.abs(swing) * 0.1;
      }
      
      if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.cos(time * walkSpeed)) * 0.05;
    } else {
      const resetSpeed = 0.1;
      const legRotation = isSitting ? -Math.PI / 2.5 : 0;
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, legRotation, resetSpeed);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, legRotation, resetSpeed);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, resetSpeed);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.1, resetSpeed);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, resetSpeed);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.1, resetSpeed);
      }
      if (bodyRef.current) bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, isSitting ? -0.25 : 0, resetSpeed);
    }
  });

  return (
    <group ref={groupRef} scale={[style.heightScale, style.heightScale, style.heightScale]} onClick={(e) => {
      e.stopPropagation();
      if (onClick) onClick();
    }}>
      {/* Fake Drop Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      {/* UI Overlays */}
      <Html position={[0, 1.8, 0]} center distanceFactor={10}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          {order && typeof order === 'object' && typeof order.name === 'string' && (
            <div style={{
              background: 'white',
              padding: '2px 8px',
              borderRadius: '10px',
              border: '2px solid #4d2926',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#4d2926',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {order.name}
            </div>
          )}
          {patience < 100 && (
            <div style={{
              width: '40px',
              height: '6px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid white'
            }}>
              <div style={{
                width: `${patience}%`,
                height: '100%',
                background: patience > 50 ? '#4CAF50' : patience > 20 ? '#FFC107' : '#F44336',
                transition: 'width 0.1s linear'
              }} />
            </div>
          )}
        </div>
      </Html>

      {/* Stylized Body Structure */}
      <group ref={bodyRef}>
        {/* Torso (Shirt) */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.3]} />
          <meshToonMaterial color={style.shirtColor} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
          <meshToonMaterial color={style.skinTone} />
        </mesh>

        {/* Big Stylized Head */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshToonMaterial color={style.skinTone} />
        </mesh>

        {/* Hair Styles */}
        <group position={[0, 1.25, 0]}>
          {style.hairType === 'spiky' && (
            <mesh position={[0, 0.15, 0]}>
              <coneGeometry args={[0.28, 0.3, 8]} />
              <meshToonMaterial color={style.hairColor} />
            </mesh>
          )}
          {style.hairType === 'flat' && (
            <mesh position={[0, 0.12, 0]}>
              <sphereGeometry args={[0.27, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
              <meshToonMaterial color={style.hairColor} />
            </mesh>
          )}
          {style.hairType === 'cap' && (
            <group position={[0, 0.18, 0]}>
               <mesh>
                 <sphereGeometry args={[0.27, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                 <meshToonMaterial color="#e74c3c" />
               </mesh>
               <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 10, 0, 0]}>
                 <boxGeometry args={[0.3, 0.05, 0.25]} />
                 <meshToonMaterial color="#e74c3c" />
               </mesh>
            </group>
          )}
          {style.hairType === 'headphones' && (
            <group>
               <mesh>
                 <torusGeometry args={[0.28, 0.03, 8, 24, Math.PI]} />
                 <meshToonMaterial color="#333333" />
               </mesh>
               <mesh position={[0.27, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
                 <meshToonMaterial color="#f1c40f" />
               </mesh>
               <mesh position={[-0.27, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
                 <meshToonMaterial color="#f1c40f" />
               </mesh>
            </group>
          )}
        </group>

        {/* Glasses */}
        {style.hasGlasses && (
          <group position={[0, 1.28, 0.22]}>
             <mesh position={[0.1, 0, 0]}>
               <ringGeometry args={[0.05, 0.07, 16]} />
               <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
             </mesh>
             <mesh position={[-0.1, 0, 0]}>
               <ringGeometry args={[0.05, 0.07, 16]} />
               <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
             </mesh>
             <mesh position={[0, 0, 0]}>
               <boxGeometry args={[0.1, 0.02, 0.01]} />
               <meshBasicMaterial color="#333333" />
             </mesh>
          </group>
        )}

        {/* Eyes (Simplified dots for cartoon style) */}
        <mesh position={[0.1, 1.25, 0.25]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[-0.1, 1.25, 0.25]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Arms (Skin + Sleeves) */}
        <mesh ref={leftArmRef} position={[-0.3, 0.95, 0]} castShadow rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshToonMaterial color={style.skinTone} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.3, 0.95, 0]} castShadow rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshToonMaterial color={style.skinTone} />
        </mesh>
      </group>

      {/* Legs (Pants) */}
      <mesh ref={leftLegRef} position={[-0.14, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.45, 4, 8]} />
        <meshToonMaterial color={style.pantColor} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.14, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.45, 4, 8]} />
        <meshToonMaterial color={style.pantColor} />
      </mesh>

      {/* Shoes (Small detail) */}
      <mesh position={[-0.14, 0.05, 0.05]}>
        <boxGeometry args={[0.12, 0.1, 0.2]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.14, 0.05, 0.05]}>
        <boxGeometry args={[0.12, 0.1, 0.2]} />
        <meshToonMaterial color="#ffffff" />
      </mesh>
    </group>
  );
});

export default Customer3D;
