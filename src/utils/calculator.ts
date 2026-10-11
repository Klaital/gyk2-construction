import type { RecipeMap, TreeNode } from '../types';

export function buildTree(
  item: string,
  quantity: number,
  recipes: RecipeMap,
  visited: ReadonlySet<string> = new Set(),
): TreeNode {
  const recipe = recipes[item];
  if (!recipe || visited.has(item)) {
    return { item, quantity, children: [], isBase: true };
  }
  const next = new Set(visited);
  next.add(item);
  return {
    item,
    quantity,
    isBase: false,
    children: recipe.ingredients.map(ing =>
      buildTree(ing.item, ing.quantity * quantity, recipes, next),
    ),
  };
}

export function flattenBase(node: TreeNode): Record<string, number> {
  if (node.isBase || node.children.length === 0) {
    return { [node.item]: node.quantity };
  }
  const result: Record<string, number> = {};
  for (const child of node.children) {
    for (const [k, v] of Object.entries(flattenBase(child))) {
      result[k] = (result[k] ?? 0) + v;
    }
  }
  return result;
}

export function mergeBase(nodes: TreeNode[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const node of nodes) {
    for (const [k, v] of Object.entries(flattenBase(node))) {
      result[k] = (result[k] ?? 0) + v;
    }
  }
  return result;
}
