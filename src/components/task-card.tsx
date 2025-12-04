'use client';

import { useState, useEffect } from 'react';
import { useTasksStore } from '@/lib/tasks-store';
import { TaskForm } from './task-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar, Flag, Clock, Tag, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '@/api/tasks';

interface TaskCardProps {
  task: Task;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600'
};

export function TaskCard({ task }: TaskCardProps) {
  const { deleteTask, updateTask } = useTasksStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!task.dueDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const deadline = new Date(task.dueDate!).getTime();
      const diff = deadline - now;

      if (diff < 0) {
        setCountdown('Overdue');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [task.dueDate]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task._id || task.id!, { status: newStatus as any });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task._id || task.id!);
      toast.success('Task deleted successfully');
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden" onClick={() => setIsDetailsOpen(true)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {task.category && (
                <Badge variant="outline" className="max-w-[120px] truncate">{task.category}</Badge>
              )}
              <div className="flex items-center gap-1">
                <Flag className={`w-3 h-3 ${priorityColors[task.priority]}`} />
                <span className={`text-sm ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-lg line-clamp-2 break-words">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {task.description && (
            <p className="text-gray-600 mb-4 line-clamp-2 break-words">{task.description}</p>
          )}
          
          <div className="space-y-3">
            <Badge className={statusColors[task.status]}>
              {task.status.replace('-', ' ')}
            </Badge>
            
            {task.dueDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
                {countdown && (
                  <div className={`flex items-center gap-1 font-medium ${
                    countdown === 'Overdue' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {countdown}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Description */}
            {task.description && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Description
                </div>
                <p className="text-gray-600">{task.description}</p>
              </div>
            )}

            {/* Category */}
            {task.category && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4" />
                  Category
                </div>
                <Badge variant="outline">{task.category}</Badge>
              </div>
            )}

            {/* Status Update */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Status
              </div>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4" />
                Priority
              </div>
              <Badge className={priorityColors[task.priority]}>
                {task.priority.toUpperCase()}
              </Badge>
            </div>

            {/* Deadline & Countdown */}
            {task.dueDate && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Deadline
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {countdown && (
                    <div className={`flex items-center gap-1 font-medium ${
                      countdown === 'Overdue' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {countdown}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
              <div>Created: {new Date(task.createdAt!).toLocaleString()}</div>
              <div>Updated: {new Date(task.updatedAt!).toLocaleString()}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={() => { setIsDetailsOpen(false); setIsEditOpen(true); }} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Edit Task
              </Button>
              <Button variant="destructive" onClick={() => { setIsDetailsOpen(false); setIsDeleteOpen(true); }} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            task={task} 
            onSuccess={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}