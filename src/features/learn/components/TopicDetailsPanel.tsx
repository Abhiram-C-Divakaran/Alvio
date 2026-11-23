import { Link } from 'react-router-dom';
import { Play, BookOpen, Layers, Code2, Clock, ListFilter } from 'lucide-react';
import { curriculumData, type CurriculumTopic } from '../data/curriculumData';

interface TopicDetailsPanelProps {
  topic: CurriculumTopic;
}

export default function TopicDetailsPanel({ topic }: TopicDetailsPanelProps) {
  const progress = topic.status === 'Completed' ? 100 : topic.progress ?? 0;
  return (
    <div
      className="w-full rounded-2xl p-5 select-none animate-in fade-in duration-200 flex flex-col"
      style={{
        background: 'rgba(8, 11, 29, 0.82)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: '0 18px 60px rgba(0, 0, 0, 0.28)',
      }}
    >
      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-start gap-3">
          {/* Planet Avatar Icon */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 mt-0.5 relative overflow-hidden"
            style={{ backgroundColor: `${topic.color}25` }}
          >
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: topic.color }}
            />
            {topic.hasRing && (
              <div
                className="absolute w-9 h-2 border-t-2 border-b-2 rounded-full -rotate-45"
                style={{ borderColor: `${topic.color}88` }}
              />
            )}
          </div>

          <div>
            <h2 className="text-[17px] font-bold text-white leading-tight mb-1">
              {topic.name}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#7138f7]/25 text-[#9b61ff]">
                {topic.category}
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#4acb78]/20 text-[#4acb78]">
                {topic.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#4d9aff"
              strokeWidth="2.5"
              strokeDasharray={`${(progress / 100) * 88} 88`}
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-white">{progress}%</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#9ca3af] leading-relaxed mb-4">
        {topic.description}
      </p>

      {/* Prerequisites */}
      <div className="mb-4">
        <h3 className="text-[11px] font-semibold text-[#cbd5e1] mb-2">Prerequisites</h3>
        <div className="flex flex-col gap-1.5">
          {topic.prerequisites.map((id) => {
            const prerequisite = curriculumData.find((item) => item.id === id);
            return (
              <div key={id} className="flex items-center gap-2 text-[12px] text-[#9ca3af]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                {prerequisite ? (
                  <Link to={prerequisite.path} className="hover:text-white underline underline-offset-2">{prerequisite.name}</Link>
                ) : <span>Basic Programming</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats List */}
      <div className="flex flex-col gap-2.5 mb-5 pt-1 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2 text-[#9ca3af]">
            <BookOpen size={14} className="text-[#8E92A8]" />
            <span>Lessons</span>
          </div>
          <span className="font-semibold text-white">{topic.lessons}</span>
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2 text-[#9ca3af]">
            <Layers size={14} className="text-[#8E92A8]" />
            <span>Visualizations</span>
          </div>
          <span className="font-semibold text-white">{topic.visualizations}</span>
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2 text-[#9ca3af]">
            <Code2 size={14} className="text-[#8E92A8]" />
            <span>Practice Problems</span>
          </div>
          <span className="font-semibold text-white">{topic.practiceProblems}</span>
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2 text-[#9ca3af]">
            <Clock size={14} className="text-[#8E92A8]" />
            <span>Estimated Time</span>
          </div>
          <span className="font-semibold text-white">{topic.estimatedTime}</span>
        </div>
      </div>

      {/* Primary CTA */}
      <Link to={topic.path} className="w-full h-10 rounded-xl bg-gradient-to-r from-[#7138f7] to-[#863cff] text-white font-semibold text-[13px] flex items-center justify-center gap-2 mb-2 hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(113,56,247,0.35)]">
        {topic.status === 'In Progress' ? 'Continue Lesson' : topic.status === 'Completed' ? 'Review Topic' : 'Explore Topic'} <Play size={13} className="fill-white" />
      </Link>

      {/* Secondary CTA */}
      <Link to="/learn/data-structures" className="w-full h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[#9ca3af] hover:text-white hover:bg-white/[0.06] font-medium text-[12px] flex items-center justify-center gap-2 transition-all">
        <ListFilter size={13} /> View All Lessons
      </Link>
    </div>
  );
}
