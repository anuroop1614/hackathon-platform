import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks/AuthContext';
import { Calendar, CheckCircle, PlusCircle } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuthContext();
  const [hackathons, setHackathons] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (user) {
      try {
        const hackathonsResponse = await fetch('https://hackathon-platform-1.onrender.com/api/hackathons');
        const allHackathons = await hackathonsResponse.json();

        // For now, we'll just set empty registrations since we need to implement this endpoint
        const userRegistrations = [];
        setHackathons(allHackathons);
        setRegistrations(userRegistrations);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (hackathon) => {
    setSelectedHackathon(hackathon);
    // Pre-fill form with user's Google email and display name if available
    setForm({
      name: user?.displayName || '',
      email: user?.email || '',
      phone: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedHackathon) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://hackathon-platform-1.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackathon_id: selectedHackathon.id,
          student_id: user.uid,
          student_name: form.name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register');
      }

      // Send registration confirmation email
      try {
        console.log('🔄 Attempting to send email to:', form.email, 'for hackathon:', selectedHackathon.title);
        console.log('📧 User info:', {
          isGoogleUser: !!user?.providerData?.find(p => p.providerId === 'google.com'),
          userEmail: user?.email,
          formEmail: form.email,
          displayName: user?.displayName
        });
        await EmailService.sendRegistrationEmail(form.email, selectedHackathon.title);
        console.log('✅ Registration confirmation email sent successfully to:', form.email);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        console.log('⚠️ Email sending failed, but registration was successful');
      }

      setShowModal(false);
      setSelectedHackathon(null);
      setForm({ name: '', email: '', phone: '' });
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error registering:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (hackathonId) => {
    if (!user) return;

    try {
      await apiService.deleteRegistration(hackathonId, user.uid);
      await loadData(); // Reload data
    } catch (err) {
      console.error('Error unregistering:', err);
      setError(err.message || 'Failed to unregister');
    }
  };

  const isRegistered = (hackathonId) => {
    return registrations.some(reg => reg.hackathon_id === hackathonId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600">Discover and join exciting hackathons</p>
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
              {isRegistered(hackathon.id) && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-3">{hackathon.description}</p>
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(hackathon.date).toLocaleDateString()}
            </div>
            
            <div className="flex justify-between items-center">
              {isRegistered(hackathon.id) ? (
                <button
                  onClick={() => handleUnregister(hackathon.id)}
                  className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Unregister
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(hackathon)}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Register
                </button>
              )}
              <span className="text-sm text-gray-500">
                {hackathon.current_participants || 0} participants
              </span>
            </div>
          </div>
        ))}
      </div>

      {hackathons.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hackathons available</h3>
          <p className="text-gray-500">Check back later for new hackathons!</p>
        </div>
      )}

      {/* Registration Modal */}
      {showModal && selectedHackathon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Register for {selectedHackathon.title}</h3>
            
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <div className="relative">
                <input
                  className={`w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                    user?.email ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !!user?.email}
                  readOnly={!!user?.email}
                />
                {user?.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Google Account
                    </span>
                  </div>
                )}
              </div>
              <input
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
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
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
