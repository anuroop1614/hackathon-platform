const express = require('express');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS for production
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
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configured successfully');
} else {
  console.log('⚠️ SendGrid API key not found - emails will be logged only');
}

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }
  if (!['student', 'faculty'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or faculty.' });
  }
  try {
    // Check for duplicate email
    const userSnap = await db.collection('users').where('email', '==', email).get();
    if (!userSnap.empty) {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const userRef = await db.collection('users').add({
      email,
      password_hash,
      role,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Signup successful!', id: userRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userSnap = await db.collection('users').where('email', '==', email).get();
    if (userSnap.empty) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const userDoc = userSnap.docs[0];
    const user = userDoc.data();
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({ message: 'Login successful!', role: user.role, id: userDoc.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create user in Firestore (for Firebase Auth users)
app.post('/users', async (req, res) => {
  const { uid, email, role } = req.body;

  console.log('POST /users - Request body:', req.body);

  if (!uid || !email || !role) {
    return res.status(400).json({ error: 'UID, email, and role are required.' });
  }

  if (!['student', 'faculty'].includes(role)) {
    return res.status(400).json({ error: 'Role must be student or faculty.' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.collection('users').doc(uid).get();
    console.log('User exists:', existingUser.exists);

    if (existingUser.exists) {
      console.log('Existing user data:', existingUser.data());
      return res.json({ message: 'User already exists', user: existingUser.data() });
    }

    // Create user document
    console.log('Creating new user document...');
    await db.collection('users').doc(uid).set({
      email,
      role,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('User created successfully!');
    res.json({ message: 'User created successfully!' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get user by UID
app.get('/users/:uid', async (req, res) => {
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
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Hackathon routes
app.post('/hackathons', async (req, res) => {
  console.log('POST /hackathons - Request body:', req.body);

  const { title, description, date, image_url, faculty_id, max_participants } = req.body;

  if (!title || !description || !date || !faculty_id) {
    console.log('Missing required fields:', { title, description, date, faculty_id });
    return res.status(400).json({ error: 'Title, description, date, and faculty_id are required.' });
  }

  try {
    console.log('Checking faculty with ID:', faculty_id);

    // Verify faculty exists and has correct role
    const facultyDoc = await db.collection('users').doc(faculty_id).get();
    console.log('Faculty doc exists:', facultyDoc.exists);

    if (facultyDoc.exists) {
      console.log('Faculty data:', facultyDoc.data());
    }

    if (!facultyDoc.exists || facultyDoc.data().role !== 'faculty') {
      console.log('Faculty verification failed');
      return res.status(403).json({ error: 'Only faculty members can create hackathons.' });
    }

    console.log('Creating hackathon in Firestore...');
    const hackathonRef = await db.collection('hackathons').add({
      title,
      description,
      date,
      image_url: image_url || null,
      faculty_id,
      max_participants: max_participants || null,
      current_participants: 0,
      status: 'upcoming',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Hackathon created with ID:', hackathonRef.id);
    res.json({ message: 'Hackathon created successfully!', id: hackathonRef.id });
  } catch (err) {
    console.error('Error creating hackathon:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/hackathons', async (req, res) => {
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

    // Sort by created_at on the server side
    hackathons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(hackathons);
  } catch (err) {
    console.error('Error fetching hackathons:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/hackathons/faculty/:facultyId', async (req, res) => {
  const { facultyId } = req.params;

  try {
    const hackathonsSnap = await db.collection('hackathons')
      .where('faculty_id', '==', facultyId)
      .get();

    const hackathons = [];
    hackathonsSnap.forEach(doc => {
      const data = doc.data();
      hackathons.push({
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at
      });
    });

    // Sort by created_at on the server side
    hackathons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(hackathons);
  } catch (err) {
    console.error('Error fetching faculty hackathons:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/hackathons/:id', async (req, res) => {
  const { id } = req.params;
  const { faculty_id } = req.body;

  try {
    // Verify hackathon exists and belongs to faculty
    const hackathonDoc = await db.collection('hackathons').doc(id).get();
    if (!hackathonDoc.exists) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    if (hackathonDoc.data().faculty_id !== faculty_id) {
      return res.status(403).json({ error: 'You can only delete your own hackathons.' });
    }

    // Delete hackathon
    await db.collection('hackathons').doc(id).delete();

    // Delete all registrations for this hackathon
    const registrationsSnap = await db.collection('registrations')
      .where('hackathon_id', '==', id)
      .get();

    const batch = db.batch();
    registrationsSnap.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'Hackathon deleted successfully!' });
  } catch (err) {
    console.error('Error deleting hackathon:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Registration routes
app.post('/registrations', async (req, res) => {
  const { hackathon_id, student_id, name, email, phone } = req.body;

  if (!hackathon_id || !student_id || !name || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    console.log('POST /registrations - Request body:', req.body);

    // Verify student exists and has correct role
    const studentDoc = await db.collection('users').doc(student_id).get();
    console.log('Student doc exists:', studentDoc.exists);

    if (studentDoc.exists) {
      const studentData = studentDoc.data();
      console.log('Student data:', studentData);
      console.log('Student role:', studentData.role);

      if (studentData.role !== 'student') {
        console.log('Role mismatch - Expected: student, Got:', studentData.role);
        return res.status(403).json({ error: 'Only students can register for hackathons.' });
      }
    } else {
      console.log('Student document does not exist for ID:', student_id);
      return res.status(403).json({ error: 'Student not found. Please ensure you are logged in as a student.' });
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

    // Check if hackathon has reached max participants
    const hackathonData = hackathonDoc.data();
    if (hackathonData.max_participants && hackathonData.current_participants >= hackathonData.max_participants) {
      return res.status(400).json({ error: 'Hackathon has reached maximum participants.' });
    }

    // Create registration
    const registrationRef = await db.collection('registrations').add({
      hackathon_id,
      student_id,
      name,
      email,
      phone,
      registered_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update hackathon participant count
    await db.collection('hackathons').doc(hackathon_id).update({
      current_participants: admin.firestore.FieldValue.increment(1)
    });

    res.json({ message: 'Registration successful!', id: registrationRef.id });
  } catch (err) {
    console.error('Error creating registration:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/registrations/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const registrationsSnap = await db.collection('registrations')
      .where('student_id', '==', studentId)
      .get();

    const registrations = [];
    registrationsSnap.forEach(doc => {
      const data = doc.data();
      registrations.push({
        id: doc.id,
        ...data,
        registered_at: data.registered_at?.toDate?.()?.toISOString() || data.registered_at
      });
    });

    // Sort by registered_at on the server side
    registrations.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    res.json(registrations);
  } catch (err) {
    console.error('Error fetching student registrations:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/registrations/hackathon/:hackathonId', async (req, res) => {
  const { hackathonId } = req.params;

  try {
    const registrationsSnap = await db.collection('registrations')
      .where('hackathon_id', '==', hackathonId)
      .get();

    const registrations = [];
    registrationsSnap.forEach(doc => {
      const data = doc.data();
      registrations.push({
        id: doc.id,
        ...data,
        registered_at: data.registered_at?.toDate?.()?.toISOString() || data.registered_at
      });
    });

    // Sort by registered_at on the server side
    registrations.sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));

    res.json(registrations);
  } catch (err) {
    console.error('Error fetching hackathon registrations:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/registrations/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id } = req.body;

  try {
    // Verify registration exists and belongs to student
    const registrationDoc = await db.collection('registrations').doc(id).get();
    if (!registrationDoc.exists) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    const registrationData = registrationDoc.data();
    if (registrationData.student_id !== student_id) {
      return res.status(403).json({ error: 'You can only delete your own registrations.' });
    }

    // Delete registration
    await db.collection('registrations').doc(id).delete();

    // Update hackathon participant count
    await db.collection('hackathons').doc(registrationData.hackathon_id).update({
      current_participants: admin.firestore.FieldValue.increment(-1)
    });

    res.json({ message: 'Registration deleted successfully!' });
  } catch (err) {
    console.error('Error deleting registration:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});





app.delete('/registrations', async (req, res) => {
  const { hackathon_id, student_id } = req.body;

  if (!hackathon_id || !student_id) {
    return res.status(400).json({ error: 'hackathon_id and student_id are required.' });
  }

  try {
    // Find the registration
    const registrationSnap = await db.collection('registrations')
      .where('hackathon_id', '==', hackathon_id)
      .where('student_id', '==', student_id)
      .get();

    if (registrationSnap.empty) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    // Delete registration
    const registrationDoc = registrationSnap.docs[0];
    await registrationDoc.ref.delete();

    // Update hackathon participant count
    await db.collection('hackathons').doc(hackathon_id).update({
      current_participants: admin.firestore.FieldValue.increment(-1)
    });

    res.json({ message: 'Registration deleted successfully!' });
  } catch (err) {
    console.error('Error deleting registration:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Email sending endpoint (SendGrid)
app.post('/api/send-email', async (req, res) => {
  const { to, subject, template, data } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'Email and subject are required.' });
  }

  try {
    // Log email attempt
    console.log('📧 Sending email:', {
      to,
      subject,
      template,
      data,
      timestamp: new Date().toISOString()
    });

    // Check if SendGrid is configured
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
      // Create email content based on template
      let htmlContent = '';
      let textContent = '';

      switch (template) {
        case 'registration-confirmation':
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Registration Confirmed! 🎉</h2>
              <p>Dear Participant,</p>
              <p>You have successfully registered for <strong>${data.hackathonTitle}</strong>!</p>
              <p><strong>Registration Date:</strong> ${data.registrationDate}</p>
              <p>We're excited to have you participate. You'll receive more details about the hackathon soon.</p>
              <p>Best regards,<br>HackHub Team</p>
            </div>
          `;
          textContent = `Registration Confirmed! You have successfully registered for ${data.hackathonTitle} on ${data.registrationDate}.`;
          break;

        case 'hackathon-created':
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Hackathon Created Successfully! 🚀</h2>
              <p>Dear Faculty Member,</p>
              <p>Your hackathon <strong>${data.hackathonTitle}</strong> has been created successfully!</p>
              <p><strong>Created Date:</strong> ${data.createdDate}</p>
              <p>Students can now register for your hackathon. You can manage registrations from your faculty dashboard.</p>
              <p>Best regards,<br>HackHub Team</p>
            </div>
          `;
          textContent = `Hackathon Created! Your hackathon ${data.hackathonTitle} has been created successfully on ${data.createdDate}.`;
          break;

        case 'hackathon-reminder':
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Hackathon Reminder! ⏰</h2>
              <p>Dear Participant,</p>
              <p>This is a reminder that <strong>${data.hackathonTitle}</strong> starts soon!</p>
              <p><strong>Start Date:</strong> ${data.startDate}</p>
              <p>Make sure you're prepared and ready to participate. Good luck!</p>
              <p>Best regards,<br>HackHub Team</p>
            </div>
          `;
          textContent = `Reminder: ${data.hackathonTitle} starts on ${data.startDate}. Get ready!`;
          break;

        default:
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">HackHub Notification</h2>
              <p>You have a new notification from HackHub.</p>
              <p>Best regards,<br>HackHub Team</p>
            </div>
          `;
          textContent = 'You have a new notification from HackHub.';
      }

      // Send email using SendGrid
      const msg = {
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: process.env.SENDGRID_FROM_NAME || 'HackHub Platform'
        },
        subject,
        text: textContent,
        html: htmlContent,
      };

      const result = await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid');
      console.log('📧 SendGrid Response:', result[0].statusCode, result[0].headers);

      res.json({
        message: 'Email sent successfully!',
        emailId: `sendgrid_${Date.now()}`,
        provider: 'SendGrid'
      });
    } else {
      // Fallback: Log email if SendGrid not configured
      console.log('⚠️ SendGrid not configured - Email logged only');
      res.json({
        message: 'Email logged successfully (SendGrid not configured)',
        emailId: `logged_${Date.now()}`,
        provider: 'Console Log'
      });
    }
  } catch (err) {
    console.error('Error sending email:', err);

    // If SendGrid fails, still return success to not break user flow
    res.json({
      message: 'Email processing completed (may have failed)',
      emailId: `failed_${Date.now()}`,
      error: err.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HackHub API Server',
    version: '1.0.0',
    status: 'Running'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured'}`);
});