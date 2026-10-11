import { useState, useMemo } from 'react';
import recipesData from './data/recipes.json';
import type { RecipeMap } from './types';
import { buildTree, mergeBase } from './utils/calculator';
import ItemChecklist from './components/ItemChecklist';
import IngredientTree from './components/IngredientTree';
import IngredientSummary from './components/IngredientSummary';

const recipes = recipesData as RecipeMap;

export default function App() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleChange = (item: string, qty: number) => {
    setQuantities(prev => {
      if (qty === 0) {
        const next = { ...prev };
        delete next[item];
        return next;
      }
      return { ...prev, [item]: qty };
    });
  };

  const handleClear = () => setQuantities({});

  const trees = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([item, qty]) => buildTree(item, qty, recipes)),
    [quantities],
  );

  const totals = useMemo(() => mergeBase(trees), [trees]);

  const hasSelection = trees.length > 0;

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>GYK2 Construction Calculator</h1>
      </header>
      <main className="app-main">
        <ItemChecklist
          recipes={recipes}
          quantities={quantities}
          onChange={handleChange}
          onClear={handleClear}
        />
        <div className="results-panel">
          {!hasSelection && (
            <p className="empty-state">Select items on the left to see what materials you need.</p>
          )}
          <IngredientTree nodes={trees} />
          <IngredientSummary totals={totals} />
        </div>
      </main>
    </div>
  );
}
