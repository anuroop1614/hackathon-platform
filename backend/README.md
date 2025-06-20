# HackHub Backend API

Backend API server for the HackHub hackathon management platform.

## Quick Deploy to Render

1. Create new repository: `hackathon-platform-backend`
2. Upload these files:
   - `server.cjs`
   - `package.json`
   - `README.md`

3. Deploy to Render:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.cjs`

## Environment Variables

```env
NODE_ENV=production
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=hackhubhackthon@gmail.com
SENDGRID_FROM_NAME=HACKHUB Platform
PORT=10000
```

## API Endpoints

- `GET /health` - Health check
- `POST /users` - Create user
- `GET /hackathons` - List hackathons
- `POST /hackathons` - Create hackathon
- `POST /registrations` - Register for hackathon
- `POST /api/send-email` - Send email

## Tech Stack

- Express.js
- Firebase Admin SDK
- SendGrid
- bcrypt
- CORS
