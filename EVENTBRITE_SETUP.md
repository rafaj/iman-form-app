# Eventbrite Setup Guide for IMAN Professional Network

## 🎯 **Quick Setup Steps**

### **1. Create Eventbrite Account**
1. Go to **https://www.eventbrite.com/**
2. Click **"Create events"** → **"Sign up"**  
3. Choose **"Organization"** account type
4. Use your IMAN email address

### **2. Set Up Organization Profile**
- **Organization name**: `IMAN Professional Network`
- **Description**: `Professional networking for Muslim professionals in the Seattle Metro`
- **Logo**: Upload IMAN logo
- **Location**: Seattle/Kirkland, WA

### **3. Get API Credentials**
1. Go to **https://www.eventbrite.com/platform/api-keys/**
2. Click **"Create API Key"**
3. **App name**: `IMAN Website Integration`
4. **Description**: `Display IMAN events on our website`
5. Copy your **Private Token** (this is your API key)
6. Note your **Organization ID** from your organization URL

### **4. Add Team Members (Optional)**
1. In Eventbrite dashboard → **Team** → **Add team member**
2. Add colleagues as **"Administrator"** or **"Event Manager"**
3. They can create/edit events using their own Eventbrite accounts

---

## 🔧 **Environment Variables Setup**

Add these to your `.env.local` file:

```bash
# Eventbrite Integration
EVENTBRITE_API_KEY="your_private_token_from_step_3"
EVENTBRITE_ORGANIZATION_ID="your_organization_id_from_profile"
```

### **How to find your Organization ID:**
1. Go to your Eventbrite organization page
2. Look at the URL: `https://www.eventbrite.com/o/iman-professional-network-123456789`
3. The number at the end (`123456789`) is your Organization ID

---

## 📅 **Creating Your First Event**

### **Event Setup Template:**
- **Title**: `Weekly Networking Mixer`
- **Date**: Next Thursday
- **Time**: `6:00 PM - 8:00 PM PST`
- **Location**: `IMAN Center, 515 State St., Kirkland, WA 98033`
- **Category**: `Business & Professional`
- **Type**: `In Person`
- **Capacity**: 50 people
- **Registration**: Free (or paid if desired)

### **Description Template:**
```
Join the IMAN Professional Network for our weekly networking event!

Connect with fellow Muslim professionals in the Seattle Metro area. This is a great opportunity to:
• Network with professionals from various industries
• Share career opportunities and insights  
• Build meaningful connections in the community
• Enjoy refreshments and professional conversation

Open to all IMAN Professional Network members and their guests.

Questions? Contact us at info@iman-wa.org
```

---

## 🚀 **How It Works**

### **Your Workflow:**
1. **Create events** in Eventbrite dashboard (you or your team)
2. **Your website** automatically pulls these events via API
3. **Events display** with beautiful IMAN branding on your site
4. **"Register" buttons** link directly to Eventbrite event pages
5. **Eventbrite handles** all RSVP management, reminders, check-ins

### **Benefits:**
✅ **Professional event management** - Eventbrite handles RSVPs, reminders, check-ins  
✅ **Team collaboration** - Multiple people can manage events  
✅ **Your beautiful design** - Events show on your website with IMAN branding  
✅ **Automatic sync** - New events appear on your website within 5 minutes  
✅ **Mobile-friendly** - Eventbrite has excellent mobile apps for attendees  
✅ **Analytics** - See registration and attendance data  

---

## 🔍 **Testing the Integration**

### **After setup:**
1. Create a test event in Eventbrite
2. Visit your website at `/events`
3. Your event should appear automatically!
4. The registration button should link to your Eventbrite event

### **Troubleshooting:**
- **Events not showing?** Check your API key and Organization ID in `.env.local`
- **Wrong events showing?** Make sure the Organization ID matches your account
- **API errors?** Check the browser console for error messages

---

## 💡 **Pro Tips**

### **Event Best Practices:**
- **Consistent schedule** - Keep Thursday 6-8 PM for networking events
- **Clear titles** - Use descriptive names like "Weekly Networking Mixer"
- **Professional images** - Use IMAN logos and professional event photos
- **Detailed descriptions** - Include what to expect, who should attend
- **Contact info** - Always include IMAN contact information

### **Managing Multiple Event Types:**
- **Networking**: Weekly mixers, industry meetups
- **Workshop**: Professional development, skill building  
- **Social**: Community gatherings, family events
- **Conference**: Larger professional events

---

## 📞 **Support**

If you need help with the Eventbrite setup:
1. Check the Eventbrite help center: https://www.eventbrite.com/support/
2. Test your API connection using the browser developer tools
3. Verify your organization ID matches your account

**Ready to launch!** 🚀

Once you have events in Eventbrite, they'll automatically appear on your IMAN website with beautiful formatting and direct registration links.
