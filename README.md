# Placebo Casino Web Platform

A full-stack casino gaming platform with user authentication, multiple games, and a reward system.

## Quick Start

Run both frontend and backend together:

```bash
npm install
npm run start
```

This will start:
- React frontend on http://localhost:3000
- Flask backend on http://localhost:5000
- Vite proxy automatically routes `/api/*` to Flask

## System Architecture

**Frontend:** React + TypeScript + Vite with responsive UI
**Backend:** Flask Python REST API with JWT authentication
**Database:** Supabase with user profiles and game history
**Communication:** HTTP REST API with Bearer token authentication

## Features

- User registration and login with JWT tokens
- Blackjack game implementation
- Real-time points system
- Game history tracking
- Leaderboard with player statistics
- Reward code generation and redemption
- Session statistics (wins, losses, win rate)
- Responsible gambling information
- FAQ section

## Project Structure

```
frontend/
  src/
    components/          # React components
    services/           # API client (casinoAPI.ts)
    styles/             # CSS styling

backend/
  app_supabase.py       # Flask application
  requirements_supabase.txt  # Python dependencies
```

## Frontend-Backend Connection

The frontend and backend are fully connected:

- Frontend uses `casinoAPI.ts` service to communicate with backend
- All API calls route to `http://localhost:5000/api` via Vite proxy
- JWT tokens are stored and sent with authenticated requests
- Real-time data synchronization for points and game history

## For More Information

See [RUN_PROJECT.md](./RUN_PROJECT.md) for detailed setup instructions.

