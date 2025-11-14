import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RefillCalendarProps {
  refillDate: string | null;
  reEnrollmentDate: string | null;
}

const RefillCalendar: React.FC<RefillCalendarProps> = ({ refillDate, reEnrollmentDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isRefillDate = (day: number) => {
    if (!refillDate) return false;
    const refill = new Date(refillDate);
    return (
      day === refill.getDate() &&
      currentDate.getMonth() === refill.getMonth() &&
      currentDate.getFullYear() === refill.getFullYear()
    );
  };

  const isReEnrollmentDate = (day: number) => {
    if (!reEnrollmentDate) return false;
    const reEnroll = new Date(reEnrollmentDate);
    return (
      day === reEnroll.getDate() &&
      currentDate.getMonth() === reEnroll.getMonth() &&
      currentDate.getFullYear() === reEnroll.getFullYear()
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-0.5 lg:p-1">
          <div className="w-full h-full" />
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day);
      const refill = isRefillDate(day);
      const reEnroll = isReEnrollmentDate(day);

      days.push(
        <div key={day} className="aspect-square p-0.5 lg:p-1">
          <div
            className={`w-full h-full rounded lg:rounded-lg flex flex-col items-center justify-center text-xs lg:text-sm font-medium transition-colors ${
              reEnroll
                ? 'bg-red-400 text-white'
                : refill
                ? 'bg-yellow-400 text-gray-900'
                : today
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{day}</span>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 w-full max-w-sm lg:max-w-md">
      <div className="flex items-center justify-between mb-2 lg:mb-3">
        <div className="flex items-center gap-1 lg:gap-2">
          <button
            onClick={previousMonth}
            className="p-1 lg:p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 lg:p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-2 lg:px-3 py-0.5 lg:py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            today
          </button>
        </div>
        <div className="text-sm lg:text-base font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 lg:gap-4 mb-2 lg:mb-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 lg:gap-2">
          <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded bg-blue-500" />
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2">
          <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded bg-yellow-400" />
          <span className="text-gray-600">Refill</span>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2">
          <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 rounded bg-red-400" />
          <span className="text-gray-600">Re-enroll</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-1 lg:mb-1.5">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs lg:text-sm font-semibold text-gray-600 py-1 lg:py-1.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 lg:gap-1">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default RefillCalendar;
