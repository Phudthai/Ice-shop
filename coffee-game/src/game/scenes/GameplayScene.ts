import Phaser from 'phaser';
import { gameStore, GameStoreActions } from '../GameStore';
import { OrderManager } from '../managers/OrderManager';
import { CoffeeMachine } from '../entities/CoffeeMachine';
import { Customer, CustomerState } from '../entities/Customer';
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
  private furnitureGroup!: Phaser.GameObjects.Group;
  private activeDraggingFurniture: Furniture | null = null;
  private floorTiles: Phaser.GameObjects.Image[] = [];
  private actionsUnsubscribe?: () => void;

  constructor() {
    super('GameplayScene');
  }

  preload() {
    this.load.image('barista', 'src/assets/sprites/barista.png');
    this.load.image('customer', 'src/assets/sprites/customer.png');
    this.load.image('coffee_machine', 'src/assets/sprites/coffee_machine.png');
    this.load.image('coffee_cup', 'src/assets/sprites/coffee_cup.png');
    this.load.image('table_wood', 'src/assets/sprites/table_wood.png');
    this.load.image('table_marble', 'src/assets/sprites/table_marble.png');
    this.load.image('table_glass', 'src/assets/sprites/table_glass.png');
    this.load.image('dec_plant', 'src/assets/sprites/dec_plant.png');
    this.load.image('dec_lamp', 'src/assets/sprites/dec_lamp.png');
    this.load.image('floor_checkered', 'src/assets/sprites/floor_checkered.png');
    this.load.image('floor_modern', 'src/assets/sprites/floor_modern.png');
    this.load.image('iso_floor', 'src/assets/sprites/iso_floor.png');
    this.load.image('wood_floor', 'src/assets/sprites/wood_floor.png');
    this.load.image('street_tile', 'src/assets/sprites/street_tile.png');
    this.load.image('counter', 'src/assets/sprites/counter.png');
    this.load.image('coffee_station', 'src/assets/sprites/coffee_station.png');
    this.load.image('build_icon', 'src/assets/sprites/build_icon.png');
    this.load.spritesheet('customer_anim', 'src/assets/sprites/customer_spritesheet.png', { 
      frameWidth: 39, 
      frameHeight: 64 
    });
  }

  create() {
    const { width, height } = this.scale;

    // Reset some state for safety on restart
    this.isBuildMode = false;
    this.activeDraggingFurniture = null;

    if (!this.anims.exists('customer_walk')) {
      this.anims.create({
        key: 'customer_walk',
        frames: this.anims.generateFrameNumbers('customer_anim', { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1
      });
    }

    this.add.rectangle(0, 0, width, height, 0xe6dec5)
      .setOrigin(0)
      .setDepth(-100);
    
    this.gridManager = new GridManager(this, width, height);
    this.progressionManager = new ProgressionManager(this);
    this.orderManager = new OrderManager(this);

    // Initial floor
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const { x, y } = this.gridManager.cartesianToIsometric(col, row);
        const tile = this.add.image(x, y, 'wood_floor')
          .setDisplaySize(64.5, 32.5)
          .setDepth(-2);
        this.floorTiles.push(tile);
      }
    }

    this.furnitureGroup = this.add.group();

    // CRITICAL: Initialize Furniture from Store if it exists (for scene persistence)
    // For this prototype, we'll just spawn the initial machine if not already in store
    const initialMachineInStore = gameStore.furniture.find(f => f.type === 'coffee_machine');
    if (!initialMachineInStore) {
      const machinePos = this.gridManager.cartesianToIsometric(5, 5);
      // Only reduce inventory if we are actually spawning it for the first time
      if (gameStore.inventory['coffee_machine'].count > 0) {
        GameStoreActions.adjustInventory('coffee_machine', -1);
        this.coffeeMachine = new CoffeeMachine(this, machinePos.x, machinePos.y);
        this.furnitureGroup.add(this.coffeeMachine);
        this.coffeeMachine.setDepth(machinePos.y);
        
        // Return to inventory on destroy
        this.coffeeMachine.on('destroy', () => {
          GameStoreActions.adjustInventory('coffee_machine', 1);
        });
      }
    } else {
      // Reconstitute from store data
      gameStore.furniture.forEach(f => {
        const { x, y } = this.gridManager.cartesianToIsometric(f.gridX, f.gridY);
        const furniture = this.spawnFurnitureSilent(f.type, x, y);
        if (furniture) {
          furniture.rotationAngle = f.rotation || 0;
          furniture.id = f.id;
          furniture.setDepth(y);
        }
      });
    }

    this.heldItemText = this.add.text(width - 150, height - 50, 'Held: None', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Build Mode Input
    this.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      if (!this.isBuildMode) {
        if (gameObject instanceof Customer) {
          this.handleCustomerInteraction(gameObject as Customer);
        } else if (gameObject instanceof CoffeeMachine) {
          this.handleMachineInteraction(gameObject as CoffeeMachine);
        }
      } else if (this.isBuildMode && gameObject instanceof Furniture) {
        (gameObject as Furniture).onInteract();
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.activeDraggingFurniture) {
        this.activeDraggingFurniture.x = pointer.worldX;
        this.activeDraggingFurniture.y = pointer.worldY;
      }
    });

    this.input.on('pointerup', () => {
      if (this.activeDraggingFurniture) {
        const { x, y, col, row } = this.gridManager.snapToGrid(this.activeDraggingFurniture.x, this.activeDraggingFurniture.y);
        this.activeDraggingFurniture.setGridPosition(x, y, col, row);
        this.activeDraggingFurniture.confirmMove();
        this.activeDraggingFurniture = null;
      }
    });

    // Valtio Subscription (with cleanup)
    if (this.actionsUnsubscribe) this.actionsUnsubscribe();
    import('valtio/utils').then(({ subscribeKey }) => {
      this.actionsUnsubscribe = subscribeKey(gameStore, 'actions', (actions) => {
        if (actions && actions.length > 0) {
          // Process a copy to prevent double-processing if clearActions triggers this again
          const actionsToProcess = [...actions];
          GameStoreActions.clearActions();
          actionsToProcess.forEach(action => {
            this.handle3DAction(action);
          });
        }
      });
    });

    this.events.on('shutdown', () => {
      if (this.actionsUnsubscribe) this.actionsUnsubscribe();
    });
  }

  private handle3DAction(action: any) {
    console.log(`Phaser: Received action ${action.type}`, action.payload);
    switch (action.type) {
      case 'BREW_COFFEE':
        const machine = this.furnitureGroup.getChildren().find((f: any) => f.id === action.payload.id) as CoffeeMachine;
        if (machine) machine.interact();
        break;
      case 'PLACE_FURNITURE':
        console.log(`Phaser: Attempting to place ${action.payload.type} at ${action.payload.x}, ${action.payload.y}`);
        const inv = gameStore.inventory[action.payload.type];
        if (inv && inv.count > 0) {
          const isoPos = this.gridManager.cartesianToIsometric(action.payload.x, action.payload.y);
          const f = this.spawnFurniture(action.payload.type, isoPos.x, isoPos.y);
          if (f) {
            f.setGridPosition(isoPos.x, isoPos.y, action.payload.x, action.payload.y);
            f.deselect();
            console.log(`Phaser: Successfully placed ${action.payload.type}`);
          }
        } else {
          console.warn(`Phaser: Cannot place ${action.payload.type}: No inventory left`, inv);
        }
        break;
      case 'SERVE_CUSTOMER':
        const customer = (this.orderManager as any).customers.find((c: any) => c.id === action.payload.id);
        if (customer) this.handleCustomerInteraction(customer);
        break;
      case 'ROTATE_FURNITURE':
        const fToRotate = this.furnitureGroup.getChildren().find((f: any) => f.id === action.payload.id) as Furniture;
        if (fToRotate) fToRotate.rotate();
        break;
      case 'DELETE_FURNITURE':
        const fToDelete = this.furnitureGroup.getChildren().find((f: any) => f.id === action.payload.id) as Furniture;
        if (fToDelete) fToDelete.removeFromGame();
        break;
      case 'MOVE_FURNITURE':
        const fToMove = this.furnitureGroup.getChildren().find((f: any) => f.id === action.payload.id) as Furniture;
        if (fToMove) {
          const pos = this.gridManager.cartesianToIsometric(action.payload.x, action.payload.y);
          fToMove.setGridPosition(pos.x, pos.y, action.payload.x, action.payload.y);
        }
        break;
    }
  }

  spawnFurniture(type: string, initialX: number, initialY: number): Furniture | undefined {
    let furniture: Furniture;
    if (type === 'coffee_machine') {
      furniture = new CoffeeMachine(this, initialX, initialY);
    } else if (type.startsWith('dec_')) {
      furniture = new Furniture(this, initialX, initialY, type, type, 32, 64);
      furniture.capacity = 0;
    } else {
      furniture = new Furniture(this, initialX, initialY, type, type, 64, 64);
    }
    this.furnitureGroup.add(furniture);
    GameStoreActions.adjustInventory(type, -1);
    furniture.setDepth(initialY);
    
    furniture.on('destroy', () => {
      GameStoreActions.adjustInventory(type, 1);
    });

    // Update store
    GameStoreActions.upsertFurniture({
      id: furniture.id,
      type: furniture.type,
      gridX: Math.round(this.gridManager.isometricToCartesian(initialX, initialY).col),
      gridY: Math.round(this.gridManager.isometricToCartesian(initialX, initialY).row)
    });

    return furniture;
  }

  // Spawn without reducing inventory or updating store (for initialization)
  private spawnFurnitureSilent(type: string, x: number, y: number): Furniture | undefined {
    let furniture: Furniture;
    if (type === 'coffee_machine') {
      furniture = new CoffeeMachine(this, x, y);
    } else if (type.startsWith('dec_')) {
      furniture = new Furniture(this, x, y, type, type, 32, 64);
      furniture.capacity = 0;
    } else {
      furniture = new Furniture(this, x, y, type, type, 64, 64);
    }
    this.furnitureGroup.add(furniture);
    furniture.setDepth(y);
    furniture.on('destroy', () => {
      GameStoreActions.adjustInventory(type, 1);
    });
    return furniture;
  }

  handleMachineInteraction(machine: CoffeeMachine) {
    if (machine.currentIngredient === 'coffee_extract') {
      this.heldItem = 'espresso';
      this.heldItemText.setText(`Held: ${this.heldItem}`);
      GameStoreActions.setHeldItem(this.heldItem);
      machine.reset();
    } else {
      machine.interact();
    }
  }

  handleCustomerInteraction(customer: Customer) {
    if (this.heldItem && customer.isWaiting) {
      const rewardGold = customer.order?.price || 10;
      const rewardXp = customer.order?.xp || 5;
      this.progressionManager.addGold(rewardGold);
      this.progressionManager.addXp(rewardXp);
      customer.leave(true);
      this.heldItem = null;
      this.heldItemText.setText('Held: None');
      GameStoreActions.setHeldItem(null);
    }
  }

  public findAvailableTable(): Furniture | null {
    let bestTable: Furniture | null = null;
    this.furnitureGroup.getChildren().forEach((obj: any) => {
      if (obj instanceof Furniture && !(obj instanceof CoffeeMachine)) {
        if (obj.occupants.length < obj.capacity) {
          bestTable = obj;
        }
      }
    });
    return bestTable;
  }

  update(time: number, delta: number) {
    if (gameStore.isBuildMode) return;
    this.orderManager.update(time, delta);
    
    // Low-frequency state sync (for new customers, state changes, etc.)
    this.syncTimer++;
    if (this.syncTimer >= 10) {
      this.syncTimer = 0;
      const activeCustomers = (this.orderManager as any).customers.map((c: Customer) => {
        const gridPos = this.gridManager.isometricToCartesian(c.x, c.y);
        
        let stateStr = 'walking';
        // Use enum for accurate comparison
        if (c.state === CustomerState.SITTING) stateStr = 'sitting';
        else if (c.state === CustomerState.LEAVING) stateStr = 'leaving';
        else if (c.state === CustomerState.QUEUEING) stateStr = 'queueing';
        else if (c.state === CustomerState.WALKING_TO_TABLE) stateStr = 'walking_to_table';

        return {
          id: c.id,
          gridX: Number(gridPos.col.toFixed(2)),
          gridY: Number(gridPos.row.toFixed(2)),
          state: stateStr,
          color: (c as any).color || '#ffffff',
          order: c.order ? { name: c.order.name } : null,
          patience: Math.round(c.patience),
          seatIndex: (c as any).seatIndex || 0
        };
      });
      const dataStr = JSON.stringify(activeCustomers);
      if (this.lastSyncData !== dataStr) {
        GameStoreActions.setCustomers(activeCustomers);
        this.lastSyncData = dataStr;
      }
    }
  }
  private lastSyncData: string = '';
  private syncTimer: number = 0;
}
