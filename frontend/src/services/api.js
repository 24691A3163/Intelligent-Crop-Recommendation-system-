const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers
  }

  try {
    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      let errorDetail = 'API request failed'
      try {
        const errJson = await res.json()
        errorDetail = errJson.detail || errorDetail
      } catch (e) {
        errorDetail = `HTTP ${res.status}: ${res.statusText}`
      }
      throw new Error(errorDetail)
    }
    return await res.json()
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err)
    throw err
  }
}

export const api = {
  getHealth: () => request('/health'),
  getModels: () => request('/models'),
  getModelMetrics: () => request('/model-metrics'),
  predictCrop: (data, token = null) => request('/predict', {
    method: 'POST',
    body: JSON.stringify(data),
    token
  }),
  predictAllModels: (data, token = null) => request('/predict/all', {
    method: 'POST',
    body: JSON.stringify(data),
    token
  })
}

