# ContribHub

A beautiful GitHub-like web application for searching and exploring repositories and organizations with detailed information about tech stacks, issues, and labels.

## Features

- 🔍 **Search Repositories & Organizations** - Search GitHub's vast repository database
- 🎨 **GitHub-like UI** - Authentic GitHub dark theme and user interface
- 🛠️ **Tech Stack Display** - View the programming languages and their usage percentages
- 📊 **Issue Tracking** - See the number of open issues for each repository
- 🏷️ **Label Display** - View popular issue labels used in repositories
- 🎯 **Advanced Filtering** - Filter by repository type, organization, or programming language
- ⭐ **Repository Stats** - Stars, forks, and issue counts at a glance
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client for GitHub API requests
- **GitHub REST API** - Real-time repository and organization data

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd git_issue_solver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`

## Usage

1. **Search**: Enter keywords in the search bar to find repositories or organizations
2. **Filter Type**: Use the sidebar to switch between Repositories and Organizations
3. **Filter Language**: Select a programming language to narrow down results
4. **View Details**: Each result shows:
   - Repository name and description
   - Tech stack with language percentages
   - Star count, fork count, and issue count
   - Popular issue labels
   - Primary programming language

## API Rate Limits

This app uses the GitHub REST API without authentication, which has a rate limit of 60 requests per hour. For higher limits:

1. Create a GitHub Personal Access Token
2. Add it to your requests (see GitHub API documentation)
3. This will increase your limit to 5,000 requests per hour

## Project Structure

```
git_issue_solver/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx          # Search input component
│   │   ├── SearchBar.css
│   │   ├── FilterSidebar.jsx      # Filter controls
│   │   ├── FilterSidebar.css
│   │   ├── ResultsList.jsx        # Results container
│   │   ├── ResultsList.css
│   │   ├── RepositoryCard.jsx     # Individual result card
│   │   └── RepositoryCard.css
│   ├── App.jsx                     # Main app component
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for learning and development.
