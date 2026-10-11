import type { RecipeMap } from '../types';

interface Props {
  recipes: RecipeMap;
  quantities: Record<string, number>;
  onChange: (item: string, qty: number) => void;
  onClear: () => void;
}

export default function ItemChecklist({ recipes, quantities, onChange, onClear }: Props) {
  const grouped: Record<string, string[]> = {};
  for (const [name, recipe] of Object.entries(recipes)) {
    if (!recipe.location) continue; // intermediate/raw material — not directly buildable
    (grouped[recipe.location] ??= []).push(name);
  }

  const hasAny = Object.values(quantities).some(q => q > 0);

  return (
    <aside className="checklist-panel">
      <div className="panel-header">
        <h2>What to build</h2>
        {hasAny && (
          <button className="btn-ghost" onClick={onClear}>Clear all</button>
        )}
      </div>
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
        <section key={cat}>
          <h3 className="category-label">{cat}</h3>
          <ul className="item-list">
            {items.sort().map(name => {
              const qty = quantities[name] ?? 0;
              return (
                <li key={name} className={qty > 0 ? 'active' : ''}>
                  <span className="item-name">{name}</span>
                  <div className="counter">
                    <button
                      className="counter-btn"
                      onClick={() => onChange(name, Math.max(0, qty - 1))}
                      disabled={qty === 0}
                      aria-label={`Decrease ${name}`}
                    >−</button>
                    <span className="counter-value">{qty}</span>
                    <button
                      className="counter-btn"
                      onClick={() => onChange(name, qty + 1)}
                      aria-label={`Increase ${name}`}
                    >+</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </aside>
  );
}
