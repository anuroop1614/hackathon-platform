import React from 'react';
import { CheckCircle, Calendar, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegisterSuccess = ({ hackathonTitle, hackathonDate, studentEmail }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You have successfully registered for the hackathon
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="border-l-4 border-green-400 bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Registration Confirmed
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your registration has been successfully submitted.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Event</p>
                <p className="text-sm text-gray-600">{hackathonTitle}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(hackathonDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Confirmation Email</p>
                <p className="text-sm text-gray-600">
                  Sent to {studentEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check your email for confirmation details</li>
            <li>• You'll receive updates about the hackathon</li>
            <li>• Prepare your ideas and form your team</li>
            <li>• Join us on the event date!</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
