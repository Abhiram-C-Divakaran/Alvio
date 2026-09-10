import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import { dashboardData } from './dashboardData';
import { AchievementsCard, AIToolsCard, ContinueLearningCard, LearningActivityChart, LearningIllustration, Metrics, RecentActivityCard, Recommendations, SkillMasteryCard } from './DashboardCards';
import './dashboard.css';
export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const { progress, stats } = useProgressStore();
  const data = dashboardData(progress, stats);
  const hour = new Date().getHours();
  return <div className="ad-page">
    <div className="ad-greeting"><Link className="ad-my-progress" aria-label="My Progress" to="/progress">My Progress →</Link>
      <h1>Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {user?.name?.trim().split(/\s+/)[0] || 'learner'} <span className="ad-wave" aria-hidden="true">👋</span>
      </h1>
      <p>Ready to keep building your problem-solving skills?</p>
    </div>
    <div className="ad-hero">
      <ContinueLearningCard data={data} />
      <LearningIllustration />
    </div>
    <Metrics data={data} />
    <div className="ad-content-grid">
      <LearningActivityChart data={data} />
      <SkillMasteryCard data={data} />
      <RecentActivityCard data={data} />
      <Recommendations data={data} />
      <AIToolsCard />
      <AchievementsCard data={data} />
    </div>
    <footer className="ad-page-footer">A better you, one problem at a time. <span>♥</span>
    </footer>
  </div>;
}
