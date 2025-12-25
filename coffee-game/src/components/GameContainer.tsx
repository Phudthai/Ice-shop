import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from '../game/config';

export const GameContainer: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(GameConfig);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />;
};
