import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../lib/api';
import EmailService from '../../lib/emailService';
import { Calendar, Users, PlusCircle } from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHackathons = async () => {
    if (user) {
      try {
        const facultyHackathons = await apiService.getHackathonsByFaculty(user.uid);
        setHackathons(facultyHackathons);
      } catch (err) {
        console.error('Error loading hackathons:', err);
        setError('Failed to load hackathons');
      }
    }
  };

  useEffect(() => {
    loadHackathons();
  }, [user]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const hackathonData = {
        title: form.title,
        description: form.description,
        date: form.date,
        faculty_id: user.uid,
      };

      const result = await apiService.createHackathon(hackathonData);
      console.log('Hackathon created successfully:', result);
      
      // Send hackathon creation confirmation email
      try {
        console.log('🔄 Sending hackathon creation email to faculty:', user.email);
        console.log('📧 Faculty info:', {
          isGoogleUser: !!user?.providerData?.find(p => p.providerId === 'google.com'),
          userEmail: user?.email,
          displayName: user?.displayName
        });
        await EmailService.sendHackathonCreatedEmail(user.email || '', form.title);
        console.log('✅ Hackathon creation confirmation email sent to:', user.email);
      } catch (emailError) {
        console.log('⚠️ Email sending failed, but hackathon was created successfully');
      }
      
      setForm({ title: '', description: '', date: '' });
      setShowModal(false);
      await loadHackathons(); // Reload hackathons
    } catch (err) {
      console.error('Error creating hackathon:', err);
      
      // If user doesn't exist, try to create them
      if (err.message?.includes('User not found') || err.message?.includes('Only faculty')) {
        try {
          await apiService.createUser({
            uid: user.uid,
            email: user.email,
            role: 'faculty'
          });
          
          // Retry hackathon creation
          const result = await apiService.createHackathon(hackathonData);
          console.log('Hackathon created successfully after user creation:', result);
          
          setForm({ title: '', description: '', date: '' });
          setShowModal(false);
          await loadHackathons();
          return; // Success on retry
        } catch (userErr) {
          console.error('Error creating user:', userErr);
          setError('Failed to create user record. Please try signing out and back in.');
          return;
        }
      }
      
      setError(err.message || 'Failed to create hackathon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHackathon = async (hackathonId) => {
    if (!user) return;

    try {
      await apiService.deleteHackathon(hackathonId, user.uid);
      await loadHackathons(); // Reload hackathons
    } catch (err) {
      console.error('Error deleting hackathon:', err);
      setError(err.message || 'Failed to delete hackathon');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Dashboard</h1>
          <p className="text-gray-600">Manage your hackathons</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Hackathon</span>
        </button>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((hackathon) => (
          <div key={hackathon.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{hackathon.title}</h3>
              <button
                onClick={() => handleDeleteHackathon(hackathon.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{hackathon.description}</p>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(hackathon.date).toLocaleDateString()}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              {hackathon.current_participants || 0} participants
            </div>
          </div>
        ))}
      </div>

      {hackathons.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hackathons created yet</h3>
          <p className="text-gray-500">Create your first hackathon to get started!</p>
        </div>
      )}

      {/* Create Hackathon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Hackathon</h3>
            
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                name="title"
                placeholder="Hackathon Title"
                value={form.title}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                name="date"
                type="date"
                value={form.date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
