import { useState } from "react";
import { m } from "@/paraglide/messages";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  // Pad leading empty cells
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  return days;
}

export function MiniCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const goPrev = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const days = getCalendarDays(year, month);
  const monthName = new Date(year, month).toLocaleString("en-US", {
    month: "long",
  });

  return (
    <div className="fuwari-card-base p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold fuwari-text-90 text-sm tracking-wide">
          {m.calendar_title()}
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={goPrev}
          className="fuwari-btn-regular size-7 rounded-md"
          aria-label="Previous month"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>
        <span className="text-sm font-medium fuwari-text-75">
          {monthName} {year}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="fuwari-btn-regular size-7 rounded-md"
          aria-label="Next month"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] fuwari-text-30 font-medium py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const isToday =
            isCurrentMonth &&
            day === today.getDate();

          return (
            <div
              key={`day-${day}`}
              className={`aspect-square flex items-center justify-center text-xs rounded-full transition-colors ${
                isToday
                  ? "text-white font-bold"
                  : "fuwari-text-75 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              style={
                isToday
                  ? { backgroundColor: "var(--fuwari-primary)" }
                  : undefined
              }
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
