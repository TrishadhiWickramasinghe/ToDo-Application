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
  images?: File[];
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
      const hasImages = Array.isArray(data.images) && data.images.length > 0;

      if (hasImages) {
        // ── Multipart path: images require FormData ──────────────────────────
        const formData = new FormData();
        formData.append('title', data.title);

        if (data.description?.trim()) {
          formData.append('description', data.description.trim());
        }

        if (data.startDateTime != null) {
          // startDateTime has already been serialised to an ISO string in the
          // calling page, cast back here so we can append it as a string.
          formData.append('startDateTime', String(data.startDateTime));
        }

        // Append every image under images[] so Laravel receives an array
        data.images!.forEach((file) => formData.append('images[]', file));

        // Setting Content-Type to undefined removes the default
        // 'application/json' header and lets the browser (XHR/fetch) add
        // 'multipart/form-data; boundary=…' automatically.
        const response = await axiosInstance.post<{ data: Todo } | Todo>(
          '/todos',
          formData,
          { headers: { 'Content-Type': undefined as any } }
        );
        const todoData = (response.data as any).data || response.data;
        return todoData;
      }

      // ── JSON path: no images – existing behaviour, unchanged ────────────────
      // Strip the images key (empty/undefined) so it is never sent in JSON.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { images: _images, ...jsonPayload } = data;
      const response = await axiosInstance.post<{ data: Todo } | Todo>(
        '/todos',
        jsonPayload
      );
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
