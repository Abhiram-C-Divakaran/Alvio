import type { AIPrimitive, AIStep } from './aiSceneTypes';

export type ScenePosition = [number, number, number];
export interface SceneEdge {
  id: string;
  from: string;
  to: string;
  directed?: boolean;
  weight?: string | number;
  state?: string;
}

const referenceId = (value: any): string | null => {
  const id = value && typeof value === 'object' ? value.id : value;
  return id === null || id === undefined ? null : String(id);
};

function normalizePrimitive(primitive: AIPrimitive): AIPrimitive {
  const result = JSON.parse(JSON.stringify(primitive)) as AIPrimitive;
  let elements = result.initialElements;
  if (!Array.isArray(elements)) elements = result.nodes ?? result.items ?? result.cells ?? [];
  if (result.type === 'matrix' && elements.some(Array.isArray)) {
    elements = elements.flatMap((row: any[], rowIndex: number) =>
      Array.isArray(row) ? row.map((cell, col) => ({
        ...(cell && typeof cell === 'object' ? cell : { value: cell }), row: rowIndex, col,
      })) : []);
  }
  result.initialElements = elements.map((element: any, index: number) => {
    const item = element && typeof element === 'object' && !Array.isArray(element)
      ? element : { value: Array.isArray(element) ? element.join(',') : element };
    return { ...item, id: String(item.id ?? `${result.id}-el-${index}`), value: item.value ?? item.val ?? item.label ?? '', state: item.state ?? 'idle' };
  });
  if (result.type === 'graph') {
    const embeddedEdges = result.initialElements.filter((item: any) => item.from !== undefined && item.to !== undefined);
    result.initialElements = result.initialElements.filter((item: any) => !embeddedEdges.includes(item));
    result.edges = [...(result.edges ?? []), ...embeddedEdges].map((edge: any, index: number) => ({
      ...edge, id: String(edge.id ?? `${result.id}-edge-${index}`),
      from: referenceId(edge.from ?? edge.source), to: referenceId(edge.to ?? edge.target),
      directed: edge.directed ?? result.directed ?? false,
    }));
  }
  return result;
}

/** Replay from the initial scene so scrubbing backwards also restores removals and links. */
export function computePrimitives(primitives: AIPrimitive[], steps: AIStep[], stepIndex: number): AIPrimitive[] {
  const computed = primitives.map(normalizePrimitive);
  for (const step of steps.slice(0, Math.max(0, stepIndex + 1))) {
    for (const update of step.elementUpdates ?? []) {
      const primitive = computed.find(item => item.id === update.primitiveId);
      if (!primitive) continue;
      const id = String(update.elementId);
      let collection = primitive.initialElements;
      let index = collection.findIndex((item: any) => item.id === id);
      const edgeIndex = primitive.edges?.findIndex((item: any) => item.id === id) ?? -1;
      if (index < 0 && edgeIndex >= 0) {
        collection = primitive.edges!;
        index = edgeIndex;
      }
      if (index < 0 && /^\d+$/.test(id) && collection[Number(id)]) index = Number(id);
      if (update.remove) {
        if (index >= 0) collection.splice(index, 1);
        continue;
      }
      if (index < 0) {
        if (primitive.type === 'graph' && update.changes?.from !== undefined && update.changes?.to !== undefined) {
          collection = primitive.edges ?? (primitive.edges = []);
        }
        index = collection.length;
        collection.push({ id, value: '' });
      }
      const element = collection[index];
      if (update.changes) Object.assign(element, update.changes, { id: element.id });
      if (update.state) element.state = update.state;
      if (update.pointerLabels) element.pointerLabels = update.pointerLabels;
      if (update.valueChange !== null && update.valueChange !== undefined) element.value = update.valueChange.to;
      const targetIndex = update.changes?.index;
      if (Number.isInteger(targetIndex) && targetIndex >= 0 && collection === primitive.initialElements) {
        collection.splice(index, 1);
        collection.splice(Math.min(targetIndex, collection.length), 0, element);
      }
    }
  }
  return computed;
}

export function relationshipEdges(primitive: AIPrimitive): SceneEdge[] {
  const elements = primitive.initialElements;
  const ids = new Set(elements.map((element: any) => String(element.id)));
  const resolve = (value: any) => {
    const id = referenceId(value);
    if (id === null) return null;
    if (ids.has(id)) return id;
    return /^\d+$/.test(id) ? elements[Number(id)]?.id ?? null : null;
  };
  const edges: SceneEdge[] = [];
  const add = (fromValue: any, toValue: any, edge: any = {}) => {
    const from = resolve(fromValue);
    const to = resolve(toValue);
    if (from !== null && to !== null) edges.push({ ...edge, id: String(edge.id ?? `${from}->${to}`), from, to });
  };
  if (primitive.type === 'graph') {
    for (const edge of primitive.edges ?? []) add(edge.from ?? edge.source, edge.to ?? edge.target, { ...edge, directed: edge.directed ?? primitive.directed ?? false });
  } else if (primitive.type === 'linkedlist') {
    const explicitLinks = elements.some((element: any) => Object.hasOwn(element, 'next'));
    elements.forEach((element: any, index: number) => add(element.id, explicitLinks ? element.next : elements[index + 1]?.id, { directed: true }));
  } else if (primitive.type === 'tree') {
    for (const element of elements) {
      const children = Array.isArray(element.children) ? element.children : [element.left, element.right];
      for (const child of children) add(element.id, child, { directed: true });
    }
  }
  return edges;
}

