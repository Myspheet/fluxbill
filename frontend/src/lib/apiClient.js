import axios from 'axios'

const TOKEN_KEY = 'fluxbill_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
})

// Attach the Sanctum bearer token on every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalise FluxBill's standardised error shape:
//   { error: { code, message, field, request_id } }
// into a thrown Error the UI can read.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data?.error ?? error.response?.data;

    const normalised = new Error(
      payload?.message || error.message || 'Request failed'
    );

    normalised.code = payload?.code;
    normalised.field = payload?.field;
    normalised.requestId = payload?.request_id;
    normalised.status = error.response?.status;

    return Promise.reject(normalised);
  },
)

export default api
