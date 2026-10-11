interface Props {
  totals: Record<string, number>;
}

export default function IngredientSummary({ totals }: Props) {
  const entries = Object.entries(totals).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return null;

  return (
    <section className="results-section">
      <h3>Raw materials needed</h3>
      <ul className="summary-list">
        {entries.map(([item, qty]) => (
          <li key={item}>
            <span className="summary-qty">{qty}</span>
            <span className="summary-item">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
