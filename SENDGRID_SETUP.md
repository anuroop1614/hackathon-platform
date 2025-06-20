# 📧 SendGrid Setup Instructions

## 🚀 Quick Setup Guide

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email address

### Step 2: Get API Key
1. Login to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Choose **"Restricted Access"**
5. Give it a name like "HackHub Platform"
6. Set permissions:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access (optional)
7. Click **"Create & View"**
8. **COPY THE API KEY** (you won't see it again!)

### Step 3: Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in your details:
   - **From Name**: HackHub Platform
   - **From Email**: your-email@domain.com (use your real email)
   - **Reply To**: same as from email
   - **Company**: Your Organization
   - **Address**: Your address
4. Click **"Create"**
5. Check your email and click the verification link

### Step 4: Update Environment Variables
Edit your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
SENDGRID_FROM_NAME=HackHub Platform
```

### Step 5: Restart Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
node server.cjs
```

## 📊 Free Tier Limits

### SendGrid Free Plan:
- ✅ **100 emails/day** forever
- ✅ **Email templates**
- ✅ **Analytics**
- ✅ **API access**
- ✅ **SMTP relay**

### Perfect for:
- Small hackathon platforms
- Testing and development
- Up to 3,000 emails/month
- Educational projects

## 🧪 Testing Email Functionality

### Test 1: Student Registration
1. Register as a student for any hackathon
2. Check server logs for: `✅ Email sent successfully via SendGrid`
3. Check your email inbox for confirmation

### Test 2: Faculty Hackathon Creation
1. Login as faculty
2. Create a new hackathon
3. Check server logs for email confirmation
4. Check your email inbox

### Test 3: Check SendGrid Dashboard
1. Go to SendGrid dashboard
2. Click **"Activity"** → **"Email Activity"**
3. See your sent emails with delivery status

## 🔧 Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: Check your API key is correct in `.env`

### Issue: "Sender not verified" Error
**Solution**: Complete sender verification in SendGrid dashboard

### Issue: Emails not received
**Solutions**:
1. Check spam folder
2. Verify sender email in SendGrid
3. Check SendGrid activity logs
4. Try different recipient email

### Issue: "API key not found"
**Solution**: Make sure `.env` file is in project root and server is restarted

## 📈 Upgrading to Paid Plan

### When to upgrade:
- More than 100 emails/day needed
- Need dedicated IP
- Advanced analytics required
- Higher delivery rates needed

### Paid plans start at:
- **Essentials**: $14.95/month (50K emails)
- **Pro**: $89.95/month (1.5M emails)

## 🎯 Current Email Templates

### 1. Registration Confirmation
- **Trigger**: Student registers for hackathon
- **Subject**: "Registration Confirmed: [Hackathon Name]"
- **Content**: Welcome message with hackathon details

### 2. Hackathon Created
- **Trigger**: Faculty creates new hackathon
- **Subject**: "Hackathon Created: [Hackathon Name]"
- **Content**: Confirmation with creation details

### 3. Hackathon Reminder
- **Trigger**: Manual/scheduled (future feature)
- **Subject**: "Reminder: [Hackathon Name] starts soon!"
- **Content**: Reminder with start date

## 🔮 Future Email Features

### Planned Enhancements:
- **Automated reminders** (24h before hackathon)
- **Winner announcements**
- **Team formation notifications**
- **Submission confirmations**
- **Event updates and announcements**

## 📞 Support

### SendGrid Support:
- Documentation: [docs.sendgrid.com](https://docs.sendgrid.com)
- Support: Available in dashboard
- Community: SendGrid community forums

### Platform Support:
- Check server logs for detailed error messages
- Verify all environment variables are set
- Test with simple email first

---

**🎉 Once configured, your hackathon platform will send professional emails automatically!**
