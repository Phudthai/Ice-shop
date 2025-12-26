import Phaser from 'phaser';

export class GridManager {
  private gridGraphics: Phaser.GameObjects.Graphics;
  private tileWidth: number = 64;  // Width of the diamond
  private tileHeight: number = 32; // Height of the diamond
  private cols: number = 10;
  private rows: number = 10;
  private originX: number;
  private originY: number;
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.gridGraphics = scene.add.graphics();
    this.gridGraphics.setDepth(100);
    
    // Center the grid in the screen
    this.originX = width / 2;
    this.originY = height / 4; // Start higher up
    
    this.drawGrid();
    this.setVisible(false);
  }

  toggleVisibility() {
    this.setVisible(!this.isVisible);
  }

  setVisible(visible: boolean) {
    this.isVisible = visible;
    this.gridGraphics.setVisible(visible);
  }

  private drawGrid() {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0xffffff, 0.3);

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const { x, y } = this.cartesianToIsometric(col, row);
        
        // Draw diamond shape for each tile
        this.gridGraphics.moveTo(x, y - this.tileHeight / 2); // Top
        this.gridGraphics.lineTo(x + this.tileWidth / 2, y); // Right
        this.gridGraphics.lineTo(x, y + this.tileHeight / 2); // Bottom
        this.gridGraphics.lineTo(x - this.tileWidth / 2, y); // Left
        this.gridGraphics.lineTo(x, y - this.tileHeight / 2); // Close loop
      }
    }
    
    this.gridGraphics.strokePath();
  }

  // Convert Grid Coordinates (col, row) to Screen Pixels (x, y)
  cartesianToIsometric(col: number, row: number): { x: number, y: number } {
    const x = this.originX + (col - row) * (this.tileWidth / 2);
    const y = this.originY + (col + row) * (this.tileHeight / 2);
    return { x, y };
  }

  // Convert Screen Pixels (x, y) to Grid Coordinates (col, row) (RAW Fractional values)
  isometricToCartesian(x: number, y: number): { col: number, row: number } {
    const adjX = x - this.originX;
    const adjY = y - this.originY;

    const col = (adjX / (this.tileWidth / 2) + adjY / (this.tileHeight / 2)) / 2;
    const row = (adjY / (this.tileHeight / 2) - adjX / (this.tileWidth / 2)) / 2;

    return { col, row };
  }

  snapToGrid(x: number, y: number): { x: number, y: number, col: number, row: number } {
    const raw = this.isometricToCartesian(x, y);
    
    // Explicitly round for snapping
    const col = Math.round(raw.col);
    const row = Math.round(raw.row);
    
    // Clamp to grid bounds
    const clampedCol = Phaser.Math.Clamp(col, 0, this.cols - 1);
    const clampedRow = Phaser.Math.Clamp(row, 0, this.rows - 1);
    
    const pos = this.cartesianToIsometric(clampedCol, clampedRow);
    return { ...pos, col: clampedCol, row: clampedRow };
  }
  
  getGridSize(): number {
    return this.tileWidth; // Return width as primary size
  }
}
