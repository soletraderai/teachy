# YouTube Learning Tool

A React-based interactive learning application that transforms passive YouTube video consumption into active, retention-focused learning sessions.

## Overview

This tool extracts video transcripts, builds enriched knowledge bases from referenced sources, and guides users through bite-sized Q&A sessions designed for kinesthetic learners.

## Features

- **YouTube Video Processing**: Extract transcripts, metadata, and referenced links
- **Knowledge Base Building**: Fetch GitHub READMEs, documentation, and related sources
- **Interactive Q&A Sessions**: Questions before summaries to test understanding
- **Gemini AI Integration**: Dynamic question generation and answer evaluation
- **Difficulty Adjustment**: Easier/Harder modes for personalized learning
- **Session Library**: Persistent storage of all learning sessions with search
- **Dig Deeper Mode**: Conversational follow-up questions on any topic
- **Progress Tracking**: Visual progress through topics and questions
- **Session Notes**: Comprehensive notes with all Q&A exchanges and sources

## Design System

This application uses a **Neobrutalism** design aesthetic:
- Hard black outlines (2-4px solid borders)
- Electric yellow (#FFDE59) and cyan (#00D4FF) accent colors
- Offset box shadows (4-8px solid black)
- Sharp corners (no border-radius)
- Bold, chunky typography

## Tech Stack

- **Framework**: React with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom neobrutalism tokens
- **State Management**: Zustand
- **Routing**: React Router
- **Storage**: localStorage persistence
- **External APIs**:
  - YouTube Data/Transcript API
  - Google Gemini API
  - GitHub API (for knowledge base)

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- A Gemini API key from Google AI Studio

### Installation

1. Clone the repository
2. Run the setup script:

```bash
./init.sh
```

Or manually:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173 in your browser
4. Navigate to Settings and configure your Gemini API key

### Configuration

On first launch, you'll need to configure:
- **User Name**: Your display name
- **Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Language**: Your preferred language

## Project Structure

```
/src
  /components
    /ui              # Neobrutalism design system components
    /session         # Session-related components
    /library         # Library and session notes components
    /settings        # Settings form components
  /hooks             # Custom React hooks
  /services          # API integration services
  /types             # TypeScript type definitions
  /utils             # Utility functions
  /stores            # Zustand stores
  App.tsx
  main.tsx
```

## User Flow

1. **Settings**: Configure API key and preferences
2. **New Session**: Paste YouTube URL to start
3. **Processing**: System extracts transcript and builds knowledge base
4. **Overview**: Review topics and estimated session time
5. **Learning**: Answer questions, receive feedback, view summaries
6. **Completion**: See score and access full session notes
7. **Library**: Browse and search past sessions

## Session Actions

During a learning session, you can:
- **Continue**: Move to the next topic
- **Skip**: Skip the current topic (for familiar content)
- **Bookmark**: Mark topic for later review
- **Dig Deeper**: Open conversational mode for follow-up questions
- **Easier/Harder**: Adjust question difficulty

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## License

MIT
