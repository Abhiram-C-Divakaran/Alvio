import WorldGlobe from './WorldGlobe';
import { SortingPreview, GraphPreview } from './LandingVisualDemos';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Box, BrainCircuit, Check, Code2, Globe2, GraduationCap, Layers3, MessagesSquare, Play, ShieldCheck, Sparkles, Target, Trophy, Users } from 'lucide-react';
import { Action, features, SectionHeading, signup, WindowFrame } from './landingShared';
import { CodePreview, DashboardPreview, LessonPreview, TreePreview, TutorPreview } from './LandingPreviews';
export function HeroSection() {
  return <section className="lp-hero">
    <picture className="lp-hero-art">
      <source srcSet="/landing/coder-800.webp 800w, /landing/coder-1400.webp 1400w, /landing/coder-1774.webp 1774w" sizes="(max-width: 700px) 100vw, 100vw" />
      <img src="/landing/coder-1774.webp" width="1774" height="887" alt="A student coding in a violet-lit room overlooking a city at night" fetchPriority="high" />
    </picture>
    <div className="lp-container lp-hero-content">
      <span className="lp-hero-eyebrow">
        <Sparkles size={12} />MASTER DSA. BUILD YOUR FUTURE.</span>
      <h1>Better<br />
        <span>Problem Solvers</span>
        <br />Build Better Futures.</h1>
      <p>Learn data structures and algorithms through interactive visualizations, hands-on coding practice, AI-powered guidance, and realistic technical interview preparation — all in one platform.</p>
      <div className="lp-actions">
        <Action to={signup}>Start learning</Action>
        <Action to="/3d-visualizer" secondary>
          <Play size={15} />Explore visualizers</Action>
      </div>
      <div className="lp-hero-benefits">{[[Box, 'Interactive learning'], [BrainCircuit, 'AI-powered tutor'], [Layers3, '3D visualizations'], [ShieldCheck, 'Real interview practice']].map(([Icon, label]) => {
        const I = Icon as typeof Box; return <span key={String(label)}>
          <I size={15} />{String(label)}</span>;
      })}</div>
    </div>
  </section>;
}
export function MetricsStrip() {
  const [count, setCount] = useState<number | null>(null); useEffect(() => {
    const controller = new AbortController(); fetch('/api/problems', { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(rows => {
      if (Array.isArray(rows))
        setCount(rows.length);
    }).catch(() => { }); return () => controller.abort();
  }, []); const items = [{ Icon: Code2, value: count === null ? 'Curated' : count.toLocaleString(), label: 'Coding problems', text: 'From the live problem library' }, { Icon: Box, value: '2D + 3D', label: 'Visual learning', text: 'Explore concepts from every angle' }, { Icon: BrainCircuit, value: 'AI', label: 'Guidance when you need it', text: 'Think through the next step' }, { Icon: Globe2, value: 'Your pace', label: 'Your learning journey', text: 'Built for curious minds everywhere' }]; return <div className="lp-container">
    <section className="lp-metrics" aria-label="Learning platform highlights">{items.map(({ Icon, value, label, text }) => <div key={label}>
      <span className="lp-feature-icon">
        <Icon />
      </span>
      <div>
        <strong>{value}</strong>
        <h2>{label}</h2>
        <p>{text}</p>
      </div>
    </div>)}</section>
  </div>;
}
export function FeaturesSection() {
  return <section className="lp-section lp-container" id="learn">
    <SectionHeading eyebrow="EVERYTHING YOU NEED" title="A complete learning experience" text="From structured learning to AI-assisted practice, understand concepts deeply and apply them confidently." />
    <div className="lp-features">{features.map(({ title, text, action, to, Icon }) => <article className="lp-feature" key={title}>
      <Icon />
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={to}>{action}<ArrowRight size={13} />
      </Link>
    </article>)}</div>
  </section>;
}
export function LearningFlowSection() {
  const steps = [{ title: 'Learn the concept', text: 'Understand the idea with structured lessons, explanations, examples, and AI guidance.', Preview: LessonPreview }, { title: 'Visualize it', text: 'Watch each state change, step by step, until the behavior becomes intuitive.', Preview: TreePreview }, { title: 'Practice and improve', text: 'Solve problems, check your understanding, and turn feedback into progress.', Preview: () => <CodePreview compact /> }]; return <section className="lp-section lp-container" id="about">
    <SectionHeading eyebrow="SIMPLE. EFFECTIVE. POWERFUL." title="How Alvio Academy works" text="Go from concept to confidence in three connected steps." />
    <div className="lp-learning-flow">{steps.map(({ title, text, Preview }, i) => <article key={title}>
      <div className="lp-step-heading">
        <span>{i + 1}</span>
        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>
      <div className="lp-step-preview">
        <Preview />
      </div>{i < 2 && <ArrowRight className="lp-step-arrow" size={20} />}</article>)}</div>
  </section>;
}
export function VisualizerSection() {
  return <section className="lp-story lp-container" id="visualizers">
    <div className="lp-story-copy">
      <span className="lp-eyebrow">MAKE THE ABSTRACT CLICK</span>
      <h2>Don't just read algorithms.<br />
        <span>See them work.</span>
      </h2>
      <p>Follow a pointer. Trace a traversal. Watch a sort find its order. Build an intuition for trees, graphs, recursion, and complexity through interactive visual explanations.</p>
      <ul>
        <li>
          <Check />Explore connections in two and three dimensions</li>
        <li>
          <Check />Step forward, pause, and try a different input</li>
        <li>
          <Check />Connect what you see to the code you write</li>
      </ul>
      <Action to="/3d-visualizer">Explore 3D visualizers</Action>
    </div>
    <div className="lp-visual-stage">
      <WindowFrame title="Binary search tree · preorder traversal">
        <TreePreview interactive />
      </WindowFrame>
      <div className="lp-visual-details">
        <div>
          <span className="lp-label">LINKED LIST · POINTERS</span>
          <div className="lp-pointer-chain">{[12, 24, 36].map(n => <span key={n}>
            <b>{n}</b>
            <ArrowRight size={16} />
          </span>)}<small>null</small>
          </div>
        </div>
        <SortingPreview />
      </div>
      <GraphPreview />
      <Link className="lp-text-link" to="/learn/graph">Explore graph traversal<ArrowRight size={14} />
      </Link>
    </div>
  </section>;
}
export function AITutorSection() {
  return <section className="lp-story lp-container reverse" id="ai-tools">
    <WindowFrame title="Alvio AI · a conversation, not a shortcut">
      <TutorPreview />
    </WindowFrame>
    <div className="lp-story-copy">
      <span className="lp-eyebrow">A LITTLE GUIDANCE. A BIG DIFFERENCE.</span>
      <h2>An AI study partner that understands <span>what you're learning.</span>
      </h2>
      <p>Get unstuck without losing the learning. Ask for an example, challenge your reasoning, or practice explaining your approach out loud.</p>
      <div className="lp-ai-capabilities">{[[BookOpen, 'Explain concepts'], [BrainCircuit, 'Debug thinking'], [MessagesSquare, 'Prepare for interviews']].map(([Icon, label]) => {
        const I = Icon as typeof BookOpen; return <span key={String(label)}>
          <I size={18} />{String(label)}</span>;
      })}</div>
      <Action to="/ai-tutor">Ask Alvio AI</Action>
    </div>
  </section>;
}
export function CodingPracticeSection() {
  return <section className="lp-section lp-container" id="practice">
    <SectionHeading eyebrow="LESS THEORY ALONE. MORE LEARNING BY DOING." title="From understanding to implementation" text="Move directly from learning a concept to solving real problems in Alvio's integrated coding workspace." />
    <WindowFrame title="Alvio workspace / arrays / two-sum" className="lp-large-code">
      <CodePreview />
    </WindowFrame>
    <div className="lp-section-bottom">
      <span>
        <Check size={15} />Problem descriptions, language selection, test cases, and feedback — together.</span>
      <Action to="/coding">Start coding</Action>
    </div>
  </section>;
}
export function ProgressSection() {
  return <section className="lp-story lp-container" id="progress">
    <div className="lp-story-copy">
      <span className="lp-eyebrow">SMALL STEPS. VISIBLE PROGRESS.</span>
      <h2>Progress you can <span>actually see.</span>
      </h2>
      <p>Build consistency without turning learning into meaningless points. See what you've mastered, recognize your momentum, and understand what to practice next.</p>
      <div className="lp-progress-pills">
        <span>
          <Target />Skill mastery</span>
        <span>
          <Trophy />XP & achievements</span>
        <span>
          <GraduationCap />Personalized next steps</span>
      </div>
      <Action to="/dashboard">Explore your dashboard</Action>
    </div>
    <WindowFrame title="Your learning dashboard">
      <DashboardPreview />
    </WindowFrame>
  </section>;
}
export function GlobalCommunitySection() {
  return <section className="lp-community" id="community">
    <div className="lp-container lp-story">
      <div className="lp-story-copy">
        <span className="lp-eyebrow">DIFFERENT PATHS. SHARED CURIOSITY.</span>
        <h2>Built for students <span>everywhere.</span>
        </h2>
        <p>For your next class, placement, internship, or technical interview. Wherever you're starting from, make room for the developer you're becoming.</p>
        <p>Bring a friend and put your problem-solving skills to the test in the PvP coding arena.</p>
        <Action to="/workspace/pvp">
          <Users size={17} />Join the community</Action>
        <small className="lp-community-note">Community activity currently lives in the coding arena.</small>
      </div>
      <WorldGlobe />
    </div>
  </section>;
}
export function TestimonialsSection() {
  const examples = [['Aarav', 'India', 'University student', 'The visual explanations helped me understand trees instead of memorizing code.'], ['Sophie', 'Canada', 'Interview candidate', 'I can revise a concept and practice it immediately. That connection makes a difference.'], ['Daniel', 'Nigeria', 'Self-taught developer', 'Working through each step helps me see where my reasoning went off track.'], ['Lena', 'Germany', 'Computer science student', 'Seeing pointers move makes linked lists much easier to follow.']]; return <section className="lp-section lp-container">
    <SectionHeading eyebrow="REAL PEOPLE. REAL LEARNING." title={import.meta.env.DEV ? 'Student stories · design preview' : 'Your learning story starts here'} text={import.meta.env.DEV ? 'Demo testimonials below are layout examples, not verified student reviews.' : 'Every learner starts somewhere. Build your own journey, one concept at a time.'} />{import.meta.env.DEV ? <div className="lp-testimonials">{examples.map(([name, country, role, quote]) => <article key={name}>
      <span className="lp-demo-label">DEMO · NOT A VERIFIED REVIEW</span>
      <div className="lp-person">
        <span>{name[0]}</span>
        <div>
          <h3>{name}</h3>
          <small>{country} · {role}</small>
        </div>
      </div>
      <p>“{quote}”</p>
    </article>)}</div> : <div className="lp-student-invitation">
      <Users size={28} />
      <p>From your first array to your next interview, make steady progress on what matters to you.</p>
      <Action to={signup}>Start your story</Action>
    </div>}</section>;
}
const faqs = [['What is Alvio Academy?', 'Alvio is a platform for learning data structures and algorithms through structured lessons, visualizations, coding practice, quizzes, AI guidance, and interview preparation.'], ['Who is Alvio designed for?', 'University students, self-taught developers, competitive programmers, and anyone building stronger problem-solving skills or preparing for technical interviews.'], ['Can beginners use Alvio?', 'Yes. Start with foundational data structures, work through the examples, and check your understanding before moving to more advanced topics.'], ['Does Alvio include coding practice?', "Yes. Browse the problem library, choose a language, write and run your solution, and use test-case feedback to refine your approach."], ['What are the 3D visualizers?', 'Interactive views that help you explore the connections in data structures such as trees and graphs. The platform also includes step-by-step algorithm visualizations.'], ['How does the AI Tutor work?', 'Ask a question about a concept or your reasoning. The tutor offers explanations and examples you can discuss further. AI can make mistakes, so test its suggestions and check your understanding.'], ['Can I prepare for technical interviews?', 'Yes. Combine DSA practice with mock technical interviews to practice explaining your approach and working through unfamiliar problems.'], ['Can I track my learning progress?', 'Your dashboard brings together topic progress, quiz performance, study time, streaks, XP, and achievements to help you choose what to practice next.']];
export function FAQSection() {
  return <section className="lp-section lp-container lp-faq" id="faq">
    <div>
      <span className="lp-eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</span>
      <h2>Curiosity is a<br />
        <span>good place to start.</span>
      </h2>
      <p>Get to know your new learning space.</p>
    </div>
    <div>{faqs.map(([q, a]) => <details key={q}>
      <summary>{q}<span aria-hidden="true">+</span>
      </summary>
      <p>{a}</p>
    </details>)}</div>
  </section>;
}
export function FinalCTA() {
  return <section className="lp-final">
    <picture>
      <source srcSet="/landing/footer-panorama-1000.webp 1000w, /landing/footer-panorama-2000.webp 2000w, /landing/footer-panorama-2804.webp 2804w" sizes="100vw" />
      <img src="/landing/footer-panorama-2000.webp" width="2804" height="561" loading="lazy" alt="A student looking across a mountain panorama at dusk. Same students, brighter futures. A small step today, a brighter tomorrow." />
    </picture>
    <div className="lp-container">
      <div className="lp-final-copy">
        <h2>Ready to build a brighter future?</h2>
        <p>Start learning, practicing, and building stronger problem-solving skills today.</p>
      </div>
      <div className="lp-actions">
        <Action to={signup}>Start learning</Action>
        <Action to="/workspace/pvp" secondary>
          <Users size={16} />Join our community</Action>
      </div>
    </div>
  </section>;
}
