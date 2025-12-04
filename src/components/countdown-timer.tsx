'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  dueDate: string;
  isCompleted: boolean;
}

export function CountdownTimer({ dueDate, isCompleted }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [colorClass, setColorClass] = useState('text-gray-700');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (isCompleted) {
        setTimeLeft('Done');
        setColorClass('text-gray-500');
        return;
      }

      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();
      const diff = due - now;

      if (diff < 0) {
        const absDiff = Math.abs(diff);
        const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h overdue`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m overdue`);
        } else {
          setTimeLeft(`${minutes}m overdue`);
        }
        setColorClass('text-red-600');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        setColorClass(days <= 2 ? 'text-orange-600' : 'text-gray-700');
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setColorClass('text-yellow-600');
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
        setColorClass('text-yellow-600');
      } else {
        setTimeLeft(`${seconds}s`);
        setColorClass('text-red-600');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [dueDate, isCompleted]);

  return (
    <span className={cn('text-xs font-medium', colorClass)}>
      {timeLeft}
    </span>
  );
}
