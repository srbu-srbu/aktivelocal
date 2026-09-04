import React from 'react';

/**
 * Builds the dynamic 7-day horizon starting from today
 */
export function generateSevenDays() {
  const days = [];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dateFormatted = `${month}/${date}`;

    let primaryLabel = '';
    let subLabel = dateFormatted;

    if (i === 0) {
      primaryLabel = 'Today';
    } else if (i === 1) {
      primaryLabel = 'Tomorrow';
    } else {
      primaryLabel = dayNamesShort[d.getDay()];
    }

    days.push({
      offset: i,
      isoDate: d.toISOString(),
      dayString: d.toISOString().split('T')[0],
      primaryLabel,
      subLabel
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 whitespace-nowrap border ${
                isSelected
                  ? 'bg-cyan-600 text-white font-bold border-cyan-600 shadow-md shadow-cyan-600/20 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <span className={isSelected ? 'font-extrabold' : 'font-semibold'}>
                {d.primaryLabel}
              </span>
              <span className={`text-[11px] ${isSelected ? 'text-cyan-100 font-bold' : 'text-slate-400 font-normal'}`}>
                {d.subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

