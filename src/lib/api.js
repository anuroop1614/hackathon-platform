// API service for database operations
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://hackon-cloud-project.web.app/api'
  : 'http://localhost:3001';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // User API methods
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserByUid(uid) {
    return this.request(`/users/${uid}`);
  }

  // Hackathon API methods
  async createHackathon(hackathonData) {
    return this.request('/hackathons', {
      method: 'POST',
      body: JSON.stringify(hackathonData),
    });
  }

  async getHackathons() {
    return this.request('/hackathons');
  }

  async getHackathonsByFaculty(facultyId) {
    return this.request(`/hackathons/faculty/${facultyId}`);
  }

  async deleteHackathon(hackathonId, facultyId) {
    return this.request(`/hackathons/${hackathonId}`, {
      method: 'DELETE',
      body: JSON.stringify({ faculty_id: facultyId }),
    });
  }

  // Registration API methods
  async createRegistration(registrationData) {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async getRegistrationsByStudent(studentId) {
    return this.request(`/registrations/student/${studentId}`);
  }

  async deleteRegistration(hackathonId, studentId) {
    return this.request('/registrations', {
      method: 'DELETE',
      body: JSON.stringify({ hackathon_id: hackathonId, student_id: studentId }),
    });
  }

  async isStudentRegistered(studentId, hackathonId) {
    try {
      const registrations = await this.getRegistrationsByStudent(studentId);
      return registrations.some(reg => reg.hackathon_id === hackathonId);
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
