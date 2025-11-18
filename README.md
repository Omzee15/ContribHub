# ContribHub

> 🚀 Find open source projects to contribute to, sorted by issues and tech stack

**[Live Demo](http://gitcontributor.netlify.app)** | **[Report Bug](https://github.com/Omzee15/ContribHub/issues)**

## 🎯 Problem Statement

Finding the right open source project to contribute to can be overwhelming. Developers often struggle to:
- **Discover repositories** with active issues that match their skills
- **Filter projects** by programming languages they're comfortable with
- **Identify beginner-friendly issues** through labels like "good first issue" or "help wanted"
- **See at a glance** which projects need the most help

**ContribHub solves this** by providing a streamlined interface to search, filter, and sort GitHub repositories based on open issues, tech stack, and issue labels—making it easy to find projects that need your contributions.

## ✨ Features

- � Search GitHub repositories and organizations
- � Sort by most issues or most stars
- 🎯 Filter by programming languages and issue labels
- � View tech stack, stars, forks, and open issues
- 🎨 Clean GitHub-inspired dark theme
- 📱 Fully responsive design

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Omzee15/ContribHub.git
cd ContribHub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Tech Stack

- React 18 + Vite
- GitHub REST API
- Axios

## 📝 API Rate Limits

Without authentication: **60 requests/hour**  
With GitHub token: **5,000 requests/hour**

To add a token, create a `.env` file:
```env
VITE_GITHUB_TOKEN=your_github_token_here
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 📄 License

MIT License

