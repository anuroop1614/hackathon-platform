# 🎯 HackHub - Hackathon Management Platform v2.0

A modern, full-stack hackathon management platform built with React, Node.js, Firebase, and SendGrid. This platform enables faculty to create hackathons and students to register for them, with automated email notifications and role-based authentication.

## ✨ Features

### 🔐 Authentication
- **Google OAuth Integration** - One-click sign-in with Google
- **Email/Password Authentication** - Traditional signup/login
- **Role-based Access Control** - Student and Faculty roles
- **Firebase Authentication** - Secure and scalable

### 👨‍🎓 Student Features
- **Browse Hackathons** - View all available hackathons
- **Easy Registration** - Register for hackathons with simple forms
- **Email Confirmations** - Receive professional confirmation emails
- **Registration Management** - View and manage registrations

### 👨‍🏫 Faculty Features
- **Create Hackathons** - Easy hackathon creation interface
- **Manage Events** - View and delete created hackathons
- **Participant Tracking** - See registration counts
- **Email Notifications** - Get notified when hackathons are created

### 📧 Email System
- **SendGrid Integration** - Professional email delivery
- **HTML Templates** - Beautiful, responsive email designs
- **Automatic Notifications** - Registration and creation confirmations
- **100 Free Emails/Day** - Perfect for testing and small events

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **JavaScript** - No TypeScript complexity
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development and building
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Express.js** - Web application framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **SendGrid** - Email delivery service
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database & Services
- **Firebase Firestore** - NoSQL document database
- **Firebase Authentication** - User management
- **Firebase Hosting** - Static site hosting
- **SendGrid** - Transactional emails

## 🚀 Live Demo

- **Frontend**: https://hackon-cloud-project.web.app
- **Backend**: Deploy to Render (see deployment guide)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- SendGrid account (free tier available)

### Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/hackathon-platform.git
cd hackathon-platform
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
1. Create `.env` file in root directory
2. Add your configuration:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@domain.com
SENDGRID_FROM_NAME=Your Platform Name
```

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Google + Email/Password)
3. Create Firestore database
4. Download service account key as `serviceAccountKey.json`
5. Update `src/firebase.js` with your config

### Run Development Servers
```bash
# Frontend (port 5173)
npm run dev

# Backend (port 3001) - in separate terminal
node server.cjs
```

## 🌐 Deployment

### Frontend (Firebase Hosting)
```bash
npm run build
firebase deploy --only hosting
```

### Backend (Render)
1. Follow `RENDER_DEPLOYMENT.md` guide
2. Set environment variables in Render dashboard
3. Deploy from GitHub repository

## 📁 Project Structure

```
hackathon-platform/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.jsx
│   │   ├── faculty/
│   │   │   └── FacultyDashboard.jsx
│   │   ├── student/
│   │   │   └── StudentDashboard.jsx
│   │   └── Layout.jsx
│   ├── hooks/
│   │   ├── AuthContext.jsx
│   │   └── useAuth.js
│   ├── lib/
│   │   ├── api.js
│   │   └── emailService.js
│   ├── App.jsx
│   ├── firebase.js
│   └── main.jsx
├── server.cjs
├── firebase.json
└── package.json
```

## 🔧 Configuration

### Firebase Configuration
Update `src/firebase.js` with your Firebase project settings:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### SendGrid Configuration
1. Sign up at https://sendgrid.com
2. Verify sender email
3. Create API key with Mail Send permissions
4. Add to environment variables

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  role: "student" | "faculty",
  created_at: timestamp
}
```

### Hackathons Collection
```javascript
{
  title: "Hackathon Name",
  description: "Event description",
  date: "2024-01-20",
  faculty_id: "creator-uid",
  current_participants: 0,
  max_participants: 100,
  created_at: timestamp
}
```

### Registrations Collection
```javascript
{
  hackathon_id: "hackathon-doc-id",
  student_id: "student-uid",
  name: "Student Name",
  email: "student@example.com",
  phone: "123-456-7890",
  registered_at: timestamp
}
```

## 🎯 API Endpoints

### Authentication
- `POST /users` - Create user record
- `GET /users/:uid` - Get user by ID

### Hackathons
- `GET /hackathons` - List all hackathons
- `POST /hackathons` - Create hackathon (faculty only)
- `GET /hackathons/faculty/:id` - Get faculty's hackathons
- `DELETE /hackathons/:id` - Delete hackathon

### Registrations
- `POST /registrations` - Register for hackathon
- `GET /registrations/student/:id` - Get student's registrations
- `DELETE /registrations/:hackathonId/:studentId` - Unregister

### Email
- `POST /api/send-email` - Send email via SendGrid

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **Role-based Access** - Students and faculty permissions
- **CORS Configuration** - Proper cross-origin setup
- **Environment Variables** - Secure credential storage
- **Input Validation** - Server-side validation
- **Error Handling** - Comprehensive error management

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Modern Interface** - Clean, professional design
- **Loading States** - User feedback during operations
- **Error Messages** - Clear error communication
- **Success Notifications** - Confirmation feedback
- **Google Branding** - Proper OAuth button styling

## 📈 Free Tier Limits

- **Firebase Auth**: 50,000 MAU
- **Firestore**: 50,000 reads/day
- **Firebase Hosting**: 10GB storage
- **SendGrid**: 100 emails/day
- **Render**: 750 hours/month

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for authentication and database
- SendGrid for email delivery
- Tailwind CSS for styling
- Lucide React for icons
- Render for backend hosting

## 📞 Support

For support, email hackhubhackthon@gmail.com or create an issue on GitHub.

---

**Built with ❤️ for the hackathon community**
