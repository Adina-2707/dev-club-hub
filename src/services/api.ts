const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    nickname?: string;
  };
  token: string;
}

class ApiService {
  private token: string | null = localStorage.getItem('token');

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(
    name: string,
    email: string,
    password: string,
    role: string,
    nickname?: string,
    avatar?: string
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', 'POST', {
      name,
      email,
      password,
      role,
      nickname,
      avatar,
    });
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', 'POST', { email, password });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me', 'GET');
  }

  async updateUser(updates: Record<string, unknown>) {
    return this.request('/auth/me', 'PUT', updates);
  }

  // Projects endpoints
  async getProjects() {
    return this.request('/projects', 'GET');
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`, 'GET');
  }

  async createProject(data: Record<string, unknown>) {
    return this.request('/projects', 'POST', data);
  }

  async updateProject(id: string, data: Record<string, unknown>) {
    return this.request(`/projects/${id}`, 'PUT', data);
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, 'DELETE');
  }

  async likeProject(id: string) {
    return this.request(`/projects/${id}/like`, 'POST');
  }

  async bookmarkProject(id: string) {
    return this.request(`/projects/${id}/bookmark`, 'POST');
  }

  // Teams endpoints
  async getTeams() {
    return this.request('/teams', 'GET');
  }

  async getTeam(id: string) {
    return this.request(`/teams/${id}`, 'GET');
  }

  async createTeam(data: Record<string, unknown>) {
    return this.request('/teams', 'POST', data);
  }

  async updateTeam(id: string, data: Record<string, unknown>) {
    return this.request(`/teams/${id}`, 'PUT', data);
  }

  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, 'DELETE');
  }

  async joinTeam(id: string, data: Record<string, unknown>) {
    return this.request(`/teams/${id}/join`, 'POST', data);
  }

  async leaveTeam(id: string) {
    return this.request(`/teams/${id}/leave`, 'POST');
  }

  // Blog endpoints
  async getBlogPosts() {
    return this.request('/blog', 'GET');
  }

  async getBlogPost(id: string) {
    return this.request(`/blog/${id}`, 'GET');
  }

  async createBlogPost(data: Record<string, unknown>) {
    return this.request('/blog', 'POST', data);
  }

  async updateBlogPost(id: string, data: Record<string, unknown>) {
    return this.request(`/blog/${id}`, 'PUT', data);
  }

  async deleteBlogPost(id: string) {
    return this.request(`/blog/${id}`, 'DELETE');
  }

  // Internships endpoints
  async getInternships() {
    return this.request('/internships', 'GET');
  }

  async getInternship(id: string) {
    return this.request(`/internships/${id}`, 'GET');
  }

  async createInternship(data: Record<string, unknown>) {
    return this.request('/internships', 'POST', data);
  }

  async updateInternship(id: string, data: Record<string, unknown>) {
    return this.request(`/internships/${id}`, 'PUT', data);
  }

  async deleteInternship(id: string) {
    return this.request(`/internships/${id}`, 'DELETE');
  }

  async applyInternship(data: Record<string, unknown>) {
    return this.request('/internships/apply', 'POST', data);
  }

  async updateApplicationStatus(id: string, status: string) {
    return this.request(`/internships/applications/${id}/status`, 'PUT', { status });
  }

  // Comments endpoints
  async getComments(targetId: string, targetType: 'project' | 'blog') {
    return this.request(`/comments?targetId=${targetId}&targetType=${targetType}`, 'GET');
  }

  async createComment(data: Record<string, unknown>) {
    return this.request('/comments', 'POST', data);
  }

  async deleteComment(id: string) {
    return this.request(`/comments/${id}`, 'DELETE');
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications', 'GET');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, 'PUT');
  }

  // Health check
  async healthCheck() {
    return this.request('/health', 'GET');
  }
}

export const apiService = new ApiService();
