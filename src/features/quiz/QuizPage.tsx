import { useSearchParams } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { useQuiz } from './useQuiz';
import { QuizHero, TopicSelector, DifficultySelector, QuizSettings, StartQuizButton } from './QuizSetup';
import { QuizSession, QuizResults } from './QuizSession';
import { availableQuestions } from './quizModel';
import { questionBank } from '../../data/quizQuestions';
import './quiz.css';

function QuizArena({ userId, topic }: { userId: string; topic: string | null }) {
  const quiz = useQuiz(userId, topic);
  const available = availableQuestions(questionBank, quiz.config).length;
  return <div className="quiz-arena">
    {quiz.error && <p className="quiz-notice" role="alert">{quiz.error}</p>}
    {quiz.view === 'setup' ? <>
      <QuizHero totals={quiz.totals}/>
      <div className="quiz-configuration">
        <TopicSelector config={quiz.config} onChange={quiz.configure}/>
        <DifficultySelector config={quiz.config} onChange={quiz.configure}/>
        <QuizSettings config={quiz.config} onChange={quiz.configure}/>
      </div>
      <div className="quiz-start-area">
        {available === 0 ? <p className="quiz-availability" role="status">No {quiz.config.difficulty === 'mixed' ? '' : quiz.config.difficulty + ' '}questions are available for {quiz.config.topic} yet. Choose another topic to begin.</p> : available < quiz.config.count ? <p className="quiz-availability" role="status">This selection has {available} questions. Your quiz will include all {available}, without repeats.</p> : null}
        <StartQuizButton disabled={!available || !quiz.ready} onClick={() => quiz.start()} loading={!quiz.ready}/>
        <p>Same concepts. A sharper you.</p>
        {quiz.session && !quiz.session.endedAt && <button className="quiz-text-button" onClick={() => quiz.setView('session')}>Resume saved quiz · Question {quiz.session.index + 1} of {quiz.session.questions.length}</button>}
      </div>
    </> : quiz.view === 'results' ? <QuizResults quiz={quiz}/> : <QuizSession quiz={quiz}/>}
  </div>;
}

export default function QuizPage() {
  const userId = useAuthStore(s => String(s.user?.id || 'guest'));
  const [params] = useSearchParams();
  return <QuizArena key={userId} userId={userId} topic={params.get('topic')}/>;
}
