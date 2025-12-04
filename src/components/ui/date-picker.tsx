'use client';

import { useState } from 'react';
import { Button } from './button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  minDate?: Date;
  required?: boolean;
}

export function DatePicker({ value, onChange, minDate, required }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  
  const selectedDate = value ? new Date(value) : null;
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full justify-start text-left font-normal ${!value && required ? 'border-red-500' : ''}`}
      >
        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="truncate">
          {value ? formatDate(value) : required ? 'Pick a date *' : 'Pick a date'}
        </span>
      </Button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 md:left-0 z-50 mt-2 bg-white rounded-lg shadow-lg border p-3 w-72 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between mb-3">
              <Button type="button" variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-gray-500 font-medium">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isDisabled = minDate && date < minDate;
                const isSelected = selectedDate && 
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentMonth.getMonth() &&
                  selectedDate.getFullYear() === currentMonth.getFullYear();
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`
                      h-8 w-full aspect-square rounded text-sm
                      ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                      ${isDisabled ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
