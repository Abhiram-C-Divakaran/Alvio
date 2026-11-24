export type TopicStatus = 'Completed' | 'In Progress' | 'Locked' | 'Not Started';

export interface CurriculumTopic {
  id: string;
  path: string;
  name: string;
  description: string;
  status: TopicStatus;
  progress?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Fundamentals' | 'Advanced';
  prerequisites: string[];
  lessons: number;
  visualizations: number;
  practiceProblems: number;
  estimatedTime: string;
  color: string;
  secondaryColor: string;
  hasRing: boolean;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  initialAngle: number;
}

export const curriculumData: CurriculumTopic[] = [
  {
    id: 'arrays',
    path: '/learn/array',
    name: 'Arrays',
    description: 'A collection of items stored at contiguous memory locations.',
    status: 'Completed',
    difficulty: 'Easy',
    category: 'Fundamentals',
    prerequisites: ['basic-programming'],
    lessons: 4,
    visualizations: 3,
    practiceProblems: 10,
    estimatedTime: '2h 15m',
    color: '#36c978',
    secondaryColor: '#1e7e48',
    hasRing: false,
    orbitRadius: 2.25,
    orbitSpeed: 0.11,
    size: 0.32,
    initialAngle: (80 * Math.PI) / 180,
  },
  {
    id: 'linked-lists',
    path: '/learn/linked-list',
    name: 'Linked Lists',
    description: 'A linear data structure where each element points to the next element in the sequence.',
    status: 'In Progress',
    progress: 65,
    difficulty: 'Easy',
    category: 'Fundamentals',
    prerequisites: ['arrays', 'basic-programming'],
    lessons: 6,
    visualizations: 2,
    practiceProblems: 12,
    estimatedTime: '3h 20m',
    color: '#863cff',
    secondaryColor: '#581c87',
    hasRing: true,
    orbitRadius: 2.90,
    orbitSpeed: 0.09,
    size: 0.40,
    initialAngle: (155 * Math.PI) / 180,
  },
  {
    id: 'stacks',
    path: '/learn/stack',
    name: 'Stacks',
    description: 'A linear data structure that follows a particular order in which the operations are performed (LIFO).',
    status: 'In Progress',
    progress: 45,
    difficulty: 'Easy',
    category: 'Fundamentals',
    prerequisites: ['linked-lists'],
    lessons: 3,
    visualizations: 2,
    practiceProblems: 8,
    estimatedTime: '1h 45m',
    color: '#348cff',
    secondaryColor: '#1d5ec4',
    hasRing: true,
    orbitRadius: 3.55,
    orbitSpeed: 0.075,
    size: 0.44,
    initialAngle: (25 * Math.PI) / 180,
  },
  {
    id: 'queues',
    path: '/learn/queue',
    name: 'Queues',
    description: 'A linear data structure that follows a particular order in which the operations are performed (FIFO).',
    status: 'In Progress',
    progress: 30,
    difficulty: 'Easy',
    category: 'Fundamentals',
    prerequisites: ['linked-lists'],
    lessons: 4,
    visualizations: 2,
    practiceProblems: 10,
    estimatedTime: '2h 00m',
    color: '#349fff',
    secondaryColor: '#0c69ba',
    hasRing: true,
    orbitRadius: 4.15,
    orbitSpeed: 0.064,
    size: 0.35,
    initialAngle: (330 * Math.PI) / 180,
  },
  {
    id: 'hash-tables',
    path: '/learn/hash-table',
    name: 'Hash Tables',
    description: 'Data structure that implements an associative array abstract data type, a structure that can map keys to values.',
    status: 'Completed',
    difficulty: 'Medium',
    category: 'Advanced',
    prerequisites: ['arrays'],
    lessons: 5,
    visualizations: 3,
    practiceProblems: 15,
    estimatedTime: '4h 00m',
    color: '#f4a321',
    secondaryColor: '#a15c0e',
    hasRing: true,
    orbitRadius: 5.90,
    orbitSpeed: 0.047,
    size: 0.72,
    initialAngle: (205 * Math.PI) / 180,
  },
  {
    id: 'trees',
    path: '/learn/binary-tree',
    name: 'Trees',
    description: 'A widely used abstract data type that simulates a hierarchical tree structure.',
    status: 'Locked',
    difficulty: 'Medium',
    category: 'Advanced',
    prerequisites: ['linked-lists'],
    lessons: 8,
    visualizations: 4,
    practiceProblems: 20,
    estimatedTime: '6h 30m',
    color: '#e94b87',
    secondaryColor: '#96234f',
    hasRing: true,
    orbitRadius: 6.80,
    orbitSpeed: 0.038,
    size: 0.66,
    initialAngle: (245 * Math.PI) / 180,
  },
  {
    id: 'graphs',
    path: '/learn/graph',
    name: 'Graphs',
    description: 'A non-linear data structure consisting of nodes and edges.',
    status: 'Locked',
    difficulty: 'Hard',
    category: 'Advanced',
    prerequisites: ['trees'],
    lessons: 10,
    visualizations: 5,
    practiceProblems: 25,
    estimatedTime: '8h 00m',
    color: '#733bd8',
    secondaryColor: '#451f8a',
    hasRing: true,
    orbitRadius: 7.65,
    orbitSpeed: 0.030,
    size: 0.56,
    initialAngle: (285 * Math.PI) / 180,
  }
];
