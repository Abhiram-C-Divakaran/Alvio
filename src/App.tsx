import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/layout/AuthGuard';
import LandingPage from './features/landing/LandingPage';








import './index.css';

const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const AuthPage = lazy(() => import('./features/auth/AuthPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const WorkspacePage = lazy(() => import('./features/workspace/WorkspacePage'));
const AiTutorPage = lazy(() => import('./features/ai-tutor/AiTutorPage'));
const MockInterviewPage = lazy(() => import('./features/ai-tutor/MockInterviewPage'));
const QuizPage = lazy(() => import('./features/quiz/QuizPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const ProgressPage = lazy(() => import('./features/progress/ProgressPage'));
const CatalogPage = lazy(() => import('./features/catalog/CatalogPage'));
const CodingPage = lazy(() => import('./features/coding/CodingPage'));
const VisualizerPage = lazy(() => import('./features/visualizer/VisualizerPage'));
const VideoLearningPage = lazy(() => import('./features/video-learning/VideoLearningPage'));
const SkillTreeMap = lazy(() => import('./features/learn/SkillTreeMap'));
const PvPShowdown = lazy(() => import('./features/workspace/PvPShowdown'));
const DataStructuresHubPage = lazy(() => import('./features/learn/DataStructuresHubPage'));
const ArrayPage = lazy(() => import('./features/learn/ArrayPage'));
const LinkedListPage = lazy(() => import('./features/learn/LinkedListPage'));
const StackPage = lazy(() => import('./features/learn/StackPage'));
const QueuePage = lazy(() => import('./features/learn/QueuePage'));
const BinaryTreePage = lazy(() => import('./features/learn/BinaryTreePage'));
const AvlTreePage = lazy(() => import('./features/learn/AvlTreePage'));
const GraphPage = lazy(() => import('./features/learn/GraphPage'));
const HashTablePage = lazy(() => import('./features/learn/HashTablePage'));
const HeapPage = lazy(() => import('./features/learn/HeapPage'));
const AlgorithmsHubPage = lazy(() => import('./features/learn/AlgorithmsHubPage'));
const SortingHubPage = lazy(() => import('./features/learn/SortingHubPage'));
const SearchingHubPage = lazy(() => import('./features/learn/SearchingHubPage'));
const AlgorithmDetailsPage = lazy(() => import('./features/learn/AlgorithmDetailsPage'));
const AlgorithmVisualizerPage = lazy(() => import('./features/visualizer/AlgorithmVisualizerPage'));
const Complexity3DPage = lazy(() => import('./features/learn/Complexity3DPage'));
const DivideConquerPage = lazy(() => import('./features/learn/DivideConquerPage'));
const DynamicProgrammingPage = lazy(() => import('./features/learn/DynamicProgrammingPage'));
const GreedyPage = lazy(() => import('./features/learn/GreedyPage'));
const GraphAlgorithmsPage = lazy(() => import('./features/learn/GraphAlgorithmsPage'));
const TopicDetailsPage = lazy(() => import('./features/learn/TopicDetailsPage'));
const AIVisualizerPage = lazy(() => import('./features/ai-visualizer/AIVisualizerPage'));
const DataStructuresUniversePage = lazy(() => import('./features/learn/DataStructuresUniversePage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-[#050812] text-slate-300 grid place-items-center" role="status">Opening Alvio…</div>}><Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected/App Routes wrapped in Layout & Auth Guard */}
        <Route element={<AuthGuard />}>
          <Route path="/learn" element={<DataStructuresUniversePage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/skill-tree" element={<SkillTreeMap />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/workspace/pvp" element={<PvPShowdown />} />
            <Route path="/ai-tutor" element={<AiTutorPage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/3d-visualizer" element={<VisualizerPage />} />
            <Route path="/algorithms-visualizer" element={<AlgorithmVisualizerPage />} />
            <Route path="/video-learning" element={<VideoLearningPage />} />

            <Route path="/learn/data-structures" element={<DataStructuresHubPage />} />
            <Route path="/learn/ai-visualizer" element={<AIVisualizerPage />} />
            <Route path="/ai-tools/visualizer" element={<Navigate to="/learn/ai-visualizer" replace />} />
            <Route path="/learn/array" element={<ArrayPage />} />
            <Route path="/learn/linked-list" element={<LinkedListPage />} />
            <Route path="/learn/stack" element={<StackPage />} />
            <Route path="/learn/queue" element={<QueuePage />} />
            <Route path="/learn/binary-tree" element={<BinaryTreePage />} />
            <Route path="/learn/avl-tree" element={<AvlTreePage />} />
            <Route path="/learn/graph" element={<GraphPage />} />
            <Route path="/learn/hash-table" element={<HashTablePage />} />
            <Route path="/learn/heap" element={<HeapPage />} />

            <Route path="/learn/algorithms" element={<AlgorithmsHubPage />} />
            <Route path="/learn/sorting" element={<SortingHubPage />} />
            <Route path="/learn/searching" element={<SearchingHubPage />} />
            <Route path="/learn/algorithms/:algo" element={<AlgorithmDetailsPage />} />
            <Route path="/learn/complexity" element={<Complexity3DPage />} />
            <Route path="/learn/divide-conquer" element={<DivideConquerPage />} />
            <Route path="/learn/dynamic-programming" element={<DynamicProgrammingPage />} />
            <Route path="/learn/greedy" element={<GreedyPage />} />
            <Route path="/learn/graph-algorithms" element={<GraphAlgorithmsPage />} />
            <Route path="/learn/skill-tree" element={<SkillTreeMap />} />
            <Route path="/learn/topic/:topicId" element={<TopicDetailsPage />} />


            <Route path="/workspace/pvp" element={<PvPShowdown />} />
            <Route path="/coding" element={<CodingPage />} />
            <Route path="/3d-visualizer" element={<VisualizerPage />} />
            <Route path="/video-learning" element={<VideoLearningPage />} />


            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />

          </Route>
        </Route>
      </Routes></Suspense>
    </BrowserRouter>
  );
}

export default App;
