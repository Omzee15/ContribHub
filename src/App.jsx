import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RepoDetailsPage from './pages/RepoDetailsPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/repo/:owner/:repo" element={<RepoDetailsPage />} />
      </Routes>
    </Router>
  )
}

export default App
