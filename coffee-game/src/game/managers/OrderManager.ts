import Phaser from 'phaser';
import { Customer, Order } from '../entities/Customer';

export class OrderManager {
  private scene: Phaser.Scene;
  private customers: Customer[] = [];
  private maxCustomers: number = 5;
  private customerIdCounter: number = 0;
  public spawnTimer: Phaser.Time.TimerEvent;

  // Basic recipes for prototype
  private recipes: Order[] = [
    { id: 'espresso', recipeId: 'espresso', name: 'Espresso', price: 10, xp: 5, timeLimit: 30 },
    { id: 'latte', recipeId: 'latte', name: 'Latte', price: 15, xp: 8, timeLimit: 40 },
    { id: 'cappuccino', recipeId: 'cappuccino', name: 'Cappuccino', price: 18, xp: 10, timeLimit: 45 },
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Start spawning customers
    this.spawnTimer = this.scene.time.addEvent({
      delay: 5000, // Spawn every 5 seconds
      callback: this.spawnCustomer,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number, delta: number) {
    // Remove destroyed customers
    this.customers = this.customers.filter(c => c.active && c.scene);
    
    // Update all customers
    this.customers.forEach(c => c.update(time, delta));
  }

  private spawnCustomer() {
    if (this.customers.length >= this.maxCustomers) return;

    const id = `customer_${++this.customerIdCounter}`;
    
    // Spawn at Start of Street (Far Left)
    // Grid: col -5, row 11
    const gameplayScene = this.scene as any;
    if (!gameplayScene.gridManager) return;

    const spawnPos = gameplayScene.gridManager.cartesianToIsometric(-5, 11);
    
    const customer = new Customer(this.scene, spawnPos.x, spawnPos.y, id);
    // Adjust customer depth (will be handled by scene update, but good to set initial)
    customer.setDepth(spawnPos.y);
    this.customers.push(customer);

    // Assign random order
    const randomRecipe = this.recipes[Math.floor(Math.random() * this.recipes.length)];
    customer.placeOrder(randomRecipe);
  }


}
