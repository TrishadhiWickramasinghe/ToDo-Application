import axiosInstance from './axiosInstance';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/logout');
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/profile');
    return response.data;
  },
};
