import Phaser from 'phaser';

export class Furniture extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private menuGroup!: Phaser.GameObjects.Container;
  
  public id: string;
  public type: string;
  public gridWidth: number;
  public gridHeight: number;
  
  public isSelected: boolean = false;
  public isMoving: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string, texture: string, width: number = 32, height: number = 32) {
    super(scene, x, y);
    this.type = type;
    this.id = Phaser.Utils.String.UUID();

    this.sprite = scene.add.sprite(0, 0, texture);
    // For 64px tall isometric objects, the base center is at y=48 (0.75)
    // For 32px objects, it's usually at y=24 (0.75) or y=16 (0.5)
    const pivotY = height === 64 ? 0.75 : 0.75; 
    this.sprite.setOrigin(0.5, pivotY);
    this.sprite.setDisplaySize(width, height);
    this.add(this.sprite);

    this.gridWidth = Math.ceil(width / 32);
    this.gridHeight = Math.ceil(height / 32);
    
    // Set interactive with hit area adjusted for (0.5, 0.75) origin
    // We use a custom rectangle that covers the sprite's bounds.
    // Container (0,0) is at the base center.
    const hitArea = new Phaser.Geom.Rectangle(-width / 2, -height * 0.75, width, height);
    this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.scene.input.setDraggable(this);
    
    // Create Context Menu
    this.createMenu();
    
    scene.add.existing(this);
  }

  private createMenu() {
    // Menu above the object
    this.menuGroup = this.scene.add.container(0, -this.height/2 - 20);
    this.add(this.menuGroup);
    this.menuGroup.setVisible(false);

    // Button Style
    const style = { fontSize: '12px', fontFamily: 'monospace', color: '#ffffff', padding: { x: 5, y: 2 } };

    // Center the menu
    const menuWidth = 120;
    const startX = -menuWidth / 2;

    // Move Button
    const moveBtn = this.scene.add.text(startX, 0, 'Move', { ...style, backgroundColor: '#0000ff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.startMove();
      });

    // Delete Button
    const deleteBtn = this.scene.add.text(startX + 40, 0, 'Del', { ...style, backgroundColor: '#ff0000' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.destroy();
      });

    // OK Button
    const okBtn = this.scene.add.text(startX + 80, 0, 'OK', { ...style, backgroundColor: '#00ff00' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        this.deselect();
      });

    this.menuGroup.add([moveBtn, deleteBtn, okBtn]);
  }

  public onInteract() {
    if (this.isSelected) return;
    this.select();
  }

  public select() {
    this.isSelected = true;
    this.menuGroup.setVisible(true);
    this.scene.children.bringToTop(this);
    // Disable drag initially when selected, wait for Move button
    this.scene.input.setDraggable(this, false);
  }

  public deselect() {
    this.isSelected = false;
    this.isMoving = false;
    this.menuGroup.setVisible(false);
    this.scene.input.setDraggable(this, false); // Ensure drag is disabled
  }

  public startMove() {
    this.isMoving = true;
    this.menuGroup.setVisible(false); // Hide menu while moving
    this.scene.input.setDraggable(this, true);
  }

  public confirmMove() {
    this.isMoving = false;
    // Show menu again to confirm placement or delete
    this.menuGroup.setVisible(true);
    this.scene.input.setDraggable(this, false);
  }

  setGridPosition(x: number, y: number) {
    // x, y are the center coordinates of the grid tile
    this.setPosition(x, y);
  }
}
