import type {Snapshot,Structure,NodeState} from '../model';
export const colors:Record<NodeState,string>={idle:'#4169b2',active:'#9a6cff',comparing:'#fbbf24',visited:'#34d399',found:'#22d3ee',removed:'#fb7185'};
export function nodeCaption(structure:Structure,index:number,count:number,row?:number,col?:number){
 if(structure==='stack')return index===count-1?'Top':`Frame ${index}`;
 if(structure==='queue'||structure==='deque')return index===0?'Front':index===count-1?'Rear':`Index ${index}`;
 if(structure==='matrix'||structure==='dp-table')return `Row ${row}, Col ${col}`;
 if(['binary-tree','bst','avl','heap','graph','trie','recursion-tree','hash-table'].includes(structure))return '';
 return `${structure==='string'?'Character':'Index'} ${index}`;
}
export function layout(state:Snapshot,structure:Structure){
  const positions=new Map<string,[number,number]>(); const n=state.nodes.length;
  if(['binary-tree','bst','avl','heap','trie','recursion-tree'].includes(structure)){
    const incoming=new Set(state.edges.map(e=>e.to)); const seen=new Set<string>();let leaf=0;
    const visit=(id:string,depth:number):number=>{if(seen.has(id))return positions.get(id)?.[0]||0;seen.add(id);const children=state.edges.filter(e=>e.from===id&&!seen.has(e.to)); const xs=children.map(e=>visit(e.to,depth+1));const x=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:leaf++*2.5;positions.set(id,[x,-depth*2.4]);return x;};
    for(const node of [...state.nodes.filter(n=>!incoming.has(n.id)),...state.nodes])if(!seen.has(node.id))visit(node.id,0);
  }else if(structure==='graph')state.nodes.forEach((node,i)=>positions.set(node.id,[Math.cos(i*2*Math.PI/n)*Math.max(3,n*.45),Math.sin(i*2*Math.PI/n)*Math.max(3,n*.45)]));
  else if(['matrix','dp-table'].includes(structure))state.nodes.forEach((node,i)=>positions.set(node.id,[(node.col??i%5)*2,(node.row??Math.floor(i/5))*-1.8]));
  else if(structure==='stack')state.nodes.forEach((node,i)=>positions.set(node.id,[0,i*1.65]));
  else state.nodes.forEach((node,i)=>positions.set(node.id,[i*2.9,0]));
  const xs=[...positions.values()].map(p=>p[0]),ys=[...positions.values()].map(p=>p[1]);
  const cx=((Math.min(...xs)||0)+(Math.max(...xs)||0))/2,cy=((Math.min(...ys)||0)+(Math.max(...ys)||0))/2;
  positions.forEach(p=>{p[0]-=cx;p[1]-=cy;});
  return {positions,width:Math.max(12,(Math.max(...xs)-Math.min(...xs)||0)+4),height:Math.max(6,(Math.max(...ys)-Math.min(...ys)||0)+4)};
}
