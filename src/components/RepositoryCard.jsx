import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import githubApi from '../utils/githubApi'
import './RepositoryCard.css'

function RepositoryCard({ data, type }) {
  const navigate = useNavigate()
  const [repoDetails, setRepoDetails] = useState(null)
  const [labels, setLabels] = useState([])
  const [languages, setLanguages] = useState([])
  const [issueCategories, setIssueCategories] = useState({
    goodFirstIssue: 0,
    bug: 0,
    enhancement: 0,
    documentation: 0,
    helpWanted: 0,
    bounty: 0
  })

  useEffect(() => {
    if (type === 'repositories') {
      console.log('🎴 RepositoryCard mounted for:', data.name)
      fetchRepoDetails()
      fetchLanguages()
      // Only fetch labels if there are open issues
      if (data.open_issues_count > 0) {
        fetchLabelsWithCounts()
      }
      // Commenting out issue categories to reduce API calls
      // fetchCategorizedIssues()
    }
  }, [data])

  const fetchRepoDetails = async () => {
    try {
      console.log(`  📄 Fetching details for ${data.name}`)
      const response = await githubApi.get(data.url)
      setRepoDetails(response.data)
      console.log(`  ✅ Details fetched for ${data.name}`)
    } catch (error) {
      console.error(`  ❌ Error fetching repo details for ${data.name}:`, error.response?.status)
      if (error.response?.status === 403) {
        console.warn('  ⚠️ Rate limit exceeded')
      }
    }
  }

  const fetchLabelsWithCounts = async () => {
    try {
      console.log(`  🏷️ Fetching labels with counts for ${data.name}`)
      
      // First, get all labels in the repo
      const labelsResponse = await githubApi.get(`${data.url}/labels`, {
        params: { per_page: 100 }
      })
      
      // Then get open issues to count labels
      const issuesResponse = await githubApi.get(`${data.url}/issues`, {
        params: { 
          state: 'open',
          per_page: 100 // Limit to avoid too many API calls
        }
      })
      
      // Count how many open issues use each label
      const labelCounts = {}
      issuesResponse.data.forEach(issue => {
        issue.labels.forEach(label => {
          labelCounts[label.name] = (labelCounts[label.name] || 0) + 1
        })
      })
      
      // Filter to only labels that are actually used in open issues and add counts
      const labelsWithCounts = labelsResponse.data
        .filter(label => labelCounts[label.name] > 0)
        .map(label => ({
          ...label,
          count: labelCounts[label.name]
        }))
        .sort((a, b) => b.count - a.count) // Sort by count, descending
        .slice(0, 8) // Show top 8 most used labels
      
      setLabels(labelsWithCounts)
      console.log(`  ✅ Labels with counts fetched for ${data.name}:`, labelsWithCounts.length)
    } catch (error) {
      console.error(`  ❌ Error fetching labels for ${data.name}:`, error.response?.status)
      if (error.response?.status === 403) {
        console.warn('  ⚠️ Rate limit exceeded')
      }
    }
  }

  const fetchCategorizedIssues = async () => {
    try {
      const categories = {
        goodFirstIssue: 0,
        bug: 0,
        enhancement: 0,
        documentation: 0,
        helpWanted: 0,
        bounty: 0
      }

      // Fetch issues with different labels
      const labelQueries = [
        { key: 'goodFirstIssue', labels: ['good first issue', 'good-first-issue', 'beginner', 'beginner-friendly'] },
        { key: 'bug', labels: ['bug', 'bugs'] },
        { key: 'enhancement', labels: ['enhancement', 'feature', 'feature-request'] },
        { key: 'documentation', labels: ['documentation', 'docs'] },
        { key: 'helpWanted', labels: ['help wanted', 'help-wanted'] },
        { key: 'bounty', labels: ['bounty', 'bounties', 'reward'] }
      ]

      // Try to get issue counts for each category
      for (const query of labelQueries) {
        for (const label of query.labels) {
          try {
            const response = await githubApi.get(`${data.url}/issues`, {
              params: {
                state: 'open',
                labels: label,
                per_page: 1
              }
            })
            // GitHub API doesn't return total count in response, but we can check Link header
            // For now, we'll just check if issues exist with this label
            if (response.data.length > 0) {
              // Get all issues with this label to count them (limited to 100 for performance)
              const fullResponse = await githubApi.get(`${data.url}/issues`, {
                params: {
                  state: 'open',
                  labels: label,
                  per_page: 100
                }
              })
              categories[query.key] = Math.max(categories[query.key], fullResponse.data.length)
              break // Found this category, move to next
            }
          } catch (error) {
            // Continue to next label
          }
        }
      }

      setIssueCategories(categories)
    } catch (error) {
      console.error('Error fetching categorized issues:', error)
    }
  }

  const fetchLanguages = async () => {
    try {
      console.log(`  🔤 Fetching languages for ${data.name}`)
      const response = await githubApi.get(data.languages_url)
      const langData = response.data
      const total = Object.values(langData).reduce((sum, bytes) => sum + bytes, 0)
      const langArray = Object.entries(langData)
        .map(([name, bytes]) => ({
          name,
          percentage: ((bytes / total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5)
      setLanguages(langArray)
      console.log(`  ✅ Languages fetched for ${data.name}:`, langArray.map(l => l.name))
    } catch (error) {
      console.error(`  ❌ Error fetching languages for ${data.name}:`, error.response?.status)
      if (error.response?.status === 403) {
        console.warn('  ⚠️ Rate limit exceeded')
      }
    }
  }

  if (type === 'users') {
    return (
      <div className="repo-card">
        <div className="card-header">
          <img src={data.avatar_url} alt={data.login} className="org-avatar" />
          <div>
            <a href={data.html_url} target="_blank" rel="noopener noreferrer" className="repo-name">
              {data.login}
            </a>
            <p className="repo-description">{data.type}</p>
          </div>
        </div>
      </div>
    )
  }

  const handleCardClick = (e) => {
    // Don't navigate if clicking on external link or other interactive elements
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return
    }
    // Navigate to repo details page
    const [owner, repo] = data.full_name.split('/')
    navigate(`/repo/${owner}/${repo}`)
  }

  return (
    <div className="repo-card clickable" onClick={handleCardClick}>
      <div className="card-header">
        <div className="repo-name-section">
          <span className="repo-name-text">{data.full_name}</span>
          <a 
            href={data.html_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="external-link"
            onClick={(e) => e.stopPropagation()}
          >
            <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
              <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"></path>
            </svg>
          </a>
        </div>
      </div>

      {data.description && (
        <p className="repo-description">{data.description}</p>
      )}

      {languages.length > 0 && (
        <div className="tech-stack">
          <h4>Tech Stack:</h4>
          <div className="language-tags">
            {languages.map((lang) => (
              <span key={lang.name} className="language-tag">
                {lang.name} ({lang.percentage}%)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="repo-stats">
        <div className="stat">
          <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
          </svg>
          <span>{data.stargazers_count?.toLocaleString() || 0}</span>
        </div>

        <div className="stat">
          <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
          </svg>
          <span>{data.forks_count?.toLocaleString() || 0}</span>
        </div>

        <div className="stat">
          <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
          </svg>
          <span>{data.open_issues_count?.toLocaleString() || 0} open issues</span>
        </div>
      </div>

      {/* View on GitHub Button */}
      <div className="repo-actions">
        <a 
          href={data.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-button"
          onClick={(e) => e.stopPropagation()}
        >
          <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          View on GitHub
        </a>
      </div>

      {/* Issue Categories */}
      {(issueCategories.goodFirstIssue > 0 || 
        issueCategories.bug > 0 || 
        issueCategories.enhancement > 0 || 
        issueCategories.helpWanted > 0 ||
        issueCategories.bounty > 0) && (
        <div className="issue-categories">
          <h4>Open Issue Categories:</h4>
          <div className="category-grid">
            {issueCategories.goodFirstIssue > 0 && (
              <div className="category-item good-first">
                <span className="category-icon">🌱</span>
                <div className="category-info">
                  <span className="category-label">Good First Issue</span>
                  <span className="category-count">{issueCategories.goodFirstIssue}</span>
                </div>
              </div>
            )}
            {issueCategories.bug > 0 && (
              <div className="category-item bug">
                <span className="category-icon">🐛</span>
                <div className="category-info">
                  <span className="category-label">Bugs</span>
                  <span className="category-count">{issueCategories.bug}</span>
                </div>
              </div>
            )}
            {issueCategories.enhancement > 0 && (
              <div className="category-item enhancement">
                <span className="category-icon">✨</span>
                <div className="category-info">
                  <span className="category-label">Enhancements</span>
                  <span className="category-count">{issueCategories.enhancement}</span>
                </div>
              </div>
            )}
            {issueCategories.documentation > 0 && (
              <div className="category-item documentation">
                <span className="category-icon">📚</span>
                <div className="category-info">
                  <span className="category-label">Documentation</span>
                  <span className="category-count">{issueCategories.documentation}</span>
                </div>
              </div>
            )}
            {issueCategories.helpWanted > 0 && (
              <div className="category-item help-wanted">
                <span className="category-icon">🙋</span>
                <div className="category-info">
                  <span className="category-label">Help Wanted</span>
                  <span className="category-count">{issueCategories.helpWanted}</span>
                </div>
              </div>
            )}
            {issueCategories.bounty > 0 && (
              <div className="category-item bounty">
                <span className="category-icon">💰</span>
                <div className="category-info">
                  <span className="category-label">Bounty</span>
                  <span className="category-count">{issueCategories.bounty}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {labels.length > 0 && (
        <div className="labels-section">
          <h4>Issue Labels (Open Issues):</h4>
          <div className="labels">
            {labels.map((label) => {
              // Calculate luminance to determine if text should be white or black
              const hex = label.color
              const r = parseInt(hex.substr(0, 2), 16)
              const g = parseInt(hex.substr(2, 2), 16)
              const b = parseInt(hex.substr(4, 2), 16)
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
              const textColor = luminance > 0.5 ? '#000' : '#fff'
              
              return (
                <span
                  key={label.id}
                  className="label"
                  style={{ 
                    backgroundColor: `#${label.color}`,
                    color: textColor,
                    borderColor: luminance > 0.7 ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                  }}
                >
                  {label.name} ({label.count})
                </span>
              )
            })}
          </div>
        </div>
      )}

      {data.language && (
        <div className="primary-language">
          <span className="language-dot"></span>
          {data.language}
        </div>
      )}
    </div>
  )
}

export default RepositoryCard
