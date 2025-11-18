# GitHub API Rate Limit Issue & Solutions

## Problem
The app is hitting GitHub API rate limits (403 errors) because it makes too many requests:

### Current API Usage Per Search:
- **Search API**: 1 request
- **Per Repository** (×30 repos = 90 requests):
  - Repository details: 1 request
  - Labels: 1 request
  - Languages: 1 request
  
**Total: ~91 requests per search**

### GitHub Rate Limits:
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour

## Immediate Solutions

### Solution 1: Reduce API Calls (IMPLEMENTED)
✅ Reduced results per page from 100 to 30
✅ Disabled issue categories fetching (was making 6+ requests per repo)
✅ Added comprehensive logging to track API usage

### Solution 2: Add GitHub Personal Access Token (RECOMMENDED)

1. **Create a GitHub Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name: "ContribHub"
   - Select scopes: `public_repo` (or just read permissions)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Add Token to the App:**

Create a `.env` file in the project root:
```bash
VITE_GITHUB_TOKEN=your_github_token_here
```

3. **Update axios configuration:**

Create `src/utils/axios.js`:
\`\`\`javascript
import axios from 'axios'

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': import.meta.env.VITE_GITHUB_TOKEN 
      ? `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
      : undefined
  }
})

export default githubApi
\`\`\`

4. **Replace axios imports** in components with:
\`\`\`javascript
import githubApi from '../utils/axios'
// Replace axios.get() with githubApi.get()
\`\`\`

### Solution 3: Implement Caching

**Use localStorage to cache responses:**

\`\`\`javascript
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getCached = (key) => {
  const cached = localStorage.getItem(key)
  if (!cached) return null
  
  const { data, timestamp } = JSON.parse(cached)
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key)
    return null
  }
  return data
}

const setCache = (key, data) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
}
\`\`\`

### Solution 4: Lazy Load Data

Only fetch additional data when needed:
- Load basic repo info immediately
- Load languages/labels when user hovers or clicks
- Load issue categories on demand with a "Show Issues" button

## Updated Logging

The app now logs:
- 🔍 Search queries and parameters
- 📡 API requests being made
- ✅ Successful responses with data counts
- 📊 Rate limit remaining and reset time
- ❌ Errors with details
- ⚠️ Rate limit warnings

## Monitoring Rate Limits

Check your current rate limit status:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/rate_limit
```

Or in the browser console after a search:
```javascript
// Logged automatically after each search
// Look for: "📊 Rate Limit Remaining: X / 60"
```

## Best Practices

1. **Use Authentication**: Increases limit from 60 to 5,000/hour
2. **Cache Responses**: Avoid redundant requests
3. **Batch Requests**: Combine multiple small requests when possible
4. **Lazy Load**: Only fetch data when actually needed
5. **Show Rate Limit**: Display remaining requests to users
6. **Handle 403s Gracefully**: Show helpful error messages

## Current Status

- ✅ Added detailed logging
- ✅ Reduced per-page results to 30
- ✅ Disabled issue categories (too expensive)
- ✅ Better error messages with reset time
- ⏳ Token authentication (needs user setup)
- ⏳ Caching (future enhancement)
- ⏳ Lazy loading (future enhancement)

## Quick Fix for Testing

Wait for rate limit to reset (shown in error message), or:
1. Use a different IP address (mobile hotspot)
2. Add a GitHub token (recommended)
3. Reduce searches to test core functionality
