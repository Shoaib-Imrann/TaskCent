'use client';

import { useState } from 'react';
import { useTasksStore } from '@/lib/tasks-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import type { Task } from '@/api/tasks';

interface TaskFormProps {
  task?: Task;
  onSuccess: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { addTask, updateTask, tasks } = useTasksStore();
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  // Map 'todo' status to 'pending' for the form
  const getFormStatus = (status?: string) => {
    if (status === 'todo') return 'pending';
    return status || 'pending';
  };
  
  // Get due date from either dueDate or due_date field
  const getDueDate = () => {
    const date = (task as any)?.dueDate || (task as any)?.due_date;
    return date ? date.split('T')[0] : '';
  };
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || '',
    status: getFormStatus(task?.status) as 'pending' | 'in-progress' | 'completed',
    priority: task?.priority || 'medium' as const,
    dueDate: getDueDate()
  });
  
  const existingCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Category is required');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }
    if (formData.title.length > 200) {
      toast.error('Title must be less than 200 characters');
      return;
    }
    if (formData.description && formData.description.length > 1000) {
      toast.error('Description must be less than 1000 characters');
      return;
    }
    
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        category: formData.category.trim(),
        dueDate: formData.dueDate || undefined
      };

      if (task) {
        await updateTask(task._id || task.id!, taskData);
        toast.success('Task updated successfully');
      } else {
        await addTask(taskData);
        toast.success('Task created successfully');
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || (task ? 'Failed to update task' : 'Failed to create task');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          maxLength={1000}
          rows={4}
        />
      </div>
      
      <div className="flex gap-2">
        <Select 
          value={showCustomCategory ? 'custom' : (formData.category || 'none')} 
          onValueChange={(value) => {
            if (value === 'custom') {
              setShowCustomCategory(true);
              setFormData(prev => ({ ...prev, category: '' }));
            } else if (value === 'none') {
              setShowCustomCategory(false);
              setFormData(prev => ({ ...prev, category: '' }));
            } else {
              setShowCustomCategory(false);
              setFormData(prev => ({ ...prev, category: value }));
            }
          }}
        >
          <SelectTrigger className={showCustomCategory ? 'w-[180px]' : 'w-full'}>
            <SelectValue placeholder="Category *" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            <SelectItem value="custom">+ New Category</SelectItem>
            {existingCategories.map(cat => (
              <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showCustomCategory && (
          <Input
            placeholder="Enter new category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            maxLength={100}
            className="flex-1"
            autoFocus
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Select 
          value={formData.priority} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={formData.status} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          value={formData.dueDate}
          onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
          minDate={new Date(new Date().setHours(0, 0, 0, 0))}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
      </Button>
    </form>
  );
}