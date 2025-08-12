# Luma Integration Approach

## Option 1: Embed Luma Events
```tsx
// In your events page, embed Luma calendar
<iframe 
  src="https://lu.ma/embed/calendar/cal-abc123/events" 
  width="100%" 
  height="600"
  frameBorder="0"
/>
```

## Option 2: Luma API Integration
```tsx
// Fetch events from Luma API and display in your design
const events = await fetch('https://api.lu.ma/calendar/cal-abc123/events')
// Display in your custom cards but link to Luma for RSVP
```

## Option 3: Hybrid System
- **Your website**: Beautiful event listings, branding
- **Luma**: Handle RSVPs, reminders, check-ins
- **Link**: "Register on Luma" buttons

## Benefits:
✅ Keep your beautiful design
✅ Professional RSVP management
✅ Quick to implement
✅ Easy to migrate later if needed
