import axios from 'axios'

// Create axios instance with GitHub token if available
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: import.meta.env.VITE_GITHUB_TOKEN 
    ? {
        'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    : {
        'Accept': 'application/vnd.github.v3+json'
      }
})

// Add request interceptor for logging
githubApi.interceptors.request.use(
  (config) => {
    console.log('🔐 Making authenticated request to:', config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for rate limit logging
githubApi.interceptors.response.use(
  (response) => {
    const remaining = response.headers['x-ratelimit-remaining']
    const limit = response.headers['x-ratelimit-limit']
    const reset = response.headers['x-ratelimit-reset']
    
    if (remaining && limit) {
      console.log(`📊 Rate Limit: ${remaining}/${limit} remaining`)
      if (reset) {
        console.log(`🔄 Resets at: ${new Date(reset * 1000).toLocaleTimeString()}`)
      }
      
      // Warn if running low
      if (parseInt(remaining) < 100) {
        console.warn(`⚠️ Low on API requests! Only ${remaining} remaining`)
      }
    }
    
    return response
  },
  (error) => {
    if (error.response?.status === 403) {
      const reset = error.response.headers['x-ratelimit-reset']
      if (reset) {
        console.error(`❌ Rate limit exceeded! Resets at ${new Date(reset * 1000).toLocaleTimeString()}`)
      }
    }
    return Promise.reject(error)
  }
)

export default githubApi
