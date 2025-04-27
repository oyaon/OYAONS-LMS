import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { handleApiError } from './error-handling';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post('/api/auth/login', { email, password });
          const { user, accessToken, refreshToken } = response.data;
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set up axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error) {
          const appError = handleApiError(error);
          set({ error: appError.message, isLoading: false });
          throw appError;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post('/api/auth/register', { name, email, password });
          const { user, accessToken, refreshToken } = response.data;
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Set up axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error) {
          const appError = handleApiError(error);
          set({ error: appError.message, isLoading: false });
          throw appError;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        delete axios.defaults.headers.common['Authorization'];
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error('No refresh token available');

          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, newRefreshToken } = response.data;

          set({
            accessToken,
            refreshToken: newRefreshToken,
            isAuthenticated: true,
          });

          // Update axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } catch (error) {
          // If refresh fails, logout the user
          get().logout();
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up axios interceptors for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshAccessToken();
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout the user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
); 