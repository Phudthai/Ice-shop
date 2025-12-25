import Phaser from 'phaser';
import { Ingredient } from '../managers/RecipeManager';
import { Furniture } from './Furniture';

export class CoffeeMachine extends Furniture {
  private statusText: Phaser.GameObjects.Text;
  private progressBar: Phaser.GameObjects.Rectangle;
  
  public currentIngredient: Ingredient = 'beans';
  public isBusy: boolean = false;
  
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

    // Simple state machine for prototype: Beans -> Roast -> Extract -> Done
    // In a full game, this would be more complex and recipe-driven
    
    if (this.currentIngredient === 'beans') {
      this.startProcess('Roasting...', 2000, 'roasted_beans');
    } else if (this.currentIngredient === 'roasted_beans') {
      this.startProcess('Extracting...', 3000, 'coffee_extract');
    } else if (this.currentIngredient === 'coffee_extract') {
      // Reset for now, or allow pickup
      this.statusText.setText('Done!');
      // Logic to pick up item would go here
    }
  }

  startProcess(actionName: string, duration: number, nextIngredient: Ingredient) {
    this.isBusy = true;
    this.statusText.setText(actionName);
    
    this.scene.tweens.add({
      targets: this.progressBar,
      width: 60,
      duration: duration,
      onComplete: () => {
        this.isBusy = false;
        this.currentIngredient = nextIngredient;
        this.statusText.setText(nextIngredient.replace('_', ' ').toUpperCase());
        this.progressBar.width = 0;
      }
    });
  }
  
  reset() {
    this.currentIngredient = 'beans';
    this.statusText.setText('Ready');
    this.isBusy = false;
    this.progressBar.width = 0;
  }
}
