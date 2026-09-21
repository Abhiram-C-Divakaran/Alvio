import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Box, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Eye, EyeOff, Info, Clock3, CheckCircle2, XCircle, ListTree, Code2, Orbit } from 'lucide-react';
import { dsInfo } from './VisualizerInfoPanel';
import type { DataStructure } from '../../types/dataStructures';
import type { TutorialStep } from './TutorialOverlay';
import './structure-layout.css';

export interface StructureLayoutProps {
  activeDs: string; activeVariant: string; modules: string[]; state: DataStructure | null;
  onModule: (name: string) => void; onVariant: (name: string) => void; onCode: () => void;
  playing: boolean; onPlay: () => void; step: number; steps: TutorialStep[];
  onStep: (index: number) => void; onReset: () => void; onCameraReset: () => void;
  guideHidden: boolean; onToggleGuide: () => void; selected: string | null;
  onSelect: (id: string | null) => void; reducedMotion: boolean; onMotion: () => void;
  status: string; children: ReactNode; toolbar: ReactNode;
}

export default function StructureLayout(p: StructureLayoutProps) {
  const [mobileTab, setMobileTab] = useState('Visualizer');
  const [treeView, setTreeView] = useState(false);
  const info = dsInfo[p.activeDs === 'BST' || p.activeDs === 'AVL Tree' ? 'Binary Tree' : p.activeDs];
  const nodes = p.state && 'nodes' in p.state ? p.state.nodes : [];
  const selected = nodes.find(n => n.id === p.selected);
  const index = nodes.findIndex(n => n.id === p.selected);
  const parent = selected && nodes.find(n => ('left' in n && n.left === selected.id) || ('right' in n && n.right === selected.id));
  const children = selected && 'left' in selected && 'right' in selected ? nodes.filter(n => n.id === selected.left || n.id === selected.right) : [];
  const count = p.state && ('elements' in p.state ? p.state.elements.length : 'nodes' in p.state ? p.state.nodes.length : p.state.buckets.reduce((sum, b) => sum + b.entries.length, 0));
  const step = p.steps[p.step];
  return <section className="structure-page">
    <nav className="st-breadcrumb" aria-label="Breadcrumb"><Link to="/learn">Learn</Link><ChevronRight/><Link to="/3d-visualizer">3D Data Structures</Link><ChevronRight/><span>{p.activeDs}</span></nav>
    <header className="st-header">
      <div className="st-heading"><span className="st-module-icon"><Box/></span><div><h1>{p.activeDs} Learning Module</h1><p>Interactive 3D Guided Tour</p></div></div>
      <select aria-label="Data structure" value={p.activeDs} onChange={e => p.onModule(e.target.value)}>{p.modules.map(name => <option key={name}>{name}</option>)}</select>
      <div className="st-playback" aria-label="Guided tour controls">
        <button aria-label="Previous step" disabled={p.step === 0} onClick={() => p.onStep(p.step - 1)}><ChevronLeft/></button>
        <button className="st-primary" onClick={p.onPlay}>{p.playing ? <Pause/> : <Play/>}{p.playing ? 'Pause' : 'Play'}</button>
        <button aria-label="Next step" disabled={p.step >= p.steps.length - 1} onClick={() => p.onStep(p.step + 1)}><ChevronRight/></button>
        <button aria-label="Restart guided tour" onClick={p.onReset}><RotateCcw/></button>
        <button aria-label={p.guideHidden ? 'Show guide' : 'Hide guide'} aria-pressed={!p.guideHidden} onClick={p.onToggleGuide}>{p.guideHidden ? <EyeOff/> : <Eye/>}</button>
      </div>
    </header>
    <div className="st-mobile-tabs" aria-label="Page sections">{['Info', 'Visualizer', 'Code'].map(tab => <button key={tab} aria-pressed={mobileTab === tab} onClick={() => { if (tab === 'Code') p.onCode(); else setMobileTab(tab); }}>{tab}</button>)}</div>
    <div className="st-layout" data-mobile-tab={mobileTab}>
      <aside className="st-info st-panel">
        <h2><Info/> About {p.activeDs}</h2><p className="st-description">{info.desc}</p>
        <h3><Clock3/> Time complexity</h3><div className="st-complexity">{Object.entries(info.time).map(([name, value]) => <div key={name} data-operation={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
        {p.activeDs === 'Heap' && <small className="st-footnote">Access means peek at the root. Delete is O(log N) with a known index; finding a value takes O(N).</small>}
        <h3 className="st-positive"><CheckCircle2/> Advantages</h3><ul className="st-pros">{info.pros.map(text => <li key={text}>{text}</li>)}</ul>
        <h3 className="st-negative"><XCircle/> Disadvantages</h3><ul className="st-cons">{info.cons.map(text => <li key={text}>{text}</li>)}</ul>
        <h3><ListTree/> Common types</h3><div className="st-types">{info.types.map(type => <button key={type.name} aria-pressed={p.activeVariant === type.name} onClick={() => p.onVariant(type.name)}><span><strong>{type.name}</strong><small>{type.desc}</small></span><ChevronRight/></button>)}</div>
        <button className="st-primary st-code-button" onClick={p.onCode}><Code2/>View Code Implementations</button>
      </aside>
      <div className="st-visual-column">
        <section className="st-scene st-panel" aria-label={`${p.activeDs} interactive scene`}>
          <div className="st-scene-heading"><h2>{p.activeDs}: <span>{p.activeVariant}</span></h2><p>{info.types.find(t => t.name === p.activeVariant)?.desc}</p></div>
          <div className="st-stats"><span><Box/> Nodes: {count ?? 0}</span>{p.state?.type === 'heap' && <span><ListTree/> Height: {nodes.length ? Math.floor(Math.log2(nodes.length)) : 0}</span>}<span><Orbit/> Type: {p.activeVariant}</span></div>
          <div className="st-canvas">{p.children}</div>
          <div className="st-operations">{p.toolbar}</div>
          {selected && <div className="st-inspector"><button aria-label="Close node inspector" onClick={() => p.onSelect(null)}>×</button><strong>Value: {String(selected.value)}</strong><span>Index: {index}</span>{p.state?.type === 'linked-list' ? <><span>Previous: {index > 0 ? String(nodes[index - 1].value) : p.activeVariant === 'Circular Linked' ? String(nodes.at(-1)?.value) : 'None (head)'}</span><span>Next: {index < nodes.length - 1 ? String(nodes[index + 1].value) : p.activeVariant === 'Circular Linked' ? String(nodes[0]?.value) : 'null (tail)'}</span></> : <><span>Parent: {parent ? String(parent.value) : 'None (root)'}</span><span>Children: {children.length ? children.map(n => n.value).join(', ') : 'None'}</span></>}</div>}
          {!p.guideHidden && step && <div className="st-guide"><strong>{step.title}</strong><p>{step.text}</p><div><button aria-label="Previous explanation" disabled={p.step === 0} onClick={() => p.onStep(p.step - 1)}><ChevronLeft/></button><nav aria-label="Explanation steps">{p.steps.map((s, i) => <button key={i} aria-label={`Step ${i + 1}: ${s.title}`} aria-current={i === p.step ? 'step' : undefined} onClick={() => p.onStep(i)}/>)}</nav><button aria-label="Next explanation" disabled={p.step === p.steps.length - 1} onClick={() => p.onStep(p.step + 1)}><ChevronRight/></button></div></div>}
          <div className="st-scene-footer"><span>Drag to rotate · Scroll to zoom</span><button onClick={p.onCameraReset}><RotateCcw/>Reset camera</button></div>
        </section>
        <div className="st-scene-options"><span className="st-live">3D Active · Real-time updates</span><button aria-pressed={p.reducedMotion} onClick={p.onMotion}>Reduced motion: {p.reducedMotion ? 'on' : 'off'}</button><button aria-expanded={treeView} onClick={() => setTreeView(v => !v)}>Accessible data view</button></div>
        <p className="st-status" role="status">{p.status}</p>
        {p.state?.type === 'heap' && <div className="st-array" aria-label="Heap array, click to inspect">{nodes.map((n, i) => <button key={n.id} aria-label={`Index ${i}, value ${n.value}`} aria-pressed={p.selected === n.id} onClick={() => p.onSelect(n.id)}><strong>{String(n.value)}</strong><small>{i}</small></button>)}{!nodes.length && <span>Empty heap. Insert a value to begin.</span>}</div>}
        {treeView && <div className="st-data st-panel"><h2>Current {p.activeDs}</h2>{nodes.length ? <table><thead><tr><th>Index</th><th>Value</th><th>Children</th><th>Inspect</th></tr></thead><tbody>{nodes.map((n, i) => <tr key={n.id}><td>{i}</td><td>{String(n.value)}</td><td>{'left' in n && 'right' in n ? nodes.filter(c => c.id === n.left || c.id === n.right).map(c => c.value).join(', ') || 'None' : '—'}</td><td><button onClick={() => p.onSelect(n.id)}>Inspect {String(n.value)}</button></td></tr>)}</tbody></table> : <p>{p.state && 'elements' in p.state ? p.state.elements.map(n => n.value).join(', ') || 'Empty' : p.state?.type === 'hash-table' ? p.state.buckets.map((b, i) => `${i}: ${b.entries.map(e => `${e.value}`).join(', ') || 'empty'}`).join(' | ') : 'Empty structure'}</p>}</div>}
      </div>
    </div>
  </section>;
}
