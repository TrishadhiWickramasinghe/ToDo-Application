import axiosInstance from './axiosInstance';

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  start_date_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
  startDateTime?: Date | null;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  startDateTime?: Date | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const todoService = {
  getTodos: async (status?: string): Promise<Todo[]> => {
    try {
      const response = await axiosInstance.get<{ data: Todo[] } | Todo[]>(
        '/todos',
        status ? { params: { status } } : undefined
      );
      // Handle both nested data format and direct array format
      const data = (response.data as any).data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw error;
    }
  },

  getTodoById: async (id: number): Promise<Todo> => {
    const response = await axiosInstance.get<{ data: Todo } | Todo>(`/todos/${id}`);
    const data = (response.data as any).data || response.data;
    return data;
  },

  createTodo: async (data: CreateTodoRequest): Promise<Todo> => {
    try {
      console.log(data);
      const response = await axiosInstance.post<{ data: Todo } | Todo>('/todos', data);
      // Handle nested data.data format from Laravel response
      const todoData = (response.data as any).data || response.data;
      return todoData;
    } catch (error) {
      throw error;
    }
  },

  updateTodo: async (id: number, data: UpdateTodoRequest): Promise<Todo> => {
    const response = await axiosInstance.put<{ data: Todo } | Todo>(`/todos/${id}`, data);
    const todoData = (response.data as any).data || response.data;
    return todoData;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/todos/${id}`);
  },

  updateStatus: async (id: number, status: 'pending' | 'completed'): Promise<Todo> => {
    const response = await axiosInstance.put<{ data: Todo } | Todo>(`/todos/${id}`, { status });
    const todoData = (response.data as any).data || response.data;
    return todoData;
  },
};
