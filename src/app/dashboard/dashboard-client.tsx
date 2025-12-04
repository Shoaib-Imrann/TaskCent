'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useTasksStore } from '@/lib/tasks-store';
import { TaskForm } from '@/components/task-form';
import { DashboardStats } from '@/components/dashboard-stats';
import { TaskListView } from '@/components/task-list-view';
import { TaskDetailsModal } from '@/components/task-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, LogOut, Settings, Search, Filter, Flag, X, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardClient() {
  const { logout, user, token } = useAuthStore();
  const { tasks, stats, loading, fetchTasks, fetchStats, updateTask, deleteTask } = useTasksStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [todoOpen, setTodoOpen] = useState(true);
  const [inProgressOpen, setInProgressOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(true);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    if (token) fetchStats();
  }, [fetchStats, token]);

  useEffect(() => {
    if (token) {
      fetchTasks({
        search: searchQuery || undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        sort_by: sortBy,
        page: currentPage,
        limit: 12
      });
    }
  }, [searchQuery, filterPriority, filterStatus, sortBy, currentPage, fetchTasks, token]);



  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const todoTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllInSection = (sectionTasks: any[]) => {
    const sectionIds = sectionTasks.map(t => t._id || t.id);
    const allSelected = sectionIds.every(id => selectedTasks.includes(id));
    if (allSelected) {
      setSelectedTasks(prev => prev.filter(id => !sectionIds.includes(id)));
    } else {
      setSelectedTasks(prev => [...new Set([...prev, ...sectionIds])]);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const statusMap: Record<string, string> = {
        'todo': 'pending',
        'in_progress': 'in-progress',
      };
      const apiStatus = statusMap[newStatus] || newStatus;
      await updateTask(taskId, { status: apiStatus });
      toast.success('Task status updated!');
    } catch (error: any) {
      console.error('Error updating task status:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to update task status';
      toast.error(errorMessage);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 md:px-10">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">TaskCent</h1>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors">
                  {user?.email?.charAt(0).toUpperCase()}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <Link href="/admin">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-md">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-10 py-6">
        <DashboardStats stats={stats} />

        <div className="mt-8">
          <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
            <div className="flex gap-3 items-center w-full">
              <div
                className={cn(
                  "hidden md:flex items-center transition-all duration-300 ease-in-out",
                  searchOpen ? "w-64" : "w-10"
                )}
              >
                {!searchOpen ? (
                  <Button
                    variant="outline"
                    className="h-10 w-10 p-0 bg-white border-gray-200 hover:bg-gray-50 rounded-full"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="relative w-full">
                    <Input
                      type="search"
                      placeholder="Search tasks..."
                      className="w-full h-10 text-sm border-gray-200 rounded-lg bg-white pr-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 gap-2 bg-white border-gray-200 hover:bg-gray-50 rounded-xl px-4 text-xs"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(filterPriority !== 'all' || filterStatus !== 'all') && (
                      <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        {[filterPriority !== 'all', filterStatus !== 'all'].filter(Boolean).length}
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Priority
                  </div>
                  <button
                    onClick={() => setFilterPriority('high')}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                      filterPriority === 'high' ? "bg-red-50 text-red-900" : ""
                    )}
                  >
                    <Flag className="w-3 h-3 text-red-500 fill-current" />
                    <span className="flex-1 text-left">High Priority</span>
                    {filterPriority === 'high' && (
                      <span className="text-red-600 font-medium">✓</span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilterPriority('medium')}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                      filterPriority === 'medium' ? "bg-amber-50 text-amber-900" : ""
                    )}
                  >
                    <Flag className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="flex-1 text-left">Medium Priority</span>
                    {filterPriority === 'medium' && (
                      <span className="text-amber-600 font-medium">✓</span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilterPriority('low')}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                      filterPriority === 'low' ? "bg-green-50 text-green-900" : ""
                    )}
                  >
                    <Flag className="w-3 h-3 text-green-500 fill-current" />
                    <span className="flex-1 text-left">Low Priority</span>
                    {filterPriority === 'low' && (
                      <span className="text-green-600 font-medium">✓</span>
                    )}
                  </button>

                  <div className="h-px bg-gray-200 my-2" />
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </div>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                      filterStatus === 'pending' ? "bg-gray-50 text-gray-900" : ""
                    )}
                  >
                    <span>Pending</span>
                    {filterStatus === 'pending' && (
                      <span className="text-gray-600 font-medium">✓</span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilterStatus('in-progress')}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                      filterStatus === 'in-progress' ? "bg-blue-50 text-blue-900" : ""
                    )}
                  >
                    <span>In Progress</span>
                    {filterStatus === 'in-progress' && (
                      <span className="text-blue-600 font-medium">✓</span>
                    )}
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                      filterStatus === 'completed' ? "bg-emerald-50 text-emerald-900" : ""
                    )}
                  >
                    <span>Completed</span>
                    {filterStatus === 'completed' && (
                      <span className="text-emerald-600 font-medium">✓</span>
                    )}
                  </button>

                  <div className="h-px bg-gray-200 my-2" />
                  <button
                    onClick={() => {
                      setFilterPriority('all');
                      setFilterStatus('all');
                    }}
                    className="w-full flex items-center px-2 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </button>
                </PopoverContent>
              </Popover>

              <Input
                type="search"
                placeholder="Search..."
                className="flex-1 md:hidden h-10 text-sm border-gray-200 rounded-lg bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="flex-1 hidden md:block" />

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 gap-1 rounded-xl px-3 text-xs flex-shrink-0">
                    <Plus className="w-3 h-3" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="overflow-visible">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm onSuccess={() => setIsCreateOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {tasks.length === 0 && !loading ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first task</p>
            </div>
          ) : (
            <TaskListView
              todoTasks={todoTasks}
              inProgressTasks={inProgressTasks}
              completedTasks={completedTasks}
              todoOpen={todoOpen}
              inProgressOpen={inProgressOpen}
              completedOpen={completedOpen}
              setTodoOpen={setTodoOpen}
              setInProgressOpen={setInProgressOpen}
              setCompletedOpen={setCompletedOpen}
              selectedTasks={selectedTasks}
              onTaskSelect={handleTaskSelect}
              onSelectAllInSection={handleSelectAllInSection}
              onTaskClick={handleTaskClick}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              loading={loading}
              visibleColumns={{
                task: true,
                category: false,
                priority: true,
                due: true,
                countdown: false,
                status: true
              }}
              isMyTasksView={false}
              currentUser={user}
              doneHasMore={false}
              loadingMore={false}
              onLoadMoreDone={() => {}}
            />
          )}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            task={selectedTask} 
            onSuccess={() => {
              setIsEditOpen(false);
              setSelectedTask(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedTask(null);
        }}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
        onDelete={async () => {
          if (selectedTask) {
            try {
              await deleteTask(selectedTask._id || selectedTask.id);
              toast.success('Task deleted successfully!');
              setIsDetailsOpen(false);
              setSelectedTask(null);
            } catch (error) {
              toast.error('Failed to delete task');
            }
          }
        }}
        allTasks={[...todoTasks, ...inProgressTasks, ...completedTasks]}
        onNavigateTask={(task) => setSelectedTask(task)}
      />
    </div>
  );
}
