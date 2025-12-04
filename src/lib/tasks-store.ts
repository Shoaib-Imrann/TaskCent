import { create } from 'zustand';
import { tasksApi, type Task, type TaskStats } from '@/api/tasks';

interface TasksState {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: {
    search?: string;
    category?: string;
    priority?: string;
    status?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchStats: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | '_id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  total: 0,
  page: 1,
  totalPages: 0,
  stats: null,
  loading: false,
  error: null,

  fetchTasks: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await tasksApi.getAll(filters);
      set({ 
        tasks: response.data.tasks, 
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.total_pages,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await tasksApi.getStats();
      set({ stats: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addTask: async (task) => {
    try {
      const response = await tasksApi.create(task);
      set(state => ({ tasks: [...state.tasks, response.data] }));
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const response = await tasksApi.update(id, updates);
      set(state => ({
        tasks: state.tasks.map(task => 
          (task._id || task.id) === id ? response.data : task
        )
      }));
      get().fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to update task';
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await tasksApi.delete(id);
      set(state => ({
        tasks: state.tasks.filter(task => (task._id || task.id) !== id)
      }));
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));