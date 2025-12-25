

export type Ingredient = 'beans' | 'roasted_beans' | 'coffee_extract' | 'milk' | 'foam';

export interface RecipeStep {
  action: 'roast' | 'extract' | 'add_milk' | 'add_foam';
  duration: number; // ms
  requiredIngredient: Ingredient | null;
  resultIngredient: Ingredient;
}

export interface DrinkRecipe {
  id: string;
  name: string;
  steps: RecipeStep[];
}

export class RecipeManager {
  public static recipes: Record<string, DrinkRecipe> = {
    espresso: {
      id: 'espresso',
      name: 'Espresso',
      steps: [
        { action: 'roast', duration: 2000, requiredIngredient: 'beans', resultIngredient: 'roasted_beans' },
        { action: 'extract', duration: 3000, requiredIngredient: 'roasted_beans', resultIngredient: 'coffee_extract' }
      ]
    },
    latte: {
      id: 'latte',
      name: 'Latte',
      steps: [
        { action: 'roast', duration: 2000, requiredIngredient: 'beans', resultIngredient: 'roasted_beans' },
        { action: 'extract', duration: 3000, requiredIngredient: 'roasted_beans', resultIngredient: 'coffee_extract' },
        { action: 'add_milk', duration: 1000, requiredIngredient: 'coffee_extract', resultIngredient: 'milk' } // Simplified logic
      ]
    },
    cappuccino: {
      id: 'cappuccino',
      name: 'Cappuccino',
      steps: [
        { action: 'roast', duration: 2000, requiredIngredient: 'beans', resultIngredient: 'roasted_beans' },
        { action: 'extract', duration: 3000, requiredIngredient: 'roasted_beans', resultIngredient: 'coffee_extract' },
        { action: 'add_milk', duration: 1000, requiredIngredient: 'coffee_extract', resultIngredient: 'milk' },
        { action: 'add_foam', duration: 1000, requiredIngredient: 'milk', resultIngredient: 'foam' }
      ]
    }
  };

  static getRecipe(id: string): DrinkRecipe | undefined {
    return this.recipes[id];
  }
}
