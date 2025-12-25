import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    // Load assets here later
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 3, 'I Love Coffee', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    const startButton = this.add.text(width / 2, height / 2, 'Start Game', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#00ff00',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      this.scene.start('GameplayScene');
    });

    startButton.on('pointerover', () => {
      startButton.setStyle({ color: '#ffff00' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ color: '#00ff00' });
    });
  }
}
