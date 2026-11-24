import { HelpCircle, Mail, Book, MessageSquare, Video, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function HelpPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-md text-white">
            <HelpCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Help & Support</h1>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mt-0.5">Find answers, tutorials, and get in touch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="lg" className="hover:border-blue-500/50 transition-colors group cursor-pointer shadow-sm border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 mb-5 border border-blue-500/20 shadow-inner">
              <Book size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-[var(--color-text-primary)]">Documentation</h3>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-5">
              Read comprehensive guides about algorithms and data structures.
            </p>
            <div className="text-sm font-semibold text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Read Docs <ArrowRight size={14} />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-purple-500/50 transition-colors group cursor-pointer shadow-sm border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 mb-5 border border-purple-500/20 shadow-inner">
              <Video size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-[var(--color-text-primary)]">Video Tutorials</h3>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-5">
              Watch step-by-step videos explaining complex concepts visually.
            </p>
            <div className="text-sm font-semibold text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Watch Tutorials <ArrowRight size={14} />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-emerald-500/50 transition-colors group cursor-pointer shadow-sm border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 mb-5 border border-emerald-500/20 shadow-inner">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-[var(--color-text-primary)]">Community Forum</h3>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-5">
              Join the discussion, ask questions, and share your knowledge.
            </p>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Visit Forums <ArrowRight size={14} />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-amber-500/50 transition-colors group cursor-pointer shadow-sm border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)]">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400 mb-5 border border-amber-500/20 shadow-inner">
              <Mail size={20} />
            </div>
            <h3 className="text-lg font-bold mb-2 tracking-tight text-[var(--color-text-primary)]">Contact Support</h3>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-5">
              Need direct assistance? Get in touch with our support team.
            </p>
            <div className="text-sm font-semibold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Email Support <ArrowRight size={14} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
