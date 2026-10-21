const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.')
    error.status = response.status
    throw error
  }
  return data
}

export const registerUser = (details) => request('/register', { method: 'POST', body: JSON.stringify(details) })
export const loginUser = (details) => request('/login', { method: 'POST', body: JSON.stringify(details) })
export const getMe = () => request('/me')
export const getTasks = () => request('/tasks')
export const createTask = (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) })
export const updateTask = (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) })
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })
