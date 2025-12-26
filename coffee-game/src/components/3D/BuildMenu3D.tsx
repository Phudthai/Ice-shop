import React from 'react';
import { useSnapshot } from 'valtio';
import { gameStore, GameStoreActions } from '../../game/GameStore';

const BuildMenu3D: React.FC = () => {
  const snap = useSnapshot(gameStore);

  const categories = [
    { id: 'furniture', label: 'Furniture' },
    { id: 'decor', label: 'Decor' },
    { id: 'surfaces', label: 'Surfaces' }
  ];

  const items = {
    furniture: [
      { id: 'table_wood', label: 'Wood Table', icon: '/src/assets/sprites/table_wood.png' },
      { id: 'table_marble', label: 'Marble Table', icon: '/src/assets/sprites/table_marble.png' },
      { id: 'coffee_machine', label: 'Coffee Station', icon: '/src/assets/sprites/coffee_machine.png' }
    ],
    decor: [
      { id: 'dec_plant', label: 'Plant', icon: '/src/assets/sprites/dec_plant.png' },
      { id: 'dec_lamp', label: 'Lamp', icon: '/src/assets/sprites/dec_lamp.png' }
    ],
    surfaces: [
      { id: 'wood_floor', label: 'Wood Floor', icon: '/src/assets/sprites/wood_floor.png' }
    ]
  };

  const [activeCategory, setActiveCategory] = React.useState('furniture');

  if (!snap.isBuildMode) {
    return (
      <button 
        onClick={() => GameStoreActions.setBuildMode(true)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '15px',
          borderRadius: '50%',
          background: '#4d2926',
          border: '3px solid white',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          zIndex: 100
        }}
      >
        <img src="/src/assets/sprites/build_icon.png" alt="Build" style={{ width: '32px', height: '32px' }} />
      </button>
    );
  }

  const currentItems = items[activeCategory as keyof typeof items] || [];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '160px',
      background: 'rgba(77, 41, 38, 0.95)',
      borderTop: '4px solid #f5f5dc',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      boxSizing: 'border-box',
      zIndex: 100,
      boxShadow: '0 -5px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '5px 15px',
                background: activeCategory === cat.id ? '#f5f5dc' : '#4d2926',
                color: activeCategory === cat.id ? '#4d2926' : '#f5f5dc',
                border: '2px solid #f5f5dc',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => GameStoreActions.setBuildMode(false)}
          style={{
            padding: '5px 15px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Close
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', flex: 1 }}>
        {currentItems.map(item => {
          const inv = snap.inventory[item.id] || { count: 0, max: 0 };
          const isSelected = snap.placingItemType === item.id;
          const isEmpty = inv.count <= 0;

          return (
            <div 
              key={item.id} 
              onClick={() => !isEmpty && GameStoreActions.setPlacingItem(isSelected ? null : item.id)}
              style={{
                minWidth: '90px',
                height: '90px',
                background: isSelected ? '#fff' : '#f5f5dc',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isEmpty ? 'not-allowed' : 'pointer',
                border: isSelected ? '3px solid #4d2926' : '2px solid transparent',
                opacity: isEmpty ? 0.5 : 1,
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              <img src={item.icon} alt={item.label} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              <div style={{ fontSize: '10px', textAlign: 'center', padding: '2px', fontWeight: 'bold', color: '#4d2926' }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: inv.count > 0 ? '#2e7d32' : '#d32f2f',
                fontWeight: 'bold'
              }}>
                {inv.count}/{inv.max}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuildMenu3D;
