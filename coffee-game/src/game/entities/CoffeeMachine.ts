import Phaser from 'phaser';
import { Ingredient } from '../managers/RecipeManager';
import { Furniture } from './Furniture';
import { GameStoreActions } from '../GameStore';

export class CoffeeMachine extends Furniture {
  private statusText: Phaser.GameObjects.Text;
  private progressBar: Phaser.GameObjects.Rectangle;
  
  public currentIngredient: Ingredient = 'beans';
  public isBusy: boolean = false;
  public activeTween: Phaser.Tweens.Tween | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Call Furniture constructor with 'coffee_station' texture and 64x64 size
    super(scene, x, y, 'coffee_machine', 'coffee_station', 64, 64);

    // Status Text (Positioned relative to container center)
    this.statusText = scene.add.text(0, -70, 'Ready', {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#00000088'
    }).setOrigin(0.5);
    this.add(this.statusText);

    // Progress Bar
    this.progressBar = scene.add.rectangle(-20, -60, 0, 4, 0x00ff00);
    this.add(this.progressBar);
  }

  interact() {
    if (this.isBusy) return;

    if (this.currentIngredient === 'beans') {
      this.startProcess('ROASTING', 2000, 'roasted_beans');
    } else if (this.currentIngredient === 'roasted_beans') {
      this.startProcess('EXTRACTING', 3000, 'coffee_extract');
    }
  }

  private startProcess(actionName: string, duration: number, nextIngredient: Ingredient) {
    this.isBusy = true;
    
    // Initial sync
    const baseData = {
      id: this.id,
      type: this.type,
      gridX: this.gridX,
      gridY: this.gridY,
      rotation: this.rotationAngle
    };

    GameStoreActions.upsertFurniture({
      ...baseData,
      state: actionName,
      progress: 0
    });

    let lastProgressSync = 0;

    this.activeTween = this.scene.tweens.add({
      targets: this.progressBar,
      width: 60,
      duration: duration,
      onUpdate: () => {
        const currentProgress = this.progressBar.width / 60;
        // Throttle progress updates to React (every 10%)
        if (currentProgress - lastProgressSync >= 0.1) {
          lastProgressSync = currentProgress;
          GameStoreActions.upsertFurniture({
            ...baseData,
            state: actionName,
            progress: Math.floor(currentProgress * 100) / 100
          });
        }
      },
      onComplete: () => {
        this.isBusy = false;
        this.currentIngredient = nextIngredient;
        const finalState = nextIngredient.toUpperCase();
        
        GameStoreActions.upsertFurniture({
          ...baseData,
          state: finalState,
          progress: 1
        });

        this.progressBar.width = 0;
        this.activeTween = null;
      }
    });
  }
  
  reset() {
    this.currentIngredient = 'beans';
    this.isBusy = false;
    this.progressBar.width = 0;
    
    GameStoreActions.upsertFurniture({
      id: this.id,
      type: this.type,
      gridX: this.gridX,
      gridY: this.gridY,
      rotation: this.rotationAngle,
      state: 'READY',
      progress: 0
    });
  }
}
