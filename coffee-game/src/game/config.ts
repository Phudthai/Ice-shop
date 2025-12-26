import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameplayScene } from './scenes/GameplayScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#2c2137', // Dark coffee color background
  scale: {
    mode: Phaser.Scale.NONE,
    width: 1280,
    height: 720,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // No gravity for top-down/isometric
      debug: false,
    },
  },
  pixelArt: true, // Crucial for pixel art style
  scene: [GameplayScene, MainMenuScene],
};
