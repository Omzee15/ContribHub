import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import githubApi from '../utils/githubApi'
import IssueCard from '../components/IssueCard'
import './RepoDetailsPage.css'

function RepoDetailsPage() {
  const { owner, repo } = useParams()
  const navigate = useNavigate()
  const labelDropdownRef = useRef(null)
  const sortDropdownRef = useRef(null)
  const [repository, setRepository] = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')
  const [labelSearch, setLabelSearch] = useState('')
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  useEffect(() => {
    fetchRepositoryAndIssues()
  }, [owner, repo, filter, sortBy])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target)) {
        setShowLabelDropdown(false)
        setLabelSearch('')
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false)
      }
    }

    if (showLabelDropdown || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLabelDropdown, showSortDropdown])

  const fetchRepositoryAndIssues = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch repository details
      const repoResponse = await githubApi.get(`/repos/${owner}/${repo}`)
      setRepository(repoResponse.data)

      // Fetch open issues
      const params = {
        state: 'open',
        per_page: 100,
        sort: sortBy,
        direction: 'desc'
      }

      // Add label filter if not 'all'
      if (filter !== 'all') {
        params.labels = filter
      }

      const issuesResponse = await githubApi.get(`/repos/${owner}/${repo}/issues`, { params })
      
      // Filter out pull requests (GitHub API returns both issues and PRs)
      const actualIssues = issuesResponse.data.filter(issue => !issue.pull_request)
      setIssues(actualIssues)

    } catch (err) {
      console.error('Error fetching repository data:', err)
      setError(err.message || 'Failed to fetch repository data')
    } finally {
      setLoading(false)
    }
  }

  const getUniqueLabels = () => {
    const labelSet = new Set()
    issues.forEach(issue => {
      issue.labels.forEach(label => labelSet.add(label.name))
    })
    // Sort labels alphabetically, case-insensitive
    return Array.from(labelSet).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  }

  const getFilteredLabels = () => {
    const allLabels = getUniqueLabels()
    if (!labelSearch.trim()) {
      return allLabels
    }
    return allLabels.filter(label => 
      label.toLowerCase().includes(labelSearch.toLowerCase())
    )
  }

  const handleLabelSelect = (label) => {
    setFilter(label)
    setShowLabelDropdown(false)
    setLabelSearch('')
  }

  const getDisplayLabel = () => {
    if (filter === 'all') return 'All Issues'
    return filter
  }

  const sortOptions = [
    { value: 'created', label: 'Recently Created' },
    { value: 'updated', label: 'Recently Updated' },
    { value: 'comments', label: 'Most Comments' }
  ]

  const handleSortSelect = (value) => {
    setSortBy(value)
    setShowSortDropdown(false)
  }

  const getDisplaySort = () => {
    const option = sortOptions.find(opt => opt.value === sortBy)
    return option ? option.label : 'Recently Created'
  }

  const handleOpenInVSCode = () => {
    if (!repository) return
    
    // Use VS Code's URI scheme to clone the repository
    // This requires VS Code to be installed with the Git extension
    const cloneUrl = repository.clone_url
    const vscodeUrl = `vscode://vscode.git/clone?url=${encodeURIComponent(cloneUrl)}`
    
    // Open the VS Code URL
    window.location.href = vscodeUrl
    
    // Show a helpful message
    setTimeout(() => {
      alert('Opening in VS Code...\n\nNote: VS Code must be installed on your system.\nIf VS Code doesn\'t open, you can manually clone:\n' + cloneUrl)
    }, 500)
  }

  if (loading) {
    return (
      <div className="repo-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading repository details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="repo-details-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="repo-details-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"></path>
          </svg>
          Back to Search
        </button>
      </div>

      {/* Repository Info */}
      {repository && (
        <div className="repo-header">
          <div className="repo-title-section">
            <svg height="24" viewBox="0 0 16 16" width="24" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>
            <div className="repo-info-text">
              <h1 className="repo-name">
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                  {repository.full_name}
                </a>
              </h1>
              {repository.description && (
                <p className="repo-description">{repository.description}</p>
              )}
            </div>
          </div>

          <div className="repo-header-actions">
            <button 
              onClick={handleOpenInVSCode}
              className="vscode-button"
              title="Clone and open in VS Code"
            >
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M11.28 0L5.955 5.22 2.456 2.487 1.145 3.3v9.4l1.31.813 3.5-2.733L11.28 16l3.333-1.667V1.667L11.28 0zm.555 11.867l-4.803-3.734 4.803-3.733v7.467z"/>
              </svg>
              Open in VS Code
            </button>
            <a 
              href={repository.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-button"
            >
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              View on GitHub
            </a>
          </div>

          <div className="repo-stats">
            <div className="stat-item">
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
              </svg>
              <span>{repository.stargazers_count?.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
              </svg>
              <span>{repository.forks_count?.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
              </svg>
              <span>{repository.open_issues_count?.toLocaleString()} open issues</span>
            </div>
            {repository.language && (
              <div className="stat-item">
                <span className="language-dot"></span>
                <span>{repository.language}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="controls-section">
        <div className="filter-controls">
          <label>Filter by label:</label>
          <div className="searchable-dropdown" ref={labelDropdownRef}>
            <button 
              className="dropdown-button"
              onClick={() => setShowLabelDropdown(!showLabelDropdown)}
            >
              <span>{getDisplayLabel()}</span>
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
              </svg>
            </button>
            
            {showLabelDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-search">
                  <input
                    type="text"
                    placeholder="Search labels..."
                    value={labelSearch}
                    onChange={(e) => setLabelSearch(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                </div>
                <div className="dropdown-options">
                  <div 
                    className={`dropdown-option ${filter === 'all' ? 'selected' : ''}`}
                    onClick={() => handleLabelSelect('all')}
                  >
                    All Issues
                  </div>
                  {getFilteredLabels().length > 0 ? (
                    getFilteredLabels().map(label => (
                      <div 
                        key={label}
                        className={`dropdown-option ${filter === label ? 'selected' : ''}`}
                        onClick={() => handleLabelSelect(label)}
                      >
                        {label}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-no-results">
                      No labels found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <div className="searchable-dropdown" ref={sortDropdownRef}>
            <button 
              className="dropdown-button"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span>{getDisplaySort()}</span>
              <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
              </svg>
            </button>
            
            {showSortDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-options">
                  {sortOptions.map(option => (
                    <div 
                      key={option.value}
                      className={`dropdown-option ${sortBy === option.value ? 'selected' : ''}`}
                      onClick={() => handleSortSelect(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="issues-section">
        <div className="issues-header">
          <h2>Open Issues ({issues.length})</h2>
        </div>

        {issues.length === 0 ? (
          <div className="no-issues">
            <svg height="48" viewBox="0 0 16 16" width="48" fill="currentColor" opacity="0.4">
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
            </svg>
            <p>No open issues found{filter !== 'all' ? ` with label "${filter}"` : ''}.</p>
          </div>
        ) : (
          <div className="issues-list">
            {issues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RepoDetailsPage
