# Recent Updates

## Changes Made (November 18, 2025)

### 1. **Centered Search Bar**
- Modified `SearchBar.css` to center the search bar with `margin: 0 auto`
- Increased max-width from 600px to 800px for better visibility
- Changed header layout to flex-column for proper centering

### 2. **Full-Width Application**
- Removed max-width constraints (was 1280px) from:
  - `.header-content` in `App.css`
  - `.main-content` in `App.css`
- App now occupies the full width of the viewport

### 3. **Multi-Select Language Dropdown**
- **Replaced** radio button list with a modern dropdown interface
- **Features:**
  - Click to open/close dropdown
  - Checkbox selection for multiple languages
  - Selected count indicator
  - "Clear all" button
  - Visual chips showing selected languages
  - Remove individual languages via × button on chips

### 4. **Enhanced Language Filtering**
- Changed from single language to **multiple language selection**
- Results now show repositories that contain **ANY** of the selected languages
- Even if a language is used for a small percentage of the project, it will be included
- Uses GitHub's languages API to check actual language usage in each repository
- Updated filtering logic in `ResultsList.jsx`:
  - Fetches all results first (up to 100 repositories)
  - Then filters client-side by checking each repo's language composition
  - Shows results where any selected language is present

### 5. **UI Improvements**
- Increased sidebar width from 250px to 280px for better dropdown display
- Added smooth animations for dropdown arrow rotation
- Enhanced dropdown styling with proper shadows and scrolling
- Language chips display with GitHub's accent color
- Better visual feedback on hover states

## Technical Implementation

### Component Changes:
1. **App.jsx**: Changed `language` (string) to `languages` (array)
2. **FilterSidebar.jsx**: Complete rewrite with dropdown component
3. **ResultsList.jsx**: Two-stage filtering - fetch all, then filter by languages
4. **CSS files**: Updated for centering, full-width, and dropdown styling

### API Usage:
- Search API: Fetches up to 100 repositories
- Languages API: Called for each repo to get language breakdown
- Filters results where any selected language exists (even at 1%)

## How to Use:
1. Enter search query in centered search bar
2. Click "Select languages..." dropdown
3. Check multiple languages (e.g., JavaScript, Python, TypeScript)
4. See all repos that use ANY of those languages
5. Remove languages by clicking × on chips or using "Clear all"
