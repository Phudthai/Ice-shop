import React, { Suspense, useState, memo, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, ContactShadows, Html } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import { gameStore, GameStoreActions } from '../game/GameStore';
import ShopFloor3D from './3D/ShopFloor3D';
import { ShopWalls3D } from './3D/ShopWalls3D.tsx';
import Table3D from './3D/Table3D';
import Customer3D from './3D/Customer3D';
import CoffeeStation3D from './3D/CoffeeStation3D';
import BuildMenu3D from './3D/BuildMenu3D';
import Street3D from './3D/Street3D';
import Decoration3D from './3D/Decoration3D';

const btnStyle = {
  padding: '6px 12px',
  background: '#4d2926',
  color: 'white',
  border: '2px solid white',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  fontSize: '14px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
};

const MemoizedFloor = memo(ShopFloor3D);

// Individual Furniture Component to isolate updates
const SingleFurniture: React.FC<{ 
  id: string; 
  isBuildMode: boolean; 
  isSelected: boolean;
  onSelect: (id: string, type: string) => void;
  onRotate: (id: string) => void;
  onMove: (id: string, type: string) => void;
  onDelete: (id: string) => void;
  onDeselect: () => void;
}> = memo(({ id, isBuildMode, isSelected, onSelect, onRotate, onMove, onDelete, onDeselect }) => {
  // Use a highly granular snapshot for just this furniture item
  const f = useSnapshot(gameStore.furniture).find(item => item.id === id);
  if (!f) return null;

  const commonProps = {
    position: [0, 0, 0] as [number, number, number], // Local to group
    rotation: f.rotation,
    onClick: () => onSelect(f.id, f.type)
  };

  return (
    <group position={[f.gridX, 0, f.gridY]}>
      {f.type === 'coffee_machine' ? (
        <CoffeeStation3D {...commonProps} state={f.state} progress={f.progress} />
      ) : f.type.startsWith('dec_') ? (
        <Decoration3D {...commonProps} type={f.type} />
      ) : (
        <Table3D {...commonProps} type={f.type} />
      )}
      
      {isSelected && isBuildMode && (
        <Html position={[0, 2.2, 0]} center>
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.95)',
            padding: '8px',
            borderRadius: '12px',
            border: '2px solid #4d2926',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            pointerEvents: 'auto'
          }}>
            <button onClick={(e) => { e.stopPropagation(); onRotate(f.id); }} style={btnStyle}>หมุน</button>
            <button onClick={(e) => { e.stopPropagation(); onMove(f.id, f.type); }} style={btnStyle}>ย้าย</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(f.id); }} style={{ ...btnStyle, background: '#d32f2f' }}>ลบ</button>
            <button onClick={(e) => { e.stopPropagation(); onDeselect(); }} style={btnStyle}>ปิด</button>
          </div>
        </Html>
      )}
    </group>
  );
});

const FurnitureRenderer: React.FC<{ 
  isBuildMode: boolean, 
  onSelect: (id: string, type: string) => void,
  onRotate: (id: string) => void,
  onMove: (id: string, type: string) => void,
  onDelete: (id: string) => void,
  onDeselect: () => void,
  selectedId: string | null
}> = memo(({ isBuildMode, onSelect, onRotate, onMove, onDelete, onDeselect, selectedId }) => {
  const snap = useSnapshot(gameStore);
  const furnitureIds = snap.furniture.map(f => f.id);
  
  return (
    <group>
      {furnitureIds.map((id) => (
        <SingleFurniture 
          key={id}
          id={id}
          isBuildMode={isBuildMode}
          isSelected={selectedId === id}
          onSelect={onSelect}
          onRotate={onRotate}
          onMove={onMove}
          onDelete={onDelete}
          onDeselect={onDeselect}
        />
      ))}
    </group>
  );
});

const CustomerRenderer: React.FC<{ onSelect: (id: string, type: string) => void }> = memo(({ onSelect }) => {
  const snap = useSnapshot(gameStore);
  const customers = snap.customers;
  
  // Debug log to see if customers are reaching React
  useEffect(() => {
    if (customers.length > 0) {
      console.log(`React: Rendering ${customers.length} customers`, customers);
    }
  }, [customers.length]);

  return (
    <group>
      {customers.map((c) => (
        <Customer3D 
          key={c.id} 
          id={c.id}
          position={[c.gridX, 0, c.gridY]} 
          color={c.color.startsWith('#') ? c.color : `#${c.color}`} 
          onClick={() => onSelect(c.id, 'customer')}
          order={c.order}
          patience={c.patience}
          state={c.state}
          seatIndex={(c as any).seatIndex}
        />
      ))}
    </group>
  );
});

const UIRenderer: React.FC = memo(() => {
  const snap = useSnapshot(gameStore);
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: '#4d2926',
      fontFamily: "'Inter', sans-serif",
      pointerEvents: 'none',
      textShadow: '0 2px 4px rgba(255,255,255,0.8)',
      zIndex: 10
    }}>
      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>I Love Coffee 3D</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
        <span style={{ background: 'rgba(255,255,255,0.7)', padding: '5px 12px', borderRadius: '20px' }}>Level {snap.level}</span>
        <span style={{ background: 'rgba(255,255,255,0.7)', padding: '5px 12px', borderRadius: '20px' }}>💰 {snap.gold}</span>
        <span style={{ background: 'rgba(255,255,255,0.7)', padding: '5px 12px', borderRadius: '20px' }}>✨ {snap.xp} XP</span>
      </div>
      {snap.heldItem && (
        <div style={{ 
          marginTop: '15px', 
          padding: '8px 20px', 
          background: 'linear-gradient(135deg, #4d2926 0%, #2a1816 100%)', 
          color: 'white', 
          borderRadius: '25px',
          border: '2px solid white',
          display: 'inline-block',
          fontWeight: 'bold',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}>
          Holding: {String(snap.heldItem).toUpperCase()}
        </div>
      )}
    </div>
  );
});

