import {useRef,useMemo} from 'react';
import * as THREE from 'three';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,Line,Html} from '@react-three/drei';
import {curves,height,value,type Mode} from './data';
function AnimatedMarker({c,n,mode,z,playing}:{c:typeof curves[number];n:number;mode:Mode;z:number;playing:boolean}){
const ref=useRef<THREE.Mesh>(null),phase=useRef(0);
useFrame((_,dt)=>{if(!playing||!ref.current)return;phase.current=(phase.current+Math.min(dt,.05)/6)%1;const x=1+(n-1)*phase.current;ref.current.position.set(x/10,height(value(c,x,mode)),z)});
return <mesh ref={ref} position={[.1,height(value(c,1,mode)),z]}><sphereGeometry args={[.12,20,20]}/><meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={2}/></mesh>;
}
function Tube({points,color}:{points:[number,number,number][];color:string}){const path=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'),[points]);return <mesh><tubeGeometry args={[path,120,.025,8,false]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.6} metalness={.35} roughness={.25}/></mesh>}
export default function Graph({n,mode,visible,selected,onSelect,onHover,reset,playing}:{n:number;mode:Mode;visible:string[];selected:string|null;onSelect:(id:string)=>void;onHover:(id:string|null)=>void;reset:number;playing:boolean}){
return <Canvas key={reset} camera={{position:[8,6,13],fov:36}} dpr={[1,1.5]} frameloop={playing?"always":"demand"}><color attach="background" args={['#06101e']}/><ambientLight intensity={.7}/><directionalLight position={[3,9,8]} intensity={2}/><pointLight position={[-7,4,1]} color="#559aff" intensity={15}/><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array(Array.from({length:180},(_,i)=> i%3===0?Math.sin(i*17)*13:i%3===1?Math.cos(i*13)*8:-8-Math.abs(Math.sin(i))*4)),3]}/></bufferGeometry><pointsMaterial color="#7794e3" size={.035} transparent opacity={.5}/></points><group position={[-7,-2,0]} scale={[1.4,1,1]}><mesh rotation={[-Math.PI/2,0,0]} position={[5,-.04,-.5]}><planeGeometry args={[10,5]}/><meshStandardMaterial color="#0d2037" metalness={.3} roughness={.65}/></mesh>
{Array.from({length:11},(_,i)=><group key={i}><Line points={[[i,0,-3],[i,0,2]]} color="#1b3553" lineWidth={.6}/><Line points={[[i,0,-3],[i,6,-3]]} color="#1b3553" lineWidth={.6}/></group>)}
{Array.from({length:7},(_,i)=><group key={i}><Line points={[[0,i,-3],[10,i,-3]]} color="#1b3553" lineWidth={.6}/><Line points={[[0,0,2-i*.83],[10,0,2-i*.83]]} color="#1b3553" lineWidth={.6}/></group>)}
<Line points={[[0,6.5,2],[0,0,2],[10.5,0,2]]} color="#a5c5ef"/><Line points={[[10,0,2],[10,0,-3.5]]} color="#a5c5ef"/>
{[0,2,4,6].map(i=><Html key={i} position={[-.35,i,2]} center><span className="cx-axis">10<sup>{i}</sup></span></Html>)}
{[1,20,40,60,80,100].map(i=><Html key={i} position={[i/10,-.4,2]} center><span className="cx-axis">{i}</span></Html>)}
<Html position={[5,-1,2]} center><span className="cx-axis">Input Size (N)</span></Html><Html position={[-1.1,3,2]} center><span className="cx-axis">{mode==='time'?'Operations':'Storage units'} (log₁₀)</span></Html><Html position={[11,0,-1]} center><span className="cx-axis">Complexity Dimension</span></Html>
{curves.filter(c=>visible.includes(c.id)).map(c=>{const index=curves.indexOf(c),z=1.7-index*.8;const points=Array.from({length:100},(_,i)=>{const x=1+(n-1)*i/99;return [x/10,height(value(c,x,mode)),z] as [number,number,number]});const end=points[99];return <group key={c.id}><Tube points={points} color={c.color}/><AnimatedMarker c={c} n={n} mode={mode} z={z} playing={playing}/><Line points={points} color={c.color} lineWidth={selected===c.id?5:2.5} onClick={()=>onSelect(c.id)} onPointerOver={()=>onHover(c.id)} onPointerOut={()=>onHover(null)}/><mesh position={end} onClick={()=>onSelect(c.id)} onPointerOver={()=>onHover(c.id)} onPointerOut={()=>onHover(null)}><sphereGeometry args={[.09,16,16]}/><meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={1.3}/></mesh><Html position={[end[0]+.25,end[1]+.2,z]}><button className="cx-curve-label" style={{color:c.color}} onClick={()=>onSelect(c.id)}>{c.label}</button></Html></group>})}</group><OrbitControls makeDefault target={[0,1,0]} enablePan={false} minDistance={13} maxDistance={27} minPolarAngle={.55} maxPolarAngle={1.35} minAzimuthAngle={-.5} maxAzimuthAngle={.9} enableDamping={playing} dampingFactor={.09}/></Canvas>;
}


