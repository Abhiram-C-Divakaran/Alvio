import {useMemo,useState} from 'react';
import {sortingTraces} from './compare';
export default function CompareApproaches({values}:{values:(string|number)[]}){
 const numeric=values.filter((v):v is number=>typeof v==='number').slice(0,20);
 const traces=useMemo(()=>sortingTraces(numeric),[JSON.stringify(numeric)]);
 const [progress,setProgress]=useState(0);
 const max=Math.max(1,...numeric.map(Math.abs));
 return <details className="viz-compare"><summary>Compare Approaches · same input</summary><p>Run three instrumented sorts on the same values. The timeline aligns relative progress; counts come from each algorithm’s executed operations, not timing estimates. Up to 20 numeric values.</p><label>Comparison timeline<input type="range" min="0" max="100" value={progress} onChange={e=>setProgress(Number(e.target.value))}/></label><div className="viz-comparison-grid">{Object.entries(traces).map(([name,frames])=>{const frame=frames[Math.round(progress/100*(frames.length-1))];return <section key={name}><h3>{name==='bubble'?'Bubble Sort':name==='merge'?'Merge Sort':'Quick Sort'}</h3><div className="viz-sort-bars">{frame.values.map((n,i)=><div key={i} className={frame.active.includes(i)?'active':''} style={{height:18+Math.abs(n)/max*62}}>{n}</div>)}</div><p>{frame.comparisons} comparisons · {frame.swaps} swaps · {frame.writes} writes</p><p>{name==='bubble'?'O(n²) worst · O(1) extra space':name==='merge'?'O(n log n) · O(n) extra space':'O(n log n) average / O(n²) worst · recursive stack'}</p></section>;})}</div></details>;
}
