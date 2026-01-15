- Onboarding does not complete, when the button 'start learning' is clicked it does nothing.
- Home can be removed for logged in users, Home will be used for the landing page. Default page for logged in users will be dashboard.
- Your Feed has the following error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
- When a user is logged in and they wish to upgrade their plan, can we have the pricing page only show the Pro option and have this is a full window overlay. The overlay is to only have 20% opacity so you can only just see the background.
- Dashboard cards are to be responsive for larger screensizes. Currently any screen size that is larger the dashboard cards do not expand and reach a certain width.

**Pro Tier not regestering for users**
Problem: The PRO tier upgrade exists in the database but isn't showing in the UI.

  Root Cause: Two servers conflict on port 3001:
  1. Transcript Proxy (server.js) - Currently running on 3001
  2. Main API Server (api/src/index.ts) - NOT running

  The frontend calls /api/auth/me to fetch user data including the subscription tier. Since the main API server isn't running, this call fails silently and the frontend falls back to tier: 'FREE' (see authStore.ts line 51).

  Suggested Solution:
  1. Stop the transcript proxy: kill 2730
  2. Start the main API server from the api/ directory:
  cd generations/teachy/api && npm run dev
  2. Or configure one of the servers to use a different port.
  3. Alternatively, update the transcript proxy (server.js) port to something like 3002 and update VITE_API_URL accordingly, then start the main API on 3001.

- Provide more accurate and in-depth feedback to the user about their questions.
- Need better feedback from the system