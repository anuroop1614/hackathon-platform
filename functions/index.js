const functions = require('firebase-functions');
const express = require('express');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Configure SendGrid
const sendgridApiKey = functions.config().sendgrid?.api_key;
const sendgridFromEmail = functions.config().sendgrid?.from_email;
const sendgridFromName = functions.config().sendgrid?.from_name;

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
  console.log('✅ SendGrid configured successfully');
} else {
  console.log('⚠️ SendGrid API key not found - emails will be logged only');
}

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

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
