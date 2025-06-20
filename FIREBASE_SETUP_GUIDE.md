# Firebase Setup Guide

## ✅ Configuration Updated

Your Firebase configuration has been updated with the correct project credentials:

- **Project ID**: `hackon-cloud-project`
- **API Key**: Updated with your valid key
- **Service Account**: Already configured correctly

## 🔧 Firebase Console Setup Required

To complete the setup, you need to configure your Firebase project:

### 1. Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hackon-cloud-project`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the following providers:
   - ✅ **Email/Password** (for basic auth)
   - ✅ **Google** (for Google sign-in)

### 2. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)

### 3. Configure Firestore Security Rules (Optional for Development)

For development, you can use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Important**: Change these rules for production!

### 4. Test the Application

1. **Backend Server**: http://localhost:3001 ✅ Running
2. **Frontend App**: http://localhost:5173 ✅ Running

### 5. Testing Steps

1. **Sign Up**: Create a new account (student or faculty)
2. **Sign In**: Log in with your credentials
3. **Faculty Test**:
   - Create a hackathon
   - View your hackathons
   - Check participant counts
4. **Student Test**:
   - Browse available hackathons
   - Register for a hackathon
   - View your registrations

## 🐛 Troubleshooting

### If you still get Firebase errors:

1. **Check Firebase Console**: Ensure Authentication and Firestore are enabled
2. **Verify Project ID**: Make sure the project ID matches in both frontend and backend
3. **Service Account**: Ensure the service account has proper permissions

### Common Issues:

- **"auth/api-key-not-valid"**: ✅ Fixed with your new configuration
- **"permission-denied"**: Check Firestore security rules
- **"project-not-found"**: Verify project ID matches

## 📊 Database Collections

Your app will create these collections automatically:

- **users**: User authentication data
- **hackathons**: Faculty-created hackathons
- **registrations**: Student registrations

## 🚀 Ready to Test!

Your application should now work with the proper Firebase configuration. The database integration is complete and ready for testing!
