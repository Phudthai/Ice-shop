import Phaser from 'phaser';

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
  LEAVING
}

export class Customer extends Phaser.GameObjects.Container {
  public id: string;
  public order: Order | null = null;
  public patience: number = 100;
  public isWaiting: boolean = false;
  
  private bubble: Phaser.GameObjects.Container;
  private orderText: Phaser.GameObjects.Text;
  private patienceBar: Phaser.GameObjects.Rectangle;
  private patienceTimer: Phaser.Time.TimerEvent | null = null;
  private sprite: Phaser.GameObjects.Sprite;
  
  public state: CustomerState = CustomerState.WALKING_OUTSIDE;
  private targetX: number = 0;
  private targetY: number = 0;
  private walkSpeed: number = 1.5; // Pixels per frame approx

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y);
    this.id = id;

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
    // Assuming spawn at left (-5, 11), walk to right (15, 11)
    // We calculate a point far to the right in isometric space
    // Approx direction: x + 1000, y + 500 based on iso projection
    this.targetX = x + 1200; 
    this.targetY = y + 600;
  }

  update(time: number, delta: number) {
    if (this.state === CustomerState.WALKING_OUTSIDE) {
      this.moveTowardsTarget();
      
      // Randomly decide to enter shop if near the "door"
      // Door is roughly at (0, 10) grid -> Screen coords?
      // Let's say if they are near the center of the screen horizontally
      // 5% chance per frame when near center
      if (Math.abs(this.x - 400) < 10 && Math.random() < 0.05) { 
         this.enterShop();
      }
      
      // If walked past screen, destroy
      if (this.x > 1500 || this.y > 1000) {
        this.destroy();
      }
    } else if (this.state === CustomerState.ENTERING) {
      this.moveTowardsTarget();
      if (this.hasReachedTarget()) {
        this.state = CustomerState.QUEUEING;
        this.bubble.setVisible(true); // Show order
        this.startPatienceTimer();
      }
    }
  }
  
  private moveTowardsTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > this.walkSpeed) {
      this.x += (dx / dist) * this.walkSpeed;
      this.y += (dy / dist) * this.walkSpeed;
    }
  }
  
  private hasReachedTarget(): boolean {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    return Math.sqrt(dx*dx + dy*dy) < 5;
  }

  enterShop() {
    this.state = CustomerState.ENTERING;
    // Set target to Queue Position inside shop
    // For now, let's just walk "Up-Right" into the shop center
    // Ideally this should be a specific grid coordinate like (2, 2)
    const gameplayScene = this.scene as any;
    if (gameplayScene.gridManager) {
        const target = gameplayScene.gridManager.cartesianToIsometric(2, 2);
        this.targetX = target.x;
        this.targetY = target.y;
    } else {
        this.targetX = this.x + 200;
        this.targetY = this.y - 100;
    }
  }

  placeOrder(order: Order) {
    this.order = order;
    this.orderText.setText(order.name);
    // Don't start waiting yet, wait until QUEUEING state
  }
  
  startPatienceTimer() {
    this.isWaiting = true;
    this.patienceBar.setVisible(true);
    this.patienceTimer = this.scene.time.addEvent({
      delay: 100,
      callback: this.updatePatience,
      callbackScope: this,
      loop: true
    });
  }

  updatePatience() {
    if (!this.isWaiting || !this.order) return;

    const decayRate = 100 / (this.order.timeLimit * 10); // 10 ticks per second
    this.patience -= decayRate;
    
    // Update bar width and color
    this.patienceBar.width = 40 * (this.patience / 100);
    
    if (this.patience > 50) {
      this.patienceBar.setFillStyle(0x00ff00);
    } else if (this.patience > 20) {
      this.patienceBar.setFillStyle(0xffff00);
    } else {
      this.patienceBar.setFillStyle(0xff0000);
    }

    if (this.patience <= 0) {
      this.leave(false);
    }
  }

  leave(satisfied: boolean) {
    this.state = CustomerState.LEAVING;
    this.isWaiting = false;
    if (this.patienceTimer) this.patienceTimer.remove();
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
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
