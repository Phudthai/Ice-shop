import Phaser from 'phaser';
import { OrderManager } from '../managers/OrderManager';
import { CoffeeMachine } from '../entities/CoffeeMachine';
import { Customer } from '../entities/Customer';

import { ProgressionManager } from '../managers/ProgressionManager';
import { GridManager } from '../managers/GridManager';
import { Furniture } from '../entities/Furniture';

export class GameplayScene extends Phaser.Scene {
  private orderManager!: OrderManager;
  private coffeeMachine!: CoffeeMachine;
  private progressionManager!: ProgressionManager;
  private gridManager!: GridManager;
  
  private heldItem: string | null = null;
  private heldItemText!: Phaser.GameObjects.Text;
  
  private isBuildMode: boolean = false;
  private buildModeIcon!: Phaser.GameObjects.Sprite;
  private buildModeBg!: Phaser.GameObjects.Arc;
  private furnitureGroup!: Phaser.GameObjects.Group;

  constructor() {
    super('GameplayScene');
  }

  preload() {
    this.load.image('barista', 'src/assets/sprites/barista.png');
    this.load.image('customer', 'src/assets/sprites/customer.png');
    this.load.image('coffee_machine', 'src/assets/sprites/coffee_machine.png');
    this.load.image('coffee_cup', 'src/assets/sprites/coffee_cup.png');
    this.load.image('table', 'src/assets/sprites/table.png');
    this.load.image('iso_floor', 'src/assets/sprites/iso_floor.png');
    this.load.image('wood_floor', 'src/assets/sprites/wood_floor.png');
    this.load.image('street_tile', 'src/assets/sprites/street_tile.png');
    this.load.image('counter', 'src/assets/sprites/counter.png');
    this.load.image('coffee_station', 'src/assets/sprites/coffee_station.png');
    this.load.image('build_icon', 'src/assets/sprites/build_icon.png');
    // Load Spritesheet (Frame size updated to 39x64 from processed AI asset)
    this.load.spritesheet('customer_anim', 'src/assets/sprites/customer_spritesheet.png', { 
      frameWidth: 39, 
      frameHeight: 64 
    });
  }

