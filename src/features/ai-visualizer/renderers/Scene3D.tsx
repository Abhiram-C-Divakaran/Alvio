import {Canvas,useFrame} from '@react-three/fiber';
import {Html,OrbitControls,RoundedBox,Line} from '@react-three/drei';
import {useRef} from 'react';
import type {Group} from 'three';
import type {Snapshot,Structure,VisualNode} from '../model';
import {layout,colors,nodeCaption} from './layout';
function Node({node,position,caption,onExplain,reduced,height=1.5}:{node:VisualNode;position:[number,number];caption:string;onExplain:(s:string)=>void;reduced:boolean;height?:number}){
 const initial=useRef<[number,number,number]>([position[0],position[1]+(reduced?0:.5),0]);
 const ref=useRef<Group>(null);useFrame((_,delta)=>{if(ref.current){const t=reduced?1:1-Math.exp(-delta*12);ref.current.position.x+=(position[0]-ref.current.position.x)*t;ref.current.position.y+=(position[1]-ref.current.position.y)*t;}});
 return <group ref={ref} position={initial.current}><RoundedBox args={[1.5,height,1.25]} radius={.12} smoothness={3} onClick={()=>onExplain(`node ${node.value}`)}><meshStandardMaterial color={colors[node.state]} emissive={colors[node.state]} emissiveIntensity={node.state==='active'?.45:.08} roughness={.6}/></RoundedBox><Html center position={[0,0,.7]}><button className="viz-node-label" onClick={()=>onExplain(`node ${node.value}`)}>{node.value}</button></Html><Html center position={[0,height/2+.4,0]}><span className="viz-node-caption">{node.label}</span></Html><Html center position={[0,-height/2-.4,0]}><span className="viz-node-caption">{caption}</span></Html></group>;
}
export default function Scene3D({state,structure,onExplain,onUnavailable}:{state:Snapshot;structure:Structure;onExplain:(s:string)=>void;onUnavailable:()=>void}){
 const {positions,width,height}=layout(state,structure);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 return <Canvas camera={{position:[0,2.3,Math.max(width*.5,height*1.1,structure.includes('linked-list')?7:8.5)],fov:45}} dpr={[1,1.5]} gl={{antialias:true}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onUnavailable();},{once:true});}}><color attach="background" args={['#081426']}/><ambientLight intensity={1.1}/><directionalLight position={[3,7,9]} intensity={2}/><pointLight position={[-8,2,4]} color="#8b5cf6" intensity={20}/><gridHelper args={[100,60,'#142540','#102039']} position={[0,-height/2,0]}/>
 <group position={structure.includes("linked-list")?[-1.4,0,0]:[0,0,0]}>{state.edges.map(e=>{const a=positions.get(e.from)!,b=positions.get(e.to)!;const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;const end:[number,number,number]=[b[0]-dx/d*.85,b[1]-dy/d*.85,0];return <group key={e.id}><Line points={[[a[0],a[1],0],end]} color={e.state==='active'?'#ad8aff':'#91adf1'} lineWidth={2} onClick={()=>onExplain(`link ${e.from} to ${e.to}`)}/>{e.directed&&<mesh position={end} rotation={[0,0,Math.atan2(dy,dx)-Math.PI/2]}><coneGeometry args={[.12,.35,8]}/><meshStandardMaterial color="#b6c7ff"/></mesh>}{e.weight!==undefined&&<Html center position={[(a[0]+b[0])/2,(a[1]+b[1])/2+.25,0]}><span className="viz-node-caption">{e.weight}</span></Html>}</group>;})}
 {state.nodes.map((node,i)=><Node key={node.id} node={node} position={positions.get(node.id)!} caption={nodeCaption(structure,i,state.nodes.length,node.row,node.col)} onExplain={onExplain} reduced={reduced} height={structure==='array'&&typeof node.value==='number'?.8+Math.abs(node.value)/Math.max(1,...state.nodes.map(n=>typeof n.value==='number'?Math.abs(n.value):1))*1.5:1.5}/>)}</group><OrbitControls enableDamping={!reduced} minDistance={3} maxDistance={150} makeDefault/></Canvas>;
}



