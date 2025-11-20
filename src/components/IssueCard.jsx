import { useState } from 'react'
import { generateIssueAnalysis } from '../utils/geminiApi'
import './IssueCard.css'

function IssueCard({ issue }) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [summary, setSummary] = useState(null)
  const [aiPrompt, setAiPrompt] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate a simple one-liner summary from the issue body or title
  const getQuickSummary = () => {
    if (!issue.body || !issue.body.trim()) {
      return issue.title
    }

    // Clean up the body text
    let body = issue.body.trim()
    
    // Remove markdown code blocks
    body = body.replace(/```[\s\S]*?```/g, '')
    
    // Remove markdown headers
    body = body.replace(/^#+\s+/gm, '')
    
    // Remove markdown links but keep the text
    body = body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    
    // Remove extra whitespace and newlines
    body = body.replace(/\s+/g, ' ').trim()
    
    // Try to find the first meaningful sentence
    const sentences = body.split(/[.!?]\s+/)
    
    for (let sentence of sentences) {
      sentence = sentence.trim()
      // Skip very short sentences (likely headers or fragments)
      if (sentence.length > 20 && sentence.length < 150) {
        return sentence.endsWith('.') ? sentence : sentence + '.'
      }
    }
    
    // If no good sentence found, take first 120 chars
    if (body.length > 120) {
      return body.substring(0, 120) + '...'
    }
    
    // Fallback to title if body is too short or unclear
    return body || issue.title
  }

  // Generate AI analysis when user clicks Show AI Prompt
  const handleShowPrompt = async () => {
    if (!showPrompt) {
      // User is opening the prompt section
      setShowPrompt(true)
      
      // Only fetch if we haven't already
      if (!aiPrompt && !isLoading) {
        setIsLoading(true)
        try {
          const analysis = await generateIssueAnalysis(issue)
          setSummary(analysis.summary)
          setAiPrompt(analysis.aiPrompt)
        } catch (error) {
          console.error('Error generating analysis:', error)
          // Fallback to simple summary
          setSummary(issue.title.substring(0, 100))
          setAiPrompt(`Help me solve this GitHub issue: ${issue.title}\n\nDescription: ${issue.body || 'No description provided'}`)
        } finally {
          setIsLoading(false)
        }
      }
    } else {
      // User is closing the prompt section
      setShowPrompt(false)
    }
  }

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(aiPrompt)
    alert('AI prompt copied to clipboard!')
  }

  // Calculate luminance for label text color
  const getLabelTextColor = (hexColor) => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000' : '#fff'
  }

  return (
    <div className="issue-card">
      <div className="issue-header">
        <div className="issue-title-section">
          <svg className="issue-icon" height="16" viewBox="0 0 16 16" width="16" fill="#3fb950">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
          </svg>
          <h3 className="issue-title">
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
              #{issue.number}: {issue.title}
            </a>
          </h3>
        </div>
        <span className="issue-number">#{issue.number}</span>
      </div>

      {/* One-liner Summary */}
      <div className="issue-summary">
        <strong>Summary:</strong> {getQuickSummary()}
      </div>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="issue-labels">
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className="issue-label"
              style={{
                backgroundColor: `#${label.color}`,
                color: getLabelTextColor(label.color),
                borderColor: getLabelTextColor(label.color) === '#000' ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Issue Meta Info */}
      <div className="issue-meta">
        <span>Opened by {issue.user.login}</span>
        <span>•</span>
        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
        {issue.comments > 0 && (
          <>
            <span>•</span>
            <span>{issue.comments} comments</span>
          </>
        )}
      </div>

      {/* AI Prompt Section */}
      <div className="issue-actions">
        <button 
          className="show-prompt-btn"
          onClick={handleShowPrompt}
          disabled={isLoading}
        >
          {showPrompt ? '🤖 Hide AI Prompt' : '🤖 Show AI Prompt'}
        </button>
        {showPrompt && (
          <button 
            className="copy-prompt-btn"
            onClick={copyPromptToClipboard}
            disabled={isLoading || !aiPrompt}
          >
            📋 Copy to Clipboard
          </button>
        )}
      </div>

      {showPrompt && (
        <div className="ai-prompt-section">
          <h4>AI Assistant Prompt:</h4>
          {isLoading ? (
            <p className="loading-text">Generating AI prompt with Gemini...</p>
          ) : (
            <pre className="ai-prompt">{aiPrompt}</pre>
          )}
        </div>
      )}
    </div>
  )
}

export default IssueCard
