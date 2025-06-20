// SendGrid Email Service (Free 100 emails/day)

export class EmailService {
  
  // Send registration confirmation email
  static async sendRegistrationEmail(email, hackathonTitle) {
    try {
      const apiUrl = 'https://hackathon-platform-1.onrender.com/api/send-email';

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `Registration Confirmed: ${hackathonTitle}`,
          template: 'registration-confirmation',
          data: {
            hackathonTitle,
            registrationDate: new Date().toLocaleDateString(),
          }
        })
      });
    } catch (error) {
      console.error('Error sending registration email:', error);
      // Don't throw error to prevent registration failure due to email issues
    }
  }

  // Send hackathon reminder email
  static async sendHackathonReminder(email, hackathonTitle, startDate) {
    try {
      const apiUrl = 'https://hackathon-platform-1.onrender.com/api/send-email';

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `Reminder: ${hackathonTitle} starts soon!`,
          template: 'hackathon-reminder',
          data: {
            hackathonTitle,
            startDate,
          }
        })
      });
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  }

  // Send hackathon creation notification to faculty
  static async sendHackathonCreatedEmail(email, hackathonTitle) {
    try {
      const apiUrl = 'https://hackathon-platform-1.onrender.com/api/send-email';

      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: `Hackathon Created: ${hackathonTitle}`,
          template: 'hackathon-created',
          data: {
            hackathonTitle,
            createdDate: new Date().toLocaleDateString(),
          }
        })
      });
    } catch (error) {
      console.error('Error sending hackathon created email:', error);
    }
  }
}

export default EmailService;
