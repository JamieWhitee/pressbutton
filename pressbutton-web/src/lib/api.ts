// 1. Environment variable (fixed syntax for Next.js)
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api';

// 2. Request interfaces (what frontend sends to backend)
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string | undefined;  // Optional field
}

export interface LoginRequest {
  email: string;
  password: string;
}

// 3. Response interfaces (what backend sends to frontend)
export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;  // Backend sends Date, frontend receives string
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage if it exists (browser only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  // Method to set/store token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  // Method to get current token
  getToken(): string | null {
    return this.token;
  }

  // Private method for making requests (the tricky part!)
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add JWT token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth methods
  async register(data: RegisterRequest): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Automatically store token after successful login
    this.setToken(response.access_token);

    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'GET',
    });
  }

  logout(): void {
    this.setToken(null);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
