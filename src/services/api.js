const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: credentials,
    });
  }

  // Student Authentication
  async studentLogin(credentials) {
    return this.request('/student/login', {
      method: 'POST',
      body: credentials,
    });
  }

  // Student Dashboard
  async getStudentDashboard() {
    return this.request('/student/dashboard');
  }

  // Student Assignments
  async getStudentAssignments() {
    return this.request('/student/assignments');
  }

  // Student Classes
  async getStudentClasses() {
    return this.request('/student/classes');
  }

  // Student Lessons
  async getStudentLessons() {
    return this.request('/student/lessons');
  }

  // Students
  async getStudents() {
    return this.request('/students');
  }

  async createStudent(student) {
    return this.request('/students', {
      method: 'POST',
      body: student,
    });
  }

  async updateStudent(id, student) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: student,
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Lessons
  async getLessons() {
    return this.request('/lessons');
  }

  async createLesson(lesson) {
    return this.request('/lessons', {
      method: 'POST',
      body: lesson,
    });
  }

  // Assignments
  async getAssignments() {
    return this.request('/assignments');
  }

  async createAssignment(assignment) {
    return this.request('/assignments', {
      method: 'POST',
      body: assignment,
    });
  }

  async updateAssignment(id, assignment) {
    return this.request(`/assignments/${id}`, {
      method: 'PUT',
      body: assignment,
    });
  }

  // Classes
  async getClasses() {
    return this.request('/classes');
  }

  async createClass(classData) {
    return this.request('/classes', {
      method: 'POST',
      body: classData,
    });
  }

  // Resources
  async getResources() {
    return this.request('/resources');
  }

  async createResource(formData) {
    return this.request('/resources', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

export const apiService = new ApiService();