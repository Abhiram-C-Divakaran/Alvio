export interface SortFrame {values:number[];comparisons:number;swaps:number;writes:number;active:number[]}
/** Instrumented algorithms, never generated code. Counts represent executed operations. */
export function sortingTraces(input:number[]){
 const run=(kind:'bubble'|'merge'|'quick')=>{
  const a=[...input],frames:SortFrame[]=[];let comparisons=0,swaps=0,writes=0;
  const emit=(active:number[]=[])=>frames.push({values:[...a],comparisons,swaps,writes,active});
  const compare=(i:number,j:number)=>{comparisons++;emit([i,j]);return a[i]-a[j];};
  const swap=(i:number,j:number)=>{if(i!==j){[a[i],a[j]]=[a[j],a[i]];swaps++;writes+=2;emit([i,j]);}};
  emit();
  if(kind==='bubble')for(let end=a.length-1;end>0;end--){let changed=false;for(let i=0;i<end;i++)if(compare(i,i+1)>0){swap(i,i+1);changed=true;}if(!changed)break;}
  if(kind==='quick'){
   const sort=(lo:number,hi:number)=>{if(lo>=hi)return;let p=lo;for(let i=lo;i<hi;i++)if(compare(i,hi)<=0)swap(i,p++);swap(p,hi);sort(lo,p-1);sort(p+1,hi);};sort(0,a.length-1);
  }
  if(kind==='merge'){
   const sort=(lo:number,hi:number)=>{if(hi-lo<=1)return;const mid=Math.floor((lo+hi)/2);sort(lo,mid);sort(mid,hi);const result:number[]=[];let i=lo,j=mid;while(i<mid&&j<hi){comparisons++;emit([i,j]);result.push(a[i]<=a[j]?a[i++]:a[j++]);}while(i<mid)result.push(a[i++]);while(j<hi)result.push(a[j++]);result.forEach((v,k)=>{a[lo+k]=v;writes++;emit([lo+k]);});};sort(0,a.length);
  }
  emit();return frames;
 };
 return {bubble:run('bubble'),merge:run('merge'),quick:run('quick')};
}
