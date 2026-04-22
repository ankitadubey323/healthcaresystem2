import axios from 'axios'
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 15000,
})
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export const registerUser = (formData) => API.post('/auth/register', formData)
export const loginUser = (data) => API.post('/auth/login', data)
export const getProfile = () => API.get('/user/profile')
// export const updateProfile = (data) => API.put('/user/update', data)
export const updateProfile = (data) => API.put('/user/update', data)

export const uploadProfilePhoto = (formData) => API.put('/user/update', formData)
export const calculateBMI = (data) => API.post('/user/bmi', data)
// export const getNearbyHospitals = (lat, lon) => API.get(`/hospital/nearby?lat=${lat}&lon=${lon}`)
export const getNearbyHospitals = () => Promise.resolve({ data: { hospitals: [] } })
export const uploadDocument = (formData) => API.post('/document/upload', formData)
export const getDocuments = () => API.get('/document/list')
export const deleteDocument = (id) => API.delete(`/document/${id}`)
export const getLatestNews = () => API.get('/news/health')
export const getHealthNews = () => API.get('/news/health')

export default API