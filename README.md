# Helplytics AI (MERN)

Community support platform: ask for help, offer help, track contributions, with AI-assisted requests.

Stack: MongoDB, Express 5, React 18 (Vite), Node. Socket.io for live messages and notifications.
Frontend motion: GSAP (landing timeline, scroll reveals, count-up), Framer Motion (page transitions, card stagger, bars), Three.js (3D community network hero).



## Bonus features included (all four)

1. Trust score: +5 per solved request, capped at 100 (utils/trust.js)
2. Leaderboard: points ranking with podium and badges
3. AI suggestions: onboarding picks, request analysis (category, tags, urgency, rewrite, summary), AI Center insights
4. Notifications: live via Socket.io for new matching requests, help offers, solved status

## API

- POST /api/auth/signup, /login; GET /api/auth/me
- PUT /api/users/me; GET /api/users/leaderboard, /api/users/:id
- GET/POST /api/requests; GET /:id; POST /:id/help; POST /:id/solve; DELETE /:id
- POST /api/ai/analyze, /api/ai/onboarding; GET /api/ai/insights
- GET /api/messages/conversations, /api/messages/:userId; POST /api/messages
- GET /api/notifications; PUT /api/notifications/read
- GET /api/admin/stats, /requests; PUT /requests/:id/flag; DELETE /requests/:id
- GET /api/stats (public)

## 3-minute demo script

1. Landing: show the 3D network, scroll to the counters
2. Sign up as a new user, pick "Both", finish onboarding and tap AI skill suggestions
3. Create a request with the words "urgent react bug tomorrow" and watch AI fill category, tags and urgency
4. Log in as ayesha in a second window: a notification arrives live, press "I can help"
5. Back as the author: press "Solved by" on Ayesha, then show the leaderboard and her new trust score
6. Admin panel: flag a request

## Upgrading the AI

utils/ai.js is keyword-based so it works offline. To use a real LLM, replace analyze() and
suggestForOnboarding() with a call to the Anthropic API and keep the same return shape.
