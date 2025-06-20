const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://hackon-cloud-project.web.app', 'https://hackon-cloud-project.firebaseapp.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Firebase Admin SDK
let db;
try {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use environment variables
    console.log('🔥 Initializing Firebase in production mode...');
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'hackon-cloud-project'
    });
  } else {
    // Development: Use service account key file
    console.log('🔥 Initializing Firebase in development mode...');
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configured successfully');
} else {
  console.log('⚠️ SendGrid API key not found - emails will be logged only');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    services: {
      firebase: 'Connected',
      sendgrid: process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured',
      database: 'Firestore Active'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HackHub API Server v2.0',
    version: '2.0.0',
    status: 'Running',
    features: [
      'Firebase Authentication',
      'Role-based Access Control',
      'Hackathon Management',
      'Student Registration System',
      'Email Notifications'
    ],
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      hackathons: '/api/hackathons',
      register: '/api/register',
      stats: '/api/stats'
    }
  });
});

// User creation endpoint (for Firebase Auth users)
app.post('/api/users', async (req, res) => {
  const { uid, email, role } = req.body;

  if (!uid || !email || !role) {
    return res.status(400).json({ error: 'UID, email, and role are required.' });
  }

  if (!['student', 'faculty'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or faculty.' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.collection('users').doc(uid).get();
    
    if (existingUser.exists) {
      return res.json({ message: 'User already exists', user: existingUser.data() });
    }

    // Create user document
    await db.collection('users').doc(uid).set({
      email,
      role,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data();
    res.json({
      uid: uid,
      ...userData,
      created_at: userData.created_at?.toDate?.()?.toISOString() || userData.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create hackathon endpoint (Faculty only)
app.post('/api/createHackathon', async (req, res) => {
  const { title, description, date, faculty_id } = req.body;

  if (!title || !description || !date || !faculty_id) {
    return res.status(400).json({ error: 'Title, description, date, and faculty_id are required.' });
  }

  try {
    // Verify faculty exists and has correct role
    const facultyDoc = await db.collection('users').doc(faculty_id).get();

    if (!facultyDoc.exists || facultyDoc.data().role !== 'faculty') {
      return res.status(403).json({ error: 'Only faculty members can create hackathons.' });
    }

    // Create hackathon
    const hackathonRef = await db.collection('hackathons').add({
      title,
      description,
      date,
      faculty_id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      registrations: 0
    });

    res.json({
      message: 'Hackathon created successfully!',
      hackathon_id: hackathonRef.id
    });
  } catch (error) {
    console.error('Error creating hackathon:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get all hackathons
app.get('/api/hackathons', async (req, res) => {
  try {
    const hackathonsSnap = await db.collection('hackathons').get();
    const hackathons = [];

    hackathonsSnap.forEach(doc => {
      const data = doc.data();
      hackathons.push({
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at
      });
    });

    // Sort by created_at
    hackathons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(hackathons);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Student registration endpoint
app.post('/api/register', async (req, res) => {
  const { hackathon_id, student_id, student_name } = req.body;

  if (!hackathon_id || !student_id || !student_name) {
    return res.status(400).json({ error: 'Hackathon ID, student ID, and student name are required.' });
  }

  try {
    // Verify student exists and has correct role
    const studentDoc = await db.collection('users').doc(student_id).get();

    if (!studentDoc.exists || studentDoc.data().role !== 'student') {
      return res.status(403).json({ error: 'Only students can register for hackathons.' });
    }

    // Verify hackathon exists
    const hackathonDoc = await db.collection('hackathons').doc(hackathon_id).get();
    if (!hackathonDoc.exists) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    // Check if student is already registered
    const existingRegistration = await db.collection('registrations')
      .where('hackathon_id', '==', hackathon_id)
      .where('student_id', '==', student_id)
      .get();

    if (!existingRegistration.empty) {
      return res.status(409).json({ error: 'Student is already registered for this hackathon.' });
    }

    // Create registration
    const registrationRef = await db.collection('registrations').add({
      hackathon_id,
      student_id,
      student_name,
      student_email: studentDoc.data().email,
      registered_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update hackathon registration count
    await db.collection('hackathons').doc(hackathon_id).update({
      registrations: admin.firestore.FieldValue.increment(1)
    });

    // Send confirmation email
    const hackathonData = hackathonDoc.data();
    await sendRegistrationEmail(
      studentDoc.data().email,
      student_name,
      hackathonData.title,
      hackathonData.date
    );

    res.json({
      message: 'Registration successful!',
      registration_id: registrationRef.id
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Email sending function
async function sendRegistrationEmail(email, studentName, hackathonTitle, hackathonDate) {
  const emailContent = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@hackhub.com',
      name: process.env.SENDGRID_FROM_NAME || 'HackHub Platform'
    },
    subject: `Registration Confirmed: ${hackathonTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Registration Confirmed! 🎉</h2>
        <p>Dear ${studentName},</p>
        <p>You have successfully registered for <strong>${hackathonTitle}</strong>!</p>
        <p><strong>Event Date:</strong> ${hackathonDate}</p>
        <p>We're excited to have you participate. You'll receive more details about the hackathon soon.</p>
        <p>Best regards,<br>HackHub Team</p>
      </div>
    `
  };

  try {
    if (process.env.SENDGRID_API_KEY) {
      await sgMail.send(emailContent);
      console.log(`✅ Registration email sent to ${email}`);
    } else {
      console.log(`📧 Email would be sent to ${email}:`, emailContent.subject);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

// Platform statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [usersSnap, hackathonsSnap, registrationsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('hackathons').get(),
      db.collection('registrations').get()
    ]);

    const stats = {
      totalUsers: usersSnap.size,
      totalHackathons: hackathonsSnap.size,
      totalRegistrations: registrationsSnap.size,
      usersByRole: {
        students: 0,
        faculty: 0
      },
      lastUpdated: new Date().toISOString()
    };

    // Count users by role
    usersSnap.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'student') {
        stats.usersByRole.students++;
      } else if (userData.role === 'faculty') {
        stats.usersByRole.faculty++;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured'}`);
});
