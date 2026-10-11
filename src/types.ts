export interface Ingredient {
  item: string;
  quantity: number;
}

export interface Recipe {
  location?: string;
  ingredients: Ingredient[];
}

export type RecipeMap = Record<string, Recipe>;

export interface TreeNode {
  item: string;
  quantity: number;
  children: TreeNode[];
  isBase: boolean;
}
