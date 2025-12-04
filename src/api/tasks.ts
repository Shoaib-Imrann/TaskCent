import axiosInstance from '@/lib/axios';

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
}

export const tasksApi = {
  getAll: (params?: {
    search?: string;
    category?: string;
    priority?: string;
    status?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => axiosInstance.get<TasksResponse>('/api/tasks', { params }),
  getStats: () => axiosInstance.get<TaskStats>('/api/tasks/stats'),
  getById: (id: string) => axiosInstance.get<Task>(`/api/tasks/${id}`),
  create: (task: Omit<Task, 'id' | '_id'>) => axiosInstance.post<Task>('/api/tasks', task),
  update: (id: string, updates: Partial<Task>) => axiosInstance.put<Task>(`/api/tasks/${id}`, updates),
  delete: (id: string) => axiosInstance.delete(`/api/tasks/${id}`)
};