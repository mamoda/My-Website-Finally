import { apiService } from './api';

class AuthService {
  async login(email, password) {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  async studentLogin(email, password) {
    try {
      const response = await apiService.studentLogin({ email, password });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('student', JSON.stringify(response.student));
        return response.student;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentStudent() {
    const studentStr = localStorage.getItem('student');
    return studentStr ? JSON.parse(studentStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getUserType() {
    if (localStorage.getItem('user')) return 'teacher';
    if (localStorage.getItem('student')) return 'student';
    return null;
  }
}

export const authService = new AuthService();