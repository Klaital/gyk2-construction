import type { TreeNode } from '../types';

interface Props {
  nodes: TreeNode[];
}

function TreeNodeView({ node, depth }: { node: TreeNode; depth: number }) {
  if (node.quantity === 0) return null;
  return (
    <li>
      <span
        className={`tree-node ${node.isBase ? 'base-material' : ''}`}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        <span className="qty">{node.quantity}×</span>
        <span className="name">{node.item}</span>
      </span>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child, i) => (
            <TreeNodeView key={i} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function IngredientTree({ nodes }: Props) {
  const active = nodes.filter(n => n.quantity > 0);
  if (active.length === 0) return null;

  return (
    <section className="results-section">
      <h3>Recipe breakdown</h3>
      <ul className="tree-list">
        {active.map((node, i) => (
          <TreeNodeView key={i} node={node} depth={0} />
        ))}
      </ul>
    </section>
  );
}
