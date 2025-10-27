import { apiClient } from '@/lib/api-client';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
    });
    
    // Store auth token and user ID
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    
    return response.data;
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', {
      email: data.email,
      password: data.password,
    });
    
    // Store auth token and user ID
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    
    return response.data;
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/signout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
  },

  getSession(): { token: string | null; userId: string | null } {
    return {
      token: localStorage.getItem('authToken'),
      userId: localStorage.getItem('userId'),
    };
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};
