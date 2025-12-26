import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from '../game/config';

export const GameContainer: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    console.log('GameContainer: Mounting');
    let game: Phaser.Game | null = null;
    
    if (!gameRef.current) {
      game = new Phaser.Game(GameConfig);
      gameRef.current = game;
    }

    return () => {
      console.log('GameContainer: Unmounting');
      if (game) {
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />;
};