  create() {
    const { width, height } = this.scale;

    // Create Animations
    if (!this.anims.exists('customer_walk')) {
      this.anims.create({
        key: 'customer_walk',
        frames: this.anims.generateFrameNumbers('customer_anim', { start: 0, end: 7 }),
        frameRate: 12, // 12 fps for smooth 8-frame walk
        repeat: -1    // Loop forever
      });
    }

    // Background (Softer, warmer beige to reduce eye strain)
    this.add.rectangle(0, 0, width, height, 0xe6dec5)
      .setOrigin(0)
      .setDepth(-100);
    
    // Initialize Managers
    this.gridManager = new GridManager(this, width, height);
    this.progressionManager = new ProgressionManager(this);
    this.orderManager = new OrderManager(this);

    // Floor Base (Solid color under tiles)
    const floorGraphics = this.add.graphics();
    floorGraphics.setDepth(-3); // Bottom-most
    floorGraphics.fillStyle(0x8b4513); // SaddleBrown to match wood floor
    
    const top = this.gridManager.cartesianToIsometric(0, 0);
    const bottom = this.gridManager.cartesianToIsometric(9, 9);
    const left = this.gridManager.cartesianToIsometric(0, 9);
    const right = this.gridManager.cartesianToIsometric(9, 0);
    
    floorGraphics.beginPath();
    floorGraphics.moveTo(top.x, top.y - 16);
    floorGraphics.lineTo(right.x + 32, right.y);
    floorGraphics.lineTo(bottom.x, bottom.y + 16);
    floorGraphics.lineTo(left.x - 32, left.y);
    floorGraphics.closePath();
    floorGraphics.fillPath();

    // Render Isometric Floor
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const { x, y } = this.gridManager.cartesianToIsometric(col, row);
        this.add.image(x, y, 'wood_floor')
          .setDisplaySize(64.5, 32.5)
          .setDepth(-2); // Fixed depth for floor, behind everything
      }
    }

    // Render Street (Outside the shop, along the bottom-left edge)
    // Row 10 to 12, Col -5 to 15
    for (let col = -5; col < 15; col++) {
      for (let row = 10; row < 13; row++) {
         const { x, y } = this.gridManager.cartesianToIsometric(col, row);
         this.add.image(x, y, 'street_tile')
           .setDisplaySize(64.5, 32.5)
           .setDepth(-2.1); // Slightly below floor? Or same?
      }
    }

    // Walls
    const graphics = this.add.graphics();
    graphics.setDepth(-1); // On top of floor, but behind objects
    
    // Wall Colors
    const wallColor = 0xfdf5e6;
    const wallBorder = 0xd3c1a5;
    
    const wallHeight = 200;

    // Draw Left Wall
    graphics.fillStyle(wallColor);
    graphics.lineStyle(4, wallBorder); // Thicker line
    graphics.beginPath();
    graphics.moveTo(top.x, top.y - 16);
    graphics.lineTo(left.x, left.y - 16);
    graphics.lineTo(left.x, left.y - 16 - wallHeight);
    graphics.lineTo(top.x, top.y - 16 - wallHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    // Draw Right Wall
    graphics.fillStyle(0xf0e6d2); 
    graphics.beginPath();
    graphics.moveTo(top.x, top.y - 16);
    graphics.lineTo(right.x, right.y - 16);
    graphics.lineTo(right.x, right.y - 16 - wallHeight);
    graphics.lineTo(top.x, top.y - 16 - wallHeight);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Add a "top" edge to walls for thickness
    graphics.lineStyle(1, wallBorder);
    graphics.strokeRect(top.x - 2, top.y - 16 - wallHeight, 4, wallHeight); // Simple thickness hack
    
    this.furnitureGroup = this.add.group();

    // Initialize Coffee Machine (Station includes counter)
    const machinePos = this.gridManager.cartesianToIsometric(5, 5);
    
    this.coffeeMachine = new CoffeeMachine(this, machinePos.x, machinePos.y);
    this.furnitureGroup.add(this.coffeeMachine);
    this.coffeeMachine.setDepth(machinePos.y);

    // Held Item UI
    this.heldItemText = this.add.text(width - 150, height - 50, 'Held: None', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Build Mode Toggle Icon
    this.buildModeBg = this.add.circle(width - 50, 50, 25, 0x000000, 0.5);
    this.buildModeIcon = this.add.sprite(width - 50, 50, 'build_icon');
    this.buildModeIcon.setDisplaySize(32, 32);
    this.buildModeIcon.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleBuildMode());
    
    // Tooltip for Build Mode
    this.add.text(width - 50, 85, 'Build', { fontSize: '12px', fontFamily: 'monospace' }).setOrigin(0.5);

    // Spawn Table Button (Only visible in Build Mode)
    this.add.text(width - 100, 100, '+ Table', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#00ff00',
      backgroundColor: '#000000'
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      if (this.isBuildMode) this.spawnFurniture('table');
    });

    // Input handling
    this.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (!this.isBuildMode) {
        if (gameObject instanceof Customer) {
          this.handleCustomerInteraction(gameObject as Customer);
        } else if (gameObject instanceof CoffeeMachine) {
          this.handleMachineInteraction();
        }
      } else if (this.isBuildMode && gameObject instanceof Furniture) {
        (gameObject as Furniture).onInteract();
      }
    });

    // Drag events for furniture
    this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      if (this.isBuildMode && gameObject instanceof Furniture) {
        // Only allow drag if in moving state (handled by Furniture class enabling draggable)
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    });

    this.input.on('dragend', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (this.isBuildMode && gameObject instanceof Furniture) {
        const furniture = gameObject as Furniture;
        const { x, y } = this.gridManager.snapToGrid(furniture.x, furniture.y);
        furniture.setGridPosition(x, y);
        furniture.confirmMove();
      }
    });

    // Back button
    const backButton = this.add.text(100, 50, '< Back', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ff0000',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

  toggleBuildMode() {
    this.isBuildMode = !this.isBuildMode;
    
    // Update Icon Appearance
    if (this.isBuildMode) {
      this.buildModeBg.setFillStyle(0x00ff00, 0.8);
      this.buildModeIcon.setTint(0x000000);
    } else {
      this.buildModeBg.setFillStyle(0x000000, 0.5);
      this.buildModeIcon.clearTint();
    }
    
    this.gridManager.setVisible(this.isBuildMode);
  }

  spawnFurniture(type: string) {
    const { width, height } = this.scale;
    // Tables are 64x64, others 32x32
    const size = type === 'table' ? 64 : 32;
    const furniture = new Furniture(this, width / 2, height / 2, type, type, size, size);
    this.furnitureGroup.add(furniture);
    
    // Disable drag initially, must be selected first
    this.input.setDraggable(furniture, false);
    
    // Snap to initial grid
    const { x, y } = this.gridManager.snapToGrid(furniture.x, furniture.y);
    furniture.setGridPosition(x, y);
    
    // Auto-select new furniture
    furniture.select();
  }

  handleMachineInteraction() {
    if (this.coffeeMachine.currentIngredient === 'coffee_extract') {
      // Pick up coffee
      this.heldItem = 'espresso'; // Simplified: always espresso for now
      this.heldItemText.setText(`Held: ${this.heldItem}`);
      this.coffeeMachine.reset();
    } else {
      // Interact (Start brewing)
      this.coffeeMachine.interact();
    }
  }

  handleCustomerInteraction(customer: Customer) {
    if (this.heldItem && customer.isWaiting) {
      // Check if held item matches order (Simplified: accept any coffee for prototype)
      if (this.heldItem === customer.order?.id || true) { 
        // Calculate rewards
        const rewardGold = customer.order?.price || 10;
        const rewardXp = customer.order?.xp || 5;
        
        this.progressionManager.addGold(rewardGold);
        this.progressionManager.addXp(rewardXp);

        customer.leave(true);
        this.heldItem = null;
        this.heldItemText.setText('Held: None');
      }
    }
  }

  update(time: number, delta: number) {
    this.coffeeMachine.update(time, delta);
    this.orderManager.update(time, delta);
    
    // Simple Depth Sorting for dynamic objects
    this.children.each((child: any) => {
      // Sort Furniture, Customers, and CoffeeMachine by Y
      // We check for 'Container' (Furniture) or 'customer' texture
      if (child.type === 'Container' || (child.texture && child.texture.key === 'customer')) {
        child.setDepth(child.y);
      }
    });
  }
}
