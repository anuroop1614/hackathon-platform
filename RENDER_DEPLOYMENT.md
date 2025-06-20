# 🚀 Complete Render Deployment Guide

## Overview
Deploy your HackHub backend to Render for free hosting with 750 hours/month.

## Prerequisites
- ✅ GitHub repository: https://github.com/anuroop1614/hackathon-platform
- ✅ Render account (free)
- ✅ SendGrid API key
- ✅ Firebase service account key

## Step 1: Sign Up for Render

1. Go to [Render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

## Step 2: Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your GitHub account
5. Find and select **"hackathon-platform"** repository
6. Click **"Connect"**

## Step 3: Configure Service Settings

### Basic Settings:
- **Name**: `hackathon-platform-api`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty (uses repository root)
- **Build Command**: `npm install --production`
- **Start Command**: `node server.cjs`

### Advanced Settings:
- **Instance Type**: `Free` (0.1 CPU, 512 MB RAM)
- **Auto-Deploy**: `Yes` (deploys on git push)

## Step 4: Environment Variables

Click **"Advanced"** → **"Environment Variables" and add:

```env
NODE_ENV=production
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=hackhubhackthon@gmail.com
SENDGRID_FROM_NAME=HACKHUB Platform
PORT=10000
```

### Important Notes:
- ✅ SendGrid API key is configured for your account
- ✅ Sender email `hackhubhackthon@gmail.com` is verified in SendGrid
- ✅ PORT=10000 is required by Render (don't change this)
- ⚠️ Keep these values secure - don't share publicly

## Step 5: Firebase Service Account

### Option A: Environment Variable (Recommended)
1. Copy your `serviceAccountKey.json` content
2. Minify it (remove spaces/newlines): Use online JSON minifier
3. Add as environment variable:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: `{"type":"service_account","project_id":"your-project",...}`

### Option B: Upload File (Alternative)
1. In your repository, create `config/` directory
2. Upload `serviceAccountKey.json` to `config/`
3. Update `server.cjs` to use: `admin.initializeApp({ credential: admin.credential.cert('./config/serviceAccountKey.json') })`

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building your application
3. Wait for deployment (usually 2-5 minutes)
4. You'll get a URL like: `https://hackathon-platform-api.onrender.com`

## Step 7: Verify Deployment

### Test Endpoints:
```bash
# Health check
curl https://hackathon-platform-api.onrender.com/health

# API root
curl https://hackathon-platform-api.onrender.com/

# Expected responses:
# Health: {"status":"OK","timestamp":"...","environment":"production"}
# Root: {"message":"HackHub API Server","version":"1.0.0","status":"Running"}
```

## Step 8: Update Frontend API URLs

### Update src/lib/api.js:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hackathon-platform-api.onrender.com' 
  : 'http://localhost:3001'
```

### Update src/lib/emailService.js:
```javascript
const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://hackathon-platform-api.onrender.com/api/send-email'
  : '/api/send-email';
```

## Step 9: Redeploy Frontend

```bash
# Build with new API URLs
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Step 10: Test Full Application

1. **Frontend**: https://hackon-cloud-project.web.app
2. **Backend**: https://hackathon-platform-api.onrender.com
3. **Test Flow**:
   - Sign in with Google
   - Register for hackathon (as student)
   - Create hackathon (as faculty)
   - Check email notifications

## 🔧 Troubleshooting

### Common Issues:

#### Build Fails
- **Check**: Node.js version compatibility
- **Solution**: Add `"engines": {"node": "18.x"}` to package.json

#### Environment Variables Not Working
- **Check**: Variable names are exact (case-sensitive)
- **Solution**: Restart service after adding variables

#### Firebase Connection Fails
- **Check**: Service account key format
- **Solution**: Ensure JSON is properly formatted and minified

#### CORS Errors
- **Check**: Frontend URL in CORS configuration
- **Solution**: Update CORS origins in server.cjs

#### SendGrid Emails Not Sending
- **Check**: API key and sender verification
- **Solution**: Verify sender email in SendGrid dashboard

### Logs and Debugging:
1. Go to Render dashboard
2. Click your service
3. Go to **"Logs"** tab
4. Check for error messages

## 📊 Free Tier Limits

### Render Free Plan:
- ✅ **750 hours/month** (enough for 24/7 operation)
- ✅ **512 MB RAM**
- ✅ **0.1 CPU**
- ✅ **Automatic SSL**
- ✅ **Custom domains**
- ⚠️ **Sleeps after 15 minutes of inactivity**
- ⚠️ **Cold start delay** (10-30 seconds)

### Keep Service Awake (Optional):
Use a service like UptimeRobot to ping your API every 5 minutes:
```
https://hackathon-platform-api.onrender.com/health
```

## 🎯 Production Checklist

- ✅ Environment variables set correctly
- ✅ Firebase service account configured
- ✅ SendGrid API key working
- ✅ CORS configured for your frontend domain
- ✅ Health endpoint responding
- ✅ Frontend API URLs updated
- ✅ Email notifications working
- ✅ Authentication flow tested

## 🚀 Your URLs

After successful deployment:

### Production URLs:
- **Frontend**: https://hackon-cloud-project.web.app
- **Backend**: https://hackathon-platform-api.onrender.com
- **API Health**: https://hackathon-platform-api.onrender.com/health
- **GitHub**: https://github.com/anuroop1614/hackathon-platform

### API Endpoints:
- `GET /health` - Health check
- `POST /users` - Create user
- `GET /hackathons` - List hackathons
- `POST /hackathons` - Create hackathon
- `POST /registrations` - Register for hackathon
- `POST /api/send-email` - Send email

## 🎉 Congratulations!

Your HackHub platform is now fully deployed and accessible worldwide! 

### Features Now Live:
- ✅ **Google Authentication**
- ✅ **Student Registration System**
- ✅ **Faculty Hackathon Management**
- ✅ **Professional Email Notifications**
- ✅ **Real-time Database Updates**
- ✅ **Responsive Web Design**

**Share your platform**: https://hackon-cloud-project.web.app 🚀
