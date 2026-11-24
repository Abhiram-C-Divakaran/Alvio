export default function ActivityHeatmap({ allDates = [] }: { allDates: string[] }) {
  const days = 28;
  const today = new Date();
  
  const dateSet = new Set(allDates);

  const squares = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dateString = d.toISOString().split('T')[0];
    const isActive = dateSet.has(dateString);
    
    return (
      <div 
        key={i} 
        title={dateString}
        className={`w-3 h-3 rounded-sm ${isActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]'}`}
      />
    );
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 flex-wrap justify-end">
        {squares}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
        <span>28 Days Ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
