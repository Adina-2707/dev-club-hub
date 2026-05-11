const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim() ?? '';
const baseUrl = rawApiBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = baseUrl ? (baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`) : '/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'alumni' | 'admin';
  avatar?: string;
  nickname?: string;
  bio?: string;
  expertise?: string;
  github?: string;
  linkedin?: string;
  links?: string[];
  achievements?: string[];
  rating?: number;
  blocked?: boolean;
  banReason?: string | null;
}

export interface AdminProject {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
  };
}

export interface AdminComment {
  id: string;
  text: string;
  authorName: string;
  targetType: string;
  targetId: string;
  createdAt: string;
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

export interface AlumniStory {
  id: string;
  title: string;
  content: string;
  storyType: 'success' | 'career';
  alumniId: string;
  createdAt: string;
  alumniName?: string;
  alumniAvatar?: string;
}

export interface AlumniProfile extends User {
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    githubLink: string;
  }>;
  stories?: AlumniStory[];
}

export interface MentorRequestParticipant {
  id: string;
  name: string;
  avatar?: string;
}

export interface MentorRequest {
  id: string;
  studentId: string;
  mentorId: string;
  message?: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  student?: MentorRequestParticipant;
  mentor?: MentorRequestParticipant;
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
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
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
      let errorMessage: unknown = errorData.error;
      const responseError = errorData as { banReason?: string | null };
      const banReason = responseError.banReason;

      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.map((item) => {
          if (typeof item === 'object' && item !== null && 'message' in item) {
            return (item as { message: string }).message;
          }
          return String(item);
        }).join('; ');
      } else if (typeof errorMessage === 'object' && errorMessage !== null) {
        errorMessage = JSON.stringify(errorMessage);
      }

      const message = typeof errorMessage === 'string' && errorMessage ? errorMessage : `HTTP ${response.status}`;
      throw new Error(banReason ? `${message}: ${banReason}` : message);
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

  // Generic API methods
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  async post<T = unknown>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, 'POST', body);
  }

  async put<T = unknown>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  async patch<T = unknown>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body);
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }

  async getCurrentUser() {
    return this.request('/auth/me', 'GET');
  }

  async updateUser(updates: Record<string, unknown>) {
    return this.request('/auth/me', 'PUT', updates);
  }

  async createMentorRequest(mentorId: string, message?: string) {
    return this.request<MentorRequest>('/mentor-requests', 'POST', {
      mentorId,
      message,
    });
  }

  async getMyMentorRequests() {
    return this.request<MentorRequest[]>('/mentor-requests/my', 'GET');
  }

  async updateMentorRequestStatus(id: string, status: 'accepted' | 'rejected') {
    return this.request<MentorRequest>(`/mentor-requests/${id}`, 'PATCH', {
      status,
    });
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

  async updateTeamMemberRole(id: string, memberId: string, data: Record<string, unknown>) {
    return this.request(`/teams/${id}/members/${memberId}`, 'PUT', data);
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

  async getUsers() {
    return this.request<User[]>('/users', 'GET');
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, 'DELETE');
  }

  async blockUser(id: string, reason?: string) {
    return this.patch(`/users/${id}/block`, { status: 'block', reason });
  }

  async unblockUser(id: string) {
    return this.patch(`/users/${id}/unblock`);
  }

  async getAdminComments() {
    return this.request<AdminComment[]>('/comments/admin', 'GET');
  }

  // Mentor reviews endpoints
  async getMentorReviews(mentorId: string) {
    return this.request(`/mentor-reviews/${mentorId}`, 'GET');
  }

  async createMentorReview(data: Record<string, unknown>) {
    return this.request('/mentor-reviews', 'POST', data);
  }

  async deleteMentorReview(id: string) {
    return this.request(`/mentor-reviews/${id}`, 'DELETE');
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications', 'GET');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, 'PUT');
  }

  // Alumni endpoints
  async getAlumniProfile(alumniId: string) {
    return this.request<AlumniProfile>(`/alumni/${alumniId}`, 'GET');
  }

  async getAlumniStories(alumniId?: string) {
    const endpoint = alumniId ? `/alumni-stories?alumniId=${alumniId}` : '/alumni-stories';
    return this.request<AlumniStory[]>(endpoint, 'GET');
  }

  async createAlumniStory(data: Record<string, unknown>) {
    return this.request('/alumni-stories', 'POST', data);
  }

  async updateAlumniStory(id: string, data: Record<string, unknown>) {
    return this.request(`/alumni-stories/${id}`, 'PUT', data);
  }

  async deleteAlumniStory(id: string) {
    return this.request(`/alumni-stories/${id}`, 'DELETE');
  }

  // Health check
  async healthCheck() {
    return this.request('/health', 'GET');
  }
}

export const apiService = new ApiService();
export const api = apiService;
