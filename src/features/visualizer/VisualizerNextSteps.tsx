import { Link } from 'react-router-dom';
import { visualizerTopics } from '../../services/visualizerProgress';
import './visualizer-learning.css';

export default function VisualizerNextSteps({ name, module, onCode }: { name: string; module: {completed:boolean;totalSteps:number;completedStepCount:number}; onCode: () => void }) {
  const topic = visualizerTopics[name];
  return <section className="visualizer-learning" aria-label="Continue learning">
    <div><h2>Continue Learning</h2><p>{module.completed ? 'Visualization complete' : `${module.completedStepCount} of ${module.totalSteps} guided steps explored`}</p>
      {!module?.completed && <small>Explore every guided step and {name === 'Heap' ? 'successfully insert or delete a value' : 'inspect a node or cell using the scene or Accessible data view'} to complete this visualization.</small>}</div>
    <nav aria-label="Next learning steps">
      <Link to={`/learn/${name === 'AVL Tree' ? 'avl-tree' : topic.topicId}`}>Read {name} Lesson</Link>
      <button onClick={onCode}>View Code</button>
      <Link to={`/coding?topic=${encodeURIComponent(name === 'Hash Table' ? 'Hash' : name === 'BST' || name === 'AVL Tree' || name === 'Binary Tree' ? 'Tree' : name)}`}>Practice {name} Problems</Link>
      <Link to={`/quiz?topic=${encodeURIComponent(topic.quiz)}`}>{name === 'Heap' ? 'Take related Binary Trees Quiz' : 'Take Quiz'}</Link>
    </nav>
  </section>;
}
