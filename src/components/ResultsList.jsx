import { useEffect, useState } from 'react'
import githubApi from '../utils/githubApi'
import RepositoryCard from './RepositoryCard'
import './ResultsList.css'

function ResultsList({ searchQuery, searchType, languages, issueLabels, sortBy, results, setResults, loading, setLoading }) {
  const [allResults, setAllResults] = useState([])
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const resultsPerPage = 30

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let url = ''
        let params = {
          per_page: 30,
          page: currentPage,
          sort: sortBy === 'issues' ? 'updated' : 'stars',
          order: 'desc'
        }

        if (!searchQuery) {
          // When search is blank, show repositories sorted by most issues
          if (searchType === 'repositories') {
            url = 'https://api.github.com/search/repositories'
            params.q = 'stars:>100' // Get repos with at least 100 stars to ensure quality
            params.sort = 'updated' // We'll sort by issues after fetching
            console.log('🔍 Fetching top repositories (no search query)')
          } else {
            // For organizations, we need a search query
            setResults([])
            setAllResults([])
            setTotalCount(0)
            setLoading(false)
            return
          }
        } else {
          // Normal search with query
          console.log('🔍 Fetching results for:', searchQuery, 'Type:', searchType, 'Sort:', sortBy, 'Page:', currentPage)
          params.q = searchQuery
          
          if (searchType === 'repositories') {
            url = 'https://api.github.com/search/repositories'
          } else {
            url = 'https://api.github.com/search/users'
            params.q += ' type:org'
          }
        }

        console.log('📡 API Request:', url, params)
        const response = await githubApi.get(url, { params })
        const items = response.data.items || []
        setTotalCount(response.data.total_count || 0)
        
        console.log('✅ Received', items.length, 'results out of', response.data.total_count, 'total')
        console.log('📊 Rate Limit Remaining:', response.headers['x-ratelimit-remaining'], '/', response.headers['x-ratelimit-limit'])
        console.log('🔄 Rate Limit Resets:', new Date(response.headers['x-ratelimit-reset'] * 1000).toLocaleTimeString())
        
        // Sort by issues if that's selected
        if (sortBy === 'issues' && searchType === 'repositories') {
          items.sort((a, b) => (b.open_issues_count || 0) - (a.open_issues_count || 0))
        }
        
        setAllResults(items)
      } catch (error) {
        console.error('❌ Error fetching results:', error)
        console.error('Error details:', error.response?.data)
        if (error.response?.status === 403) {
          const resetTime = error.response.headers['x-ratelimit-reset']
          const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleTimeString() : 'unknown'
          setError(`GitHub API rate limit exceeded. Resets at ${resetDate}. Please wait or add a GitHub Personal Access Token.`)
        } else {
          setError(error.message || 'Failed to fetch results')
        }
        setAllResults([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchResults, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, searchType, sortBy, currentPage])

  // Filter results by selected languages and issue labels
  useEffect(() => {
    console.log('🔧 Filter effect triggered. Languages:', languages, 'Issue Labels:', issueLabels, 'AllResults:', allResults.length)
    
    // If no filters, just use all results immediately
    if (searchType !== 'repositories' || (languages.length === 0 && issueLabels.length === 0)) {
      console.log('➡️ No filters, using all', allResults.length, 'results')
      setResults(allResults)
      return
    }

    // Filter by languages and/or issue labels
    const filterResults = async () => {
      console.log('🔍 Filtering by languages:', languages, 'and issue labels:', issueLabels)
      setLoading(true)
      try {
        let filtered = [...allResults]
        
        // Filter by languages if selected
        if (languages.length > 0) {
          const languageFiltered = []
          let apiCallCount = 0
          
          for (const repo of filtered) {
            try {
              apiCallCount++
              console.log(`📞 API Call ${apiCallCount}/${filtered.length}: Fetching languages for ${repo.name}`)
              const response = await githubApi.get(repo.languages_url)
              const repoLanguages = Object.keys(response.data)
              
              const hasMatchingLanguage = languages.some(lang => 
                repoLanguages.includes(lang)
              )
              
              if (hasMatchingLanguage) {
                languageFiltered.push(repo)
              }
            } catch (error) {
              console.error('❌ Error fetching repo languages:', error)
              if (error.response?.status === 403) {
                console.warn('⚠️ Rate limit hit during language filtering. Stopping.')
                break
              }
            }
          }
          filtered = languageFiltered
          console.log('✅ After language filter:', filtered.length, 'repos')
        }
        
        // Filter by issue labels if selected
        if (issueLabels.length > 0 && filtered.length > 0) {
          const labelFiltered = []
          let apiCallCount = 0
          
          for (const repo of filtered) {
            try {
              apiCallCount++
              console.log(`📞 API Call ${apiCallCount}/${filtered.length}: Fetching labels for ${repo.name}`)
              
              // Get open issues to check their labels
              const response = await githubApi.get(`${repo.url}/issues`, {
                params: { 
                  state: 'open',
                  per_page: 100
                }
              })
              
              // Check if any open issue has any of the selected labels
              const hasMatchingLabel = response.data.some(issue => 
                issue.labels.some(label => 
                  issueLabels.some(selectedLabel => 
                    label.name.toLowerCase().includes(selectedLabel.toLowerCase()) ||
                    selectedLabel.toLowerCase().includes(label.name.toLowerCase())
                  )
                )
              )
              
              if (hasMatchingLabel) {
                console.log(`  ✅ ${repo.name} has matching labels!`)
                labelFiltered.push(repo)
              }
            } catch (error) {
              console.error('❌ Error fetching repo issues:', error)
              if (error.response?.status === 403) {
                console.warn('⚠️ Rate limit hit during label filtering. Stopping.')
                break
              }
            }
          }
          filtered = labelFiltered
          console.log('✅ After label filter:', filtered.length, 'repos')
        }
        
        // Apply sorting to filtered results
        if (sortBy === 'issues') {
          filtered.sort((a, b) => (b.open_issues_count || 0) - (a.open_issues_count || 0))
        } else {
          filtered.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        }
        
        setResults(filtered)
      } catch (error) {
        console.error('❌ Error filtering:', error)
        setResults(allResults)
      } finally {
        setLoading(false)
      }
    }

    filterResults()
  }, [allResults, languages, issueLabels, searchType, sortBy])

  // Reset to page 1 when search query or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, searchType, languages, issueLabels, sortBy])

  const totalPages = Math.ceil(totalCount / resultsPerPage)
  const maxPagesToShow = 1000 // GitHub API limit

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.min(totalPages, maxPagesToShow)) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const showPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    // Limit to GitHub API maximum
    endPage = Math.min(endPage, maxPagesToShow)

    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          className="pagination-button"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(<span key="ellipsis-1" className="pagination-ellipsis">...</span>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      )
    }

    if (endPage < Math.min(totalPages, maxPagesToShow)) {
      if (endPage < Math.min(totalPages, maxPagesToShow) - 1) {
        pages.push(<span key="ellipsis-2" className="pagination-ellipsis">...</span>)
      }
      pages.push(
        <button
          key={Math.min(totalPages, maxPagesToShow)}
          className="pagination-button"
          onClick={() => handlePageChange(Math.min(totalPages, maxPagesToShow))}
        >
          {Math.min(totalPages, maxPagesToShow)}
        </button>
      )
    }

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        {pages}
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= Math.min(totalPages, maxPagesToShow)}
        >
          Next →
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <main className="results-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="results-list">
        <div className="empty-state">
          <h2>Error loading results</h2>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  if (results.length === 0 && !loading) {
    return (
      <main className="results-list">
        <div className="empty-state">
          <svg height="64" viewBox="0 0 16 16" width="64" fill="currentColor">
            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-8.997 0A4.5 4.5 0 0 0 11.5 7Z"></path>
          </svg>
          <h2>No results found</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      </main>
    )
  }

  return (
    <main className="results-list">
      <div className="results-header">
        <h2>
          {!searchQuery && 'Top '}
          {totalCount.toLocaleString()} {searchType === 'repositories' ? 'repositories' : 'organizations'}
          {!searchQuery && ` (sorted by ${sortBy === 'issues' ? 'most issues' : 'most stars'})`}
          {languages.length > 0 && ` with ${languages.join(', ')}`}
          {issueLabels.length > 0 && ` having issues labeled: ${issueLabels.join(', ')}`}
        </h2>
        {totalCount > resultsPerPage && (
          <p style={{ fontSize: '14px', color: 'var(--color-fg-muted)', marginTop: '8px' }}>
            Showing page {currentPage} of {Math.min(totalPages, maxPagesToShow).toLocaleString()}
          </p>
        )}
      </div>
      <div className="results-container">
        {results.map((item) => (
          <RepositoryCard key={item.id} data={item} type={searchType} />
        ))}
      </div>
      {renderPagination()}
    </main>
  )
}

export default ResultsList
