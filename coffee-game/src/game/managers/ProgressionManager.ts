import Phaser from 'phaser';

export class ProgressionManager {
  private scene: Phaser.Scene;
  public level: number = 1;
  public xp: number = 0;
  public nextLevelXp: number = 100;
  public gold: number = 0;

  private xpText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // UI Elements
    this.xpText = scene.add.text(20, 20, 'Level 1 (0/100 XP)', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });

    this.goldText = scene.add.text(20, 45, 'Gold: 0', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'monospace'
    });
  }

  addXp(amount: number) {
    this.xp += amount;
    this.checkLevelUp();
    this.updateUI();
  }

  addGold(amount: number) {
    this.gold += amount;
    this.updateUI();
  }

  private checkLevelUp() {
    if (this.xp >= this.nextLevelXp) {
      this.level++;
      this.xp -= this.nextLevelXp;
      this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
      
      // Level up effect
      const levelUpText = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, `LEVEL UP! ${this.level}`, {
        fontSize: '48px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      this.scene.tweens.add({
        targets: levelUpText,
        y: levelUpText.y - 100,
        alpha: 0,
        duration: 2000,
        onComplete: () => levelUpText.destroy()
      });
    }
  }

  private updateUI() {
    this.xpText.setText(`Level ${this.level} (${this.xp}/${this.nextLevelXp} XP)`);
    this.goldText.setText(`Gold: ${this.gold}`);
  }
}
