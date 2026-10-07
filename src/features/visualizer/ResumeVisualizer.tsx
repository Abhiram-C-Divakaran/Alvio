import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import { latestVisualizer, visualizerTopics } from '../../services/visualizerProgress';
import './visualizer-learning.css';

export default function ResumeVisualizer() {
  const owner = useAuthStore(s => s.user?.id || 'guest');
  const progress = useProgressStore(s => s.progress);
  const module = latestVisualizer(progress?.userId === owner ? progress : null);
  if (!module) return null;
  const name = Object.keys(visualizerTopics).find(name => visualizerTopics[name].id === module.moduleId)!;
  return <aside className="visualizer-learning visualizer-resume" aria-label="Continue where you left off">
    <div><small>Continue where you left off</small><h2>{module.completed ? 'Revisit' : 'Continue'} {name} Visualization</h2><p>{module.variant} · Step {module.currentStep + 1} of {module.totalSteps}{module.completed ? ' · Visualization complete' : ''}</p></div>
    <Link to={`/3d-visualizer?ds=${encodeURIComponent(name)}`}>Open visualization →</Link>
  </aside>;
}
