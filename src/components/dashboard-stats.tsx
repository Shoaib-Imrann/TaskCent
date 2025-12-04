'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import type { TaskStats } from '@/api/tasks';

interface DashboardStatsProps {
  stats: TaskStats | null;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: CheckSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckSquare,
      color: 'text-green-600'
    },
    {
      title: 'In Progress',
      value: stats.in_progress,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border-gray-200 py-0 gap-0 shadow-none">
          <CardContent className="p-4 px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">
                  {stat.title}
                </p>
                <div className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
                {stat.title === 'Completed' && stats.total > 0 && (
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}