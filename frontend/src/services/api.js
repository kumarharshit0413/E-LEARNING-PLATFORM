// The base URL of your backend server
const API_URL = 'http://localhost:5000/api';

/**
 * A helper function to perform fetch requests and automatically handle
 * authentication tokens and errors.
 */
async function request(endpoint, method = 'GET', body = null) {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const resJson = await response.json();

    if (!response.ok) {
      throw new Error(resJson.error || `HTTP error! status: ${response.status}`);
    }
    return resJson;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const authService = {
  login: (email, password) => request('/users/login', 'POST', { email, password }),
  register: (data) => request('/users/register', 'POST', data),
  getProfile: () => request('/users/profile', 'GET'),
};

export const courseService = {
  getAll: () => request('/courses', 'GET'),
  getById: (id) => request(`/courses/${id}`, 'GET'),
  create: (data) => request('/courses', 'POST', data),
  getInstructorCourses: () => request('/courses/my-courses', 'GET'),
  like: (courseId) => request(`/courses/${courseId}/like`, 'POST'),
  addComment: (courseId, text) => request(`/courses/${courseId}/comment`, 'POST', { text }),
  addLesson: (courseId, formData) => {
    const url = `${API_URL}/courses/${courseId}/lessons`;
    const token = localStorage.getItem('token');
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    }).then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error) });
        }
        return response.json();
    });
  },
  
};

export const enrollmentService = {
  enroll: (courseId) => request(`/enroll/${courseId}`, 'POST'),
  getEnrolled: () => request('/enroll/my-courses', 'GET'),
};