const GhostItem: React.FC<{ movingType?: string | null }> = memo(({ movingType }) => {
  const placingItemType = useSnapshot(gameStore).placingItemType;
  const activeType = placingItemType || movingType;
  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    const handleMove = (e: any) => {
      if (e.detail) setGhostPos(e.detail);
      else setGhostPos(null);
    };
    window.addEventListener('floor-move', handleMove);
    return () => window.removeEventListener('floor-move', handleMove);
  }, []);

  if (!ghostPos || !activeType) return null;

  return (
    <group position={ghostPos}>
      <group scale={[1, 1, 1]}>
        {activeType === 'coffee_machine' ? (
          <CoffeeStation3D position={[0, 0, 0]} interactive={false} />
        ) : activeType.startsWith('dec_') ? (
          <Decoration3D position={[0, 0, 0]} interactive={false} type={activeType} />
        ) : (
          <Table3D position={[0, 0, 0]} interactive={false} type={activeType} />
        )}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshToonMaterial color="lime" transparent opacity={0.3} />
      </mesh>
      {/* Semi-transparent overlay to make the whole ghost look "faint" */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshBasicMaterial color="white" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
});

const CoffeeShop3D: React.FC = () => {
  // STATE: ONLY local UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [movingItem, setMovingItem] = useState<{ id: string, type: string } | null>(null);
  
  // Handlers (use gameStore proxy directly to avoid dependency on snapshot)
  const handleEntityClick = useCallback((id: string, type: string) => {
    if (gameStore.isBuildMode) {
      if (type.startsWith('table_') || type === 'coffee_machine' || type.startsWith('dec_')) {
        setSelectedId(prev => (prev === id ? null : id));
      }
    } else {
      if (type === 'coffee_machine') {
        GameStoreActions.pushAction({ type: 'BREW_COFFEE', payload: { id } });
      } else if (type === 'customer') {
        GameStoreActions.pushAction({ type: 'SERVE_CUSTOMER', payload: { id } });
      }
    }
  }, []);

  const handleRotate = useCallback((id: string) => {
    GameStoreActions.pushAction({ type: 'ROTATE_FURNITURE', payload: { id } });
  }, []);

  const handleMove = useCallback((id: string, type: string) => {
    setMovingItem({ id, type });
    setSelectedId(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    GameStoreActions.pushAction({ type: 'DELETE_FURNITURE', payload: { id } });
    setSelectedId(null);
  }, []);

  const handleFloorClick = useCallback((e: any) => {
    if (!gameStore.isBuildMode) return;
    
    const point = e.point;
    const gridX = Math.round(point.x);
    const gridY = Math.round(point.z);

    if (gameStore.placingItemType) {
      GameStoreActions.pushAction({ 
        type: 'PLACE_FURNITURE', 
        payload: { type: gameStore.placingItemType, x: gridX, y: gridY } 
      });
      GameStoreActions.setPlacingItem(null);
      window.dispatchEvent(new CustomEvent('floor-move', { detail: null }));
    } else if (movingItem) {
      GameStoreActions.pushAction({ 
        type: 'MOVE_FURNITURE', 
        payload: { id: movingItem.id, x: gridX, y: gridY } 
      });
      setMovingItem(null);
      window.dispatchEvent(new CustomEvent('floor-move', { detail: null }));
    } else if (selectedId) {
      // Just deselect if clicking elsewhere without choosing an action
      setSelectedId(null);
    }
  }, [selectedId, movingItem]);

  const handleFloorMove = useCallback((e: any) => {
    if (gameStore.isBuildMode && (gameStore.placingItemType || movingItem)) {
      const point = e.point;
      const gridX = Math.round(point.x);
      const gridY = Math.round(point.z);
      window.dispatchEvent(new CustomEvent('floor-move', { detail: [gridX, 0.1, gridY] }));
    } else {
      window.dispatchEvent(new CustomEvent('floor-move', { detail: null }));
    }
  }, [movingItem]);

  // Listen for build mode changes only for camera/controls
  const isBuildMode = useSnapshot(gameStore).isBuildMode;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#e6dec5', position: 'relative' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={35} />
          <OrbitControls 
            makeDefault 
            minPolarAngle={Math.PI / 6} 
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={25}
            enabled={!isBuildMode || !selectedId}
          />
          
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          <Sky sunPosition={[100, 40, 100]} turbidity={0.05} rayleigh={0.2} />
          
          <MemoizedFloor onClick={handleFloorClick} onPointerMove={handleFloorMove} />
          <ShopWalls3D />
          <Street3D />
          
          <GhostItem movingType={movingItem?.type} />

          <group>
            <FurnitureRenderer 
              isBuildMode={isBuildMode} 
              onSelect={handleEntityClick}
              onRotate={handleRotate}
              onMove={handleMove}
              onDelete={handleDelete}
              onDeselect={() => setSelectedId(null)}
              selectedId={selectedId}
            />
            <CustomerRenderer onSelect={handleEntityClick} />
          </group>

          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.5} 
            scale={30} 
            blur={2.5} 
            far={6} 
          />
        </Suspense>
      </Canvas>

      <UIRenderer />
      <BuildMenu3D />
    </div>
  );
};

export default CoffeeShop3D;
