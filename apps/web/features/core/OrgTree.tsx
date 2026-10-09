import type { OrgUnitNode } from '../../lib/repositories';
import { buildOrgTree } from '../../lib/mocks';

/**
 * Árbol organizacional M01-E01: indentación por nivel, inactivas atenuadas.
 * Recursión pura — SRP, sin estado (el DnD vendrá en F1b).
 */
export function OrgTree({ units }: { units: OrgUnitNode[] }) {
  const roots = buildOrgTree(units);
  return (
    <div className="card">
      <ul className="divide-y divide-line">
        {roots.map((n) => (
          <TreeNode key={n.id} node={n} depth={0} />
        ))}
      </ul>
    </div>
  );
}

function TreeNode({ node, depth }: { node: OrgUnitNode; depth: number }) {
  return (
    <li className="px-4 py-2" style={{ paddingLeft: 16 + depth * 20 }}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-sm border border-line bg-slate-200"
        />
        <span className={`text-sm ${node.active ? 'text-ink-900' : 'text-ink-400 line-through'}`}>
          {node.name}
        </span>
        {!node.active && (
          <span className="rounded border border-line bg-slate-50 px-1 text-[11px] text-ink-500">
            inactiva
          </span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="mt-1 border-l border-line">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