export function linkedListLayout(primitive: AIPrimitive) {
  const edges = relationshipEdges(primitive);
  const elements = primitive.initialElements;
  const nodes = new Map(elements.map((element: any) => [element.id, element]));
  const incoming = new Set(edges.map(edge => edge.to));
  const next = new Map(edges.map(edge => [edge.from, edge.to]));
  const roots = elements.filter((element: any) => !incoming.has(element.id));
  const preferred = referenceId(primitive.head);
  roots.sort((a: any, b: any) => Number(b.id === preferred) - Number(a.id === preferred));
  const ordered: any[] = [];
  const seen = new Set<string>();
  for (const start of [...roots, ...(nodes.has(preferred) ? [nodes.get(preferred)] : []), ...elements]) {
    let node = start;
    while (node && !seen.has(node.id)) {
      seen.add(node.id);
      ordered.push(node);
      node = nodes.get(next.get(node.id));
    }
  }
  const positions = new Map<string, ScenePosition>(ordered.map((node, index) => [node.id, [(index - (ordered.length - 1) / 2) * 5, 0, 0]]));
  return { elements: ordered, edges, positions, head: roots[0]?.id ?? ordered[0]?.id, tails: new Set(elements.filter((node: any) => !next.has(node.id)).map((node: any) => node.id)) };
}

export function treeLayout(primitive: AIPrimitive) {
  const edges = relationshipEdges(primitive);
  const elements = primitive.initialElements;
  const incoming = new Set(edges.map(edge => edge.to));
  const children = new Map<string, string[]>();
  for (const edge of edges) children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to]);
  const positions = new Map<string, ScenePosition>();
  const seen = new Set<string>();
  let leaf = 0;
  let maxDepth = 0;
  const visit = (id: string, depth: number): number => {
    seen.add(id);
    maxDepth = Math.max(maxDepth, depth);
    const childX = (children.get(id) ?? []).filter(child => !seen.has(child)).map(child => visit(child, depth + 1));
    const x = childX.length ? childX.reduce((sum, value) => sum + value, 0) / childX.length : leaf++ * 4;
    positions.set(id, [x, -depth * 4.2, 0]);
    return x;
  };
  const roots = elements.filter((element: any) => !incoming.has(element.id));
  const preferred = referenceId(primitive.root);
  roots.sort((a: any, b: any) => Number(b.id === preferred) - Number(a.id === preferred));
  for (const node of [...roots, ...elements]) if (!seen.has(node.id)) visit(node.id, 0);
  const xs = [...positions.values()].map(position => position[0]);
  const center = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
  for (const position of positions.values()) { position[0] -= center; position[1] += maxDepth * 2.1; }
  return { elements, edges, positions };
}

export function graphLayout(primitive: AIPrimitive) {
  const elements = primitive.initialElements;
  const radius = elements.length > 1 ? Math.max(4, elements.length * 0.8) : 0;
  const positions = new Map<string, ScenePosition>(elements.map((element: any, index: number) => {
    const angle = Math.PI / 2 - index * 2 * Math.PI / Math.max(1, elements.length);
    const provided = element.position;
    const coordinates = Array.isArray(provided) ? provided : provided ? [provided.x, provided.y, provided.z ?? 0] : null;
    const position: ScenePosition = coordinates?.length === 3 && coordinates.every(Number.isFinite)
      ? coordinates as ScenePosition : [radius * Math.cos(angle), radius * Math.sin(angle), 0];
    return [element.id, position];
  }));
  return { elements, edges: relationshipEdges(primitive), positions };
}

export function matrixLayout(primitive: AIPrimitive) {
  const elements = primitive.initialElements;
  const columns = Math.max(1, primitive.cols ?? 0, ...elements.map((cell: any) => Number.isInteger(cell.col) ? cell.col + 1 : 0));
  const cells = elements.map((element: any, index: number) => ({
    ...element, row: Number.isInteger(element.row) ? element.row : Math.floor(index / columns),
    col: Number.isInteger(element.col) ? element.col : index % columns,
  }));
  const rows = Math.max(1, primitive.rows ?? 0, ...cells.map((cell: any) => cell.row + 1));
  const positions = new Map<string, ScenePosition>(cells.map((cell: any) => [cell.id, [(cell.col - (columns - 1) / 2) * 2.6, ((rows - 1) / 2 - cell.row) * 3.4, 0]]));
  return { elements: cells, positions, rows, columns };
}
