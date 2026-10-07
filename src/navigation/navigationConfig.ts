import { Home, Layers, Sparkles, Code2, BookOpen, Box, UserRound, Trophy, BrainCircuit, Video, TrendingUp, Terminal, ListChecks, Swords, HelpCircle, Bookmark, type LucideIcon } from 'lucide-react';
import { structures } from '../features/learn/catalog/structureCatalog';
import { algorithms } from '../features/learn/algorithms/model';

export type AppSection = 'dashboard' | 'learn' | 'practice' | 'ai';
export type NavigationItem = { id:string; label:string; description?:string; path:string; section:AppSection; group:string; icon:LucideIcon; match?:(url:URL)=>boolean };
const under = (path:string, root:string) => path === root || path.startsWith(root + '/');
export function appSection(path:string):AppSection {
  if (under(path,'/learn/ai-visualizer') || under(path,'/ai-tools') || under(path,'/ai-tutor') || under(path,'/mock-interview')) return 'ai';
  if (under(path,'/coding') || under(path,'/quiz') || under(path,'/workspace/pvp')) return 'practice';
  if (under(path,'/learn') || ['/catalog','/skill-tree','/workspace','/video-learning','/3d-visualizer','/algorithms-visualizer'].includes(path)) return 'learn';
  return 'dashboard';
}
export const globalNavigation = [
  {section:'dashboard',label:'Dashboard',path:'/dashboard'}, {section:'learn',label:'Learn',path:'/learn'},
  {section:'practice',label:'Practice',path:'/coding'}, {section:'ai',label:'AI Tools',path:'/ai-tutor'},
] as const;
const algoParents = ['/learn/sorting','/learn/searching','/learn/divide-conquer','/learn/dynamic-programming','/learn/greedy','/learn/graph-algorithms'];
export const navigation:NavigationItem[] = [
  {id:'dashboard',label:'Dashboard',path:'/dashboard',section:'dashboard',group:'OVERVIEW',icon:Home,match:u=>u.pathname==='/dashboard'&&!u.hash},
  {id:'progress',label:'My Progress',path:'/progress',section:'dashboard',group:'OVERVIEW',icon:TrendingUp},
  {id:'achievements',label:'Achievements',path:'/dashboard#achievements',section:'dashboard',group:'OVERVIEW',icon:Trophy,match:u=>u.pathname==='/dashboard'&&u.hash==='#achievements'},
  {id:'profile',label:'My Profile',path:'/profile',section:'dashboard',group:'OVERVIEW',icon:UserRound},
  {id:'map',label:'Learning Map',description:'Your DSA journey',path:'/learn',section:'learn',group:'LEARN',icon:Sparkles,match:u=>['/learn','/learn/skill-tree','/skill-tree'].includes(u.pathname)},
  {id:'structures',label:'Data Structures',description:'Structures & fundamentals',path:'/learn/data-structures',section:'learn',group:'LEARN',icon:Layers,match:u=>u.pathname==='/learn/data-structures'||structures.some(s=>s.route===u.pathname)||under(u.pathname,'/learn/topic')||['/catalog','/workspace'].includes(u.pathname)},
  {id:'algorithms',label:'Algorithms',description:'Patterns & problem solving',path:'/learn/algorithms',section:'learn',group:'LEARN',icon:Code2,match:u=>under(u.pathname,'/learn/algorithms')||algoParents.includes(u.pathname)},
  {id:'videos',label:'Video Lessons',description:'Guided explanations',path:'/video-learning',section:'learn',group:'LEARN VISUALLY',icon:Video},
  {id:'structures3d',label:'3D Data Structures',description:'Explore structures in 3D',path:'/3d-visualizer',section:'learn',group:'LEARN VISUALLY',icon:Box},
  {id:'algorithms3d',label:'3D Algorithms',description:'Watch algorithms execute',path:'/algorithms-visualizer',section:'learn',group:'LEARN VISUALLY',icon:Box},
  {id:'complexity',label:'Complexity Lab',description:'Analyze time & space',path:'/learn/complexity',section:'learn',group:'LEARN VISUALLY',icon:TrendingUp},
  {id:'playground',label:'Coding Playground',path:'/coding',section:'practice',group:'PRACTICE',icon:Terminal,match:u=>u.pathname==='/coding'&&!u.searchParams.get('view')},
  {id:'problems',label:'Problem Set',path:'/coding?view=all',section:'practice',group:'PRACTICE',icon:ListChecks,match:u=>u.pathname==='/coding'&&u.searchParams.get('view')==='all'},
  {id:'pvp',label:'PvP Coding Duel',path:'/workspace/pvp',section:'practice',group:'PRACTICE',icon:Swords,match:u=>u.pathname==='/workspace/pvp'&&!u.hash&&u.searchParams.get('view')!=='leaderboard'},
  {id:'quiz',label:'Quizzes',path:'/quiz',section:'practice',group:'PRACTICE',icon:HelpCircle},
  {id:'contests',label:'Contests',path:'/workspace/pvp#duel-actions',section:'practice',group:'PRACTICE',icon:Trophy,match:u=>u.pathname==='/workspace/pvp'&&u.hash==='#duel-actions'},
  {id:'bookmarks',label:'Bookmarks',path:'/coding?view=bookmarks',section:'practice',group:'YOUR LIBRARY',icon:Bookmark,match:u=>u.pathname==='/coding'&&u.searchParams.get('view')==='bookmarks'},
  {id:'leaderboard',label:'Leaderboard',path:'/workspace/pvp?view=leaderboard',section:'practice',group:'YOUR LIBRARY',icon:Trophy,match:u=>u.pathname==='/workspace/pvp'&&u.searchParams.get('view')==='leaderboard'},
  {id:'aiVisualizer',label:'AI Visualizer',description:'Turn problems into visual explanations',path:'/learn/ai-visualizer',section:'ai',group:'AI TOOLS',icon:Box},
  {id:'tutor',label:'AI Tutor',description:'Ask questions and learn concepts',path:'/ai-tutor',section:'ai',group:'AI TOOLS',icon:BrainCircuit},
  {id:'interview',label:'Mock Interview',description:'Practice technical interviews',path:'/mock-interview',section:'ai',group:'AI TOOLS',icon:UserRound},
];
export const activeNavigation = (url:URL) => navigation.find(n=>n.section===appSection(url.pathname)&&(n.match?n.match(url):under(url.pathname,n.path)));
export function searchNavigation(query:string) {
  const q=query.trim().toLowerCase();
  const lessons=[...structures.map(s=>({label:s.title,path:s.route,keywords:s.aliases.join(' ')})),...algorithms.map(a=>({label:a.name,path:a.lessonRoute,keywords:a.keywords}))];
  const matches=lessons.filter(s=>`${s.label} ${s.keywords}`.toLowerCase().includes(q)).slice(0,6);
  return [...matches.map(s=>({...s,group:'LEARN',icon:BookOpen})),
    {label:q?`Find problems about “${query.trim()}”`:'Browse problems',path:q?`/coding?q=${encodeURIComponent(query.trim())}`:'/coding?view=all',group:'PRACTICE',icon:Code2},
    {label:q?`Ask AI Tutor about “${query.trim()}”`:'Open AI Tutor',path:q?`/ai-tutor?question=${encodeURIComponent(`Explain ${query.trim()}`)}`:'/ai-tutor',group:'AI',icon:BrainCircuit}];
}
