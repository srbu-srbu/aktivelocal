import React from 'react';

/**
 * Builds the dynamic 7-day horizon starting from today
 */
export function generateSevenDays() {
  const days = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dateFormatted = `${month}/${date}`;

    let label = '';
    if (i === 0) {
      label = `Today (${dateFormatted})`;
    } else if (i === 1) {
      label = `Tomorrow (${dateFormatted})`;
    } else {
      label = `${dayNames[d.getDay()]} (${dateFormatted})`;
    }

    days.push({
      offset: i,
      isoDate: d.toISOString(),
      dayString: d.toISOString().split('T')[0],
      label
    });
  }

  return days;
}

export default function DayPills({
  days,
  selectedDayOffset,
  onSelectDay
}) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 min-w-max">
        {days.map((d) => {
          const isSelected = selectedDayOffset === d.offset;
          return (
            <button
              key={d.offset}
              onClick={() => onSelectDay(d.offset)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20 scale-[1.02]'
                  : 'bg-[#161b22] hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
