import {useEffect, useState, type ReactNode} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {useThree} from '@react-three/fiber';
import {Box, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Eye, EyeOff, Code2, Info, Clock3} from 'lucide-react';
import {ALGO_META, type AlgoType} from '../learn/algorithms/metadata';
import './structure-layout.css';
import './algorithm-module.css';

export function AlgorithmCamera({revision, algorithm}:{revision:number;algorithm:AlgoType}) {
  const {camera, controls, size}=useThree();
  useEffect(()=>{
    const type=ALGO_META[algorithm].type;
    const linear=type==='sorting'||type==='searching';
    const width=linear?18:12;
    const distance=Math.max(14,width/(2*Math.tan(Math.PI/8)*(size.width/Math.max(size.height,1)))*1.15);
    camera.position.set(0,4,distance);
    const orbit=controls as unknown as {target:{set:(x:number,y:number,z:number)=>void};update:()=>void}|undefined;
    orbit?.target.set(0,0,0);orbit?.update();
  },[revision,algorithm,camera,controls,size.width,size.height]);
  return null;
}

interface Props {
  activeAlgo:AlgoType;onAlgorithm:(value:AlgoType)=>void;playing:boolean;onPlay:()=>void;
  current:number;total:number;onPrevious:()=>void;onNext:()=>void;onReset:()=>void;onSeek:(value:number)=>void;
  speed:number;onSpeed:(value:number)=>void;showGuide:boolean;onGuide:()=>void;onCamera:()=>void;
  target:string;onTarget:(value:string)=>void;onShuffle:()=>void;description:string;
  values:number[];active:number[];sorted:number[];code:string[];codeLine?:number;children:ReactNode;
}
export default function AlgorithmModuleLayout(p:Props) {
  const info=ALGO_META[p.activeAlgo];
  const [tab,setTab]=useState('Visualizer');
  const [dataView,setDataView]=useState(false);
  const [params,setParams]=useSearchParams();
  const isArray=info.type==='sorting'||info.type==='searching';
  return <section className="structure-page algorithm-module">
    <nav className="st-breadcrumb" aria-label="Breadcrumb"><Link to="/learn">Learn</Link><ChevronRight/><Link to="/algorithms-visualizer">3D Algorithms</Link><ChevronRight/><span>{info.name}</span></nav>
    <header className="st-header"><div className="st-heading"><span className="st-module-icon"><Box/></span><div><h1>{info.name} Learning Module</h1><p>Interactive 3D Algorithm Walkthrough</p></div></div>
      <select aria-label="Algorithm" value={p.activeAlgo} onChange={e=>{const value=e.target.value as AlgoType;p.onAlgorithm(value);const next=new URLSearchParams(params);next.set('algo',value);setParams(next,{replace:true});}}>{Object.entries(ALGO_META).map(([id,meta])=><option key={id} value={id}>{meta.name}</option>)}</select>
      <div className="st-playback"><button aria-label="Previous step" disabled={!p.current} onClick={p.onPrevious}><ChevronLeft/></button><button className="st-primary" onClick={p.onPlay} disabled={!p.total}>{p.playing?<Pause/>:<Play/>}{p.playing?'Pause':'Play'}</button><button aria-label="Next step" disabled={p.current>=p.total-1} onClick={p.onNext}><ChevronRight/></button><button aria-label="Restart algorithm" onClick={p.onReset}><RotateCcw/></button><button aria-label={p.showGuide?'Hide guide':'Show guide'} onClick={p.onGuide}>{p.showGuide?<Eye/>:<EyeOff/>}</button></div>
    </header>
    <div className="am-tabs" aria-label="Module sections">{['Info','Visualizer','Code'].map(value=><button key={value} aria-pressed={tab===value} onClick={()=>setTab(value)}>{value}</button>)}</div>
    <div className="st-layout am-layout" data-tab={tab}>
      <aside className="st-info st-panel"><h2><Info/>About {info.name}</h2><p className="st-description">{info.description}</p><div className="am-badges"><span>{info.type}</span><span>{info.difficulty}</span></div><h3><Clock3/>Complexity</h3><div className="st-complexity">{Object.entries(info.timeComplexities).map(([label,value])=><div key={label}><span>{label==='space'?'Auxiliary space':`${label} case`}</span><strong>{value}</strong></div>)}</div>
        <h3>Follow the algorithm</h3><ol className="am-instructions"><li>Use Play or advance one step at a time.</li><li>Read the explanation and watch the highlighted elements.</li><li>Scrub the timeline to revisit a step.</li><li>Open Code to follow the current line.</li></ol>
        <h3>Visual key</h3><div className="am-legend"><span><i style={{background:'#fbbf24'}}/>Compare / current</span><span><i style={{background:'#f87171'}}/>Swap / update</span><span><i style={{background:'#34d399'}}/>Sorted / visited</span></div>
        <button className="st-primary st-code-button" onClick={()=>setTab(tab==='Code'?'Visualizer':'Code')}><Code2/>{tab==='Code'?'Return to Visualizer':'View Code Implementation'}</button><Link className="am-lesson-link" to={`/learn/algorithms/${p.activeAlgo}`}>Open algorithm lesson <ChevronRight/></Link>
      </aside>
      <div className="st-visual-column am-visual">
        <section className="st-panel st-scene am-scene"><div className="st-scene-heading"><h2>{info.name}</h2><p>{info.description}</p></div><div className="st-stats"><span>Step {p.current+1} / {p.total}</span><span>{info.type}</span></div>
          <div className="st-operations am-operations">{info.type==='searching'&&<label>Target <input aria-label="Search target" type="number" value={p.target} onChange={e=>p.onTarget(e.target.value)}/></label>}{isArray&&<button onClick={p.onShuffle}><RotateCcw/>Shuffle data</button>}<label>Speed <select aria-label="Playback speed" value={p.speed} onChange={e=>p.onSpeed(Number(e.target.value))}><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label></div>
          <div className="st-canvas">{p.children}</div>
          {p.showGuide&&<div className="st-guide"><strong>Step {p.current+1} of {p.total}</strong><p aria-live={p.playing?'off':'polite'}>{p.description}</p><input aria-label="Algorithm timeline" type="range" min={0} max={Math.max(0,p.total-1)} value={p.current} onChange={e=>p.onSeek(Number(e.target.value))}/></div>}
          <div className="st-scene-footer"><span>Drag to rotate · Scroll to zoom</span><button onClick={p.onCamera}><RotateCcw/>Reset camera</button></div>
        </section>
        <div className="st-scene-options"><span className="st-live">3D Active · Step-by-step playback</span><button aria-expanded={dataView} onClick={()=>setDataView(v=>!v)}>Accessible step view</button></div>
        {dataView&&<div className="st-data st-panel"><h2>Step {p.current+1}</h2><p>{p.description}</p>{isArray&&<div className="st-array">{p.values.map((value,index)=><span key={index}><strong>{value}</strong><small>Index {index}{p.active.includes(index)?' · Comparing':p.sorted.includes(index)?' · Sorted':''}</small></span>)}</div>}</div>}
      </div>
      {tab==='Code'&&<section className="st-panel am-code"><h2><Code2/>{info.name} · Reference code</h2><p>Highlighted line follows the current algorithm step.</p><pre tabIndex={0} aria-label="Algorithm reference code">{p.code.map((line,index)=><div key={index} className={index+1===p.codeLine?'active':''}><span>{index+1}</span>{line||' '}</div>)}</pre><p className="am-code-explanation">{p.description}</p></section>}
    </div>
  </section>;
}
