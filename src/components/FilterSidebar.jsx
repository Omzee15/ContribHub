import { useState } from 'react'
import './FilterSidebar.css'

function FilterSidebar({ searchType, setSearchType, languages, setLanguages, issueLabels, setIssueLabels, sortBy, setSortBy }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false)
  const [languageSearch, setLanguageSearch] = useState('')
  const [labelSearch, setLabelSearch] = useState('')

  const availableLanguages = [
    'JavaScript',
    'Python',
    'Java',
    'TypeScript',
    'C++',
    'C#',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'Shell',
    'HTML',
    'CSS',
    'C',
    'Dart',
    'Scala',
    'R',
    'Perl',
  ]

  const commonIssueLabels = [
    'bug',
    'enhancement',
    'documentation',
    'good first issue',
    'help wanted',
    'question',
    'feature',
    'duplicate',
    'invalid',
    'wontfix',
    'dependencies',
    'security',
    'performance',
    'refactoring',
    'testing',
    'ui',
    'backend',
    'frontend',
    'api',
    'database',
  ]

  const toggleLanguage = (lang) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  const clearLanguages = () => {
    setLanguages([])
  }

  const toggleIssueLabel = (label) => {
    if (issueLabels.includes(label)) {
      setIssueLabels(issueLabels.filter(l => l !== label))
    } else {
      setIssueLabels([...issueLabels, label])
    }
  }

  const clearIssueLabels = () => {
    setIssueLabels([])
  }

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  )

  const filteredLabels = commonIssueLabels.filter(label =>
    label.toLowerCase().includes(labelSearch.toLowerCase())
  )

  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3 className="filter-title">Type</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="searchType"
              value="repositories"
              checked={searchType === 'repositories'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span>Repositories</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="searchType"
              value="users"
              checked={searchType === 'users'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span>Organizations</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Sort By</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="sortBy"
              value="stars"
              checked={sortBy === 'stars'}
              onChange={(e) => setSortBy(e.target.value)}
            />
            <span>⭐ Most Stars</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="sortBy"
              value="issues"
              checked={sortBy === 'issues'}
              onChange={(e) => setSortBy(e.target.value)}
            />
            <span>🐛 Most Issues</span>
          </label>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Languages</h3>
        <div className="language-dropdown">
          <button 
            className="dropdown-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>
              {languages.length === 0 
                ? 'Select languages...' 
                : `${languages.length} selected`}
            </span>
            <svg 
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              height="16" 
              viewBox="0 0 16 16" 
              width="16" 
              fill="currentColor"
            >
              <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span>{languages.length} selected</span>
                {languages.length > 0 && (
                  <button className="clear-button" onClick={clearLanguages}>
                    Clear all
                  </button>
                )}
              </div>
              <div className="dropdown-search">
                <input
                  type="text"
                  className="language-search-input"
                  placeholder="Search languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="dropdown-options">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => (
                    <label key={lang} className="dropdown-option">
                      <input
                        type="checkbox"
                        checked={languages.includes(lang)}
                        onChange={() => toggleLanguage(lang)}
                      />
                      <span>{lang}</span>
                    </label>
                  ))
                ) : (
                  <div className="no-results">No languages found</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {languages.length > 0 && (
          <div className="selected-languages">
            {languages.map((lang) => (
              <span key={lang} className="language-chip">
                {lang}
                <button 
                  className="remove-chip"
                  onClick={() => toggleLanguage(lang)}
                  aria-label={`Remove ${lang}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Issue Labels</h3>
        <div className="language-dropdown">
          <button 
            className="dropdown-button"
            onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
          >
            <span>
              {issueLabels.length === 0 
                ? 'Select issue labels...' 
                : `${issueLabels.length} selected`}
            </span>
            <svg 
              className={`dropdown-arrow ${isLabelDropdownOpen ? 'open' : ''}`}
              height="16" 
              viewBox="0 0 16 16" 
              width="16" 
              fill="currentColor"
            >
              <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
            </svg>
          </button>
          
          {isLabelDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span>{issueLabels.length} selected</span>
                {issueLabels.length > 0 && (
                  <button className="clear-button" onClick={clearIssueLabels}>
                    Clear all
                  </button>
                )}
              </div>
              <div className="dropdown-search">
                <input
                  type="text"
                  className="language-search-input"
                  placeholder="Search labels..."
                  value={labelSearch}
                  onChange={(e) => setLabelSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="dropdown-options">
                {filteredLabels.length > 0 ? (
                  filteredLabels.map((label) => (
                    <label key={label} className="dropdown-option">
                      <input
                        type="checkbox"
                        checked={issueLabels.includes(label)}
                        onChange={() => toggleIssueLabel(label)}
                      />
                      <span>{label}</span>
                    </label>
                  ))
                ) : (
                  <div className="no-results">No labels found</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {issueLabels.length > 0 && (
          <div className="selected-languages">
            {issueLabels.map((label) => (
              <span key={label} className="language-chip">
                {label}
                <button 
                  className="remove-chip"
                  onClick={() => toggleIssueLabel(label)}
                  aria-label={`Remove ${label}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default FilterSidebar
