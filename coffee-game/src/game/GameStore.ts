import { proxy } from 'valtio';

export interface FurnitureData {
  id: string;
  type: string;
  gridX: number;
  gridY: number;
  rotation?: number;
  state?: string;      // For machines: 'ready', 'roasting', 'extracting', 'done'
  progress?: number;   // 0 to 1
}

export interface CustomerData {
  id: string;
  gridX: number;
  gridY: number;
  state: string;
  color: string;
  order?: { name: string } | null;
  patience?: number;   // 0 to 100
}

export interface GameAction {
  type: string;
  payload?: any;
}

export interface InventoryItem {
  count: number;
  max: number;
}

export interface GameState {
  furniture: FurnitureData[];
  customers: CustomerData[];
  inventory: { [key: string]: InventoryItem };
  isBuildMode: boolean;
  placingItemType: string | null;
  level: number;
  gold: number;
  xp: number;
  actions: GameAction[];
  heldItem: string | null;
}

export const gameStore = proxy<GameState>({
  furniture: [],
  customers: [],
  inventory: {
    'table_wood': { count: 3, max: 10 },
    'table_marble': { count: 2, max: 10 },
    'table_glass': { count: 2, max: 10 },
    'dec_plant_small': { count: 5, max: 20 },
    'dec_plant_large': { count: 3, max: 10 },
    'dec_lamp_floor': { count: 4, max: 10 },
    'dec_lamp_table': { count: 4, max: 10 },
    'dec_rug_red': { count: 2, max: 5 },
    'dec_rug_blue': { count: 2, max: 5 },
    'dec_clock': { count: 2, max: 5 },
    'dec_neon_sign': { count: 2, max: 5 },
    'dec_shelf_wood': { count: 3, max: 10 },
    'dec_speaker': { count: 2, max: 6 },
    'floor_checkered': { count: 99, max: 99 },
    'floor_modern': { count: 99, max: 99 },
    'wood_floor': { count: 99, max: 99 },
    'coffee_machine': { count: 2, max: 5 }
  },
  isBuildMode: false,
  placingItemType: null,
  level: 1,
  gold: 100,
  xp: 0,
  actions: [],
  heldItem: null
});

// Helper functions to update state from Phaser
export const GameStoreActions = {
  pushAction: (action: GameAction) => {
    console.log(`GameStore: Pushing action ${action.type}`, action.payload);
    // Replace array to trigger subscribeKey on Phaser side
    gameStore.actions = [...gameStore.actions, action];
  },
  clearActions: () => {
    if (gameStore.actions.length > 0) {
      console.log(`GameStore: Clearing ${gameStore.actions.length} actions`);
      gameStore.actions.length = 0;
    }
  },
  setFurniture: (furniture: FurnitureData[]) => {
    gameStore.furniture = furniture;
  },
  upsertFurniture: (item: FurnitureData) => {
    const index = gameStore.furniture.findIndex(f => f.id === item.id);
    if (index > -1) {
      gameStore.furniture[index] = { ...gameStore.furniture[index], ...item };
    } else {
      gameStore.furniture.push(item);
    }
  },
  removeFurniture: (id: string) => {
    gameStore.furniture = gameStore.furniture.filter(f => f.id !== id);
  },
  setCustomers: (customers: CustomerData[]) => {
    gameStore.customers = customers;
  },
  setBuildMode: (isBuildMode: boolean) => {
    gameStore.isBuildMode = isBuildMode;
    if (!isBuildMode) gameStore.placingItemType = null;
  },
  setPlacingItem: (type: string | null) => {
    gameStore.placingItemType = type;
  },
  updateInventory: (inventory: { [key: string]: InventoryItem }) => {
    gameStore.inventory = inventory;
  },
  adjustInventory: (type: string, delta: number) => {
    if (gameStore.inventory[type]) {
      gameStore.inventory[type].count += delta;
    }
  },
  updateProgression: (level: number, gold: number, xp: number) => {
    gameStore.level = level;
    gameStore.gold = gold;
    gameStore.xp = xp;
  },
  setHeldItem: (item: string | null) => {
    gameStore.heldItem = item;
  }
};
