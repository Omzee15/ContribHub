import './SortOptions.css'

function SortOptions({ sortBy, setSortBy }) {
  return (
    <div className="sort-options">
      <label className="sort-label">Sort:</label>
      <select 
        className="sort-select" 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="stars">⭐ Most Stars</option>
        <option value="issues">🐛 Most Issues</option>
      </select>
    </div>
  )
}

export default SortOptions
