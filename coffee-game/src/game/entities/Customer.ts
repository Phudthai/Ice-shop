import Phaser from 'phaser';
import { Furniture } from './Furniture';

export interface Order {
  id: string;
  recipeId: string;
  name: string;
  price: number;
  xp: number;
  timeLimit: number; // seconds
}

export enum CustomerState {
  WALKING_OUTSIDE,
  ENTERING,
  QUEUEING,
  WALKING_TO_TABLE,
  SITTING,
  LEAVING
}

export class Customer extends Phaser.GameObjects.Container {
  public id: string;
  public order: Order | null = null;
  public patience: number = 100;
  public isWaiting: boolean = false;
  public currentTable: Furniture | null = null; // Track which table we are at
  public color: string;
  
  private bubble: Phaser.GameObjects.Container;
  private orderText: Phaser.GameObjects.Text;
  private patienceBar: Phaser.GameObjects.Rectangle;
  private patienceTimer: Phaser.Time.TimerEvent | null = null;
  private sprite: Phaser.GameObjects.Sprite;
  
  public state: CustomerState = CustomerState.WALKING_OUTSIDE;
  public targetX: number = 0;
  public targetY: number = 0;
  private walkSpeed: number;
  
  // For smooth sync
  public lastSentX: number = 0;
  public lastSentY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y);
    this.id = id;
    this.color = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    this.walkSpeed = 1.2 + Math.random() * 0.8;
    this.lastSentX = x;
    this.lastSentY = y;

    // Sprite
    // Use the spritesheet texture
    this.sprite = scene.add.sprite(0, 0, 'customer_anim');
    this.sprite.setOrigin(0.5, 1); // Feet at (0,0)
    // this.sprite.setDisplaySize(32, 64); // Size is determined by frame size now
    this.add(this.sprite);
    
    // Play animation
    this.sprite.play('customer_walk');

    // Order Bubble (Initially Hidden)
    this.bubble = scene.add.container(0, -85);
    const bubbleBg = scene.add.rectangle(0, 0, 60, 25, 0xffffff);
    bubbleBg.setStrokeStyle(1, 0x000000);
    this.orderText = scene.add.text(0, 0, '...', {
      fontSize: '10px',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5);
    
    this.bubble.add([bubbleBg, this.orderText]);
    this.add(this.bubble);
    this.bubble.setVisible(false); // Hide until ordering

    // Patience Bar (Initially Hidden)
    this.patienceBar = scene.add.rectangle(0, -50, 40, 5, 0x00ff00);
    this.patienceBar.setVisible(false);
    this.add(this.patienceBar);

    this.setSize(32, 64);
    this.setInteractive();

    scene.add.existing(this);
    
    // Set initial target (End of street)
    // Walk along the street (Row 11) to the far right
    const gameplayScene = scene as any;
    if (gameplayScene.gridManager) {
      const endTarget = gameplayScene.gridManager.cartesianToIsometric(20, 11);
      this.targetX = endTarget.x;
      this.targetY = endTarget.y;
    } else {
      this.targetX = x + 1000;
      this.targetY = y + 500;
    }
  }

  update(_time: number, _delta: number) {
    if (!this.scene) return;
    const gameplayScene = this.scene as any;
    if (gameplayScene.isBuildMode) return;

    if (this.state === CustomerState.WALKING_OUTSIDE) {
      this.moveTowardsTarget();
      
      // Get current grid position to check for door
      if (gameplayScene.gridManager) {
        const gridPos = gameplayScene.gridManager.isometricToCartesian(this.x, this.y);
        // Door is around grid (2, 10 or 11)
        if (Math.abs(gridPos.col - 2) < 0.5 && Math.random() < 0.05) {
          this.enterShop();
        }
      }
      
      // If walked past screen, destroy
      if (this.x > 1500 || this.y > 1000) {
        this.destroy();
      }
    } else if (this.state === CustomerState.ENTERING) {
      this.moveTowardsTarget();
      if (this.hasReachedTarget()) {
        this.state = CustomerState.QUEUEING;
        this.sprite.stop(); // Stop walking while in queue
        this.sprite.setFrame(0);
        this.bubble.setVisible(true); // Show order
        this.isWaiting = true; // Can be served now
        
        // After ordering, look for a table
        this.scene.time.delayedCall(1000, () => this.goToTable());
      }
    } else if (this.state === CustomerState.WALKING_TO_TABLE) {
      this.moveTowardsTarget();
      if (this.hasReachedTarget()) {
        this.state = CustomerState.SITTING;
        this.sprite.stop();
        this.sprite.setFrame(0);
        this.startPatienceTimer();
      }
    } else if (this.state === CustomerState.SITTING) {
      // Just chill at the table
    } else if (this.state === CustomerState.LEAVING) {
      this.moveTowardsTarget();
    }
  }
  
  private moveTowardsTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > this.walkSpeed) {
      // Add a tiny bit of organic "wobble"
      const time = this.scene.time.now / 1000;
      const wobble = Math.sin(time * 2) * 2;
      
      // Calculate normal direction
      const nx = dx / dist;
      const ny = dy / dist;
      
      // Perpendicular vector for wobble
      const px = -ny;
      const py = nx;

      this.x += nx * this.walkSpeed + px * wobble * 0.1;
      this.y += ny * this.walkSpeed + py * wobble * 0.1;

      // Emit event for 3D view (Smooth sync)
      // We don't need to emit every single pixel, but enough for a smooth curve
      if (Math.abs(this.x - this.lastSentX) > 0.5 || Math.abs(this.y - this.lastSentY) > 0.5) {
        const gameplayScene = this.scene as any;
        const gridPos = gameplayScene.gridManager.isometricToCartesian(this.x, this.y);
        window.dispatchEvent(new CustomEvent('customer-move', {
          detail: { 
            id: this.id, 
            x: gridPos.col, 
            y: gridPos.row 
          }
        }));
        this.lastSentX = this.x;
        this.lastSentY = this.y;
      }
    }
  }
  
  private hasReachedTarget(): boolean {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    return Math.sqrt(dx*dx + dy*dy) < 5;
  }

  private goToTable() {
    const gameplayScene = this.scene as any;
    if (gameplayScene.findAvailableTable) {
      const table = gameplayScene.findAvailableTable();
      if (table) {
        this.state = CustomerState.WALKING_TO_TABLE;
        this.sprite.play('customer_walk');
        this.currentTable = table;
        
        // Seating index for 3D positioning
        const seatIndex = table.occupants.length;
        table.occupants.push(this);
        
        // Offset for seat in 2D
        const offsetX = seatIndex === 0 ? -15 : 15;
        this.targetX = table.x + offsetX;
        this.targetY = table.y - 10;
        
        // Save seat info for 3D
        (this as any).seatIndex = seatIndex;
      } else {
        this.scene.time.delayedCall(3000, () => {
          if (this.state === CustomerState.QUEUEING && this.active) {
            this.goToTable();
          }
        });
      }
    }
  }

  enterShop() {
    this.state = CustomerState.ENTERING;
    const gameplayScene = this.scene as any;
    const target = gameplayScene.gridManager.cartesianToIsometric(2, 2);
    this.targetX = target.x;
    this.targetY = target.y;
  }

  placeOrder(order: Order) {
    this.order = order;
    this.orderText.setText(order.name);
  }
  
  startPatienceTimer() {
    this.isWaiting = true;
    this.patienceBar.setVisible(true);
    this.patienceTimer = this.scene.time.addEvent({
      delay: 1000, // Update sync every second is enough
      callback: this.updatePatience,
      callbackScope: this,
      loop: true
    });
  }

  updatePatience() {
    if (!this.isWaiting || !this.order) return;
    if (this.state !== CustomerState.SITTING) return;

    const decayRate = 100 / this.order.timeLimit;
    this.patience -= decayRate;
    
    this.patienceBar.width = 40 * (this.patience / 100);
    
    if (this.patience <= 0) {
      this.leave(false);
    }
  }

  leave(satisfied: boolean) {
    this.state = CustomerState.LEAVING;
    this.sprite.play('customer_walk');
    this.isWaiting = false;
    
    if (this.currentTable) {
      const index = this.currentTable.occupants.indexOf(this);
      if (index > -1) {
        this.currentTable.occupants.splice(index, 1);
      }
      this.currentTable = null;
    }

    if (this.patienceTimer) this.patienceTimer.remove();
    
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.destroy();
      }
    });

    if (satisfied) {
      console.log(`Customer ${this.id} left happy!`);
    } else {
      console.log(`Customer ${this.id} left angry!`);
    }
  }
}
