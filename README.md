# StudySync Tasks - Real-Time Collaborative Task Management

A full-stack web application for university students to create shared, course-based task lists with real-time synchronization using Firebase.

## Features

✨ **Core Features:**
- User authentication with email verification
- Course-based task organization
- Real-time task synchronization across all users
- Task management with priorities, due dates, and assignments
- Filtering and sorting capabilities
- Responsive design for mobile and desktop

🎯 **Task Management:**
- Create, edit, and delete tasks
- Mark tasks as complete/pending
- Assign tasks to course members
- Set priority levels (Low, Medium, High)
- Add due dates with overdue indicators
- Add optional descriptions

📚 **Course Organization:**
- Create multiple courses
- Automatic course member management
- Task counts per course
- Progress tracking

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui components
- **Backend:** Firebase Authentication + Firestore
- **Real-time:** Firestore onSnapshot listeners
- **Routing:** Wouter
- **Forms:** React Hook Form + Zod validation

## Firebase Setup (Required)

### Step 1: Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. **Enable** both:
   - Email/Password
   - Email link (passwordless sign-in) - Optional
6. Click **Save**

### Step 2: Set up Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with the content from `FIREBASE_SETUP.md`
3. Click **Publish**

### Step 3: Configure Email Templates (Optional)

1. Go to **Authentication** → **Templates**
2. Customize the email verification template
3. Add your app name and logo

## Running the Application

The app is already configured with your Firebase credentials. Simply:

1. Visit the deployed URL
2. Click "Create an account"
3. Register with your email
4. Check your email for verification link
5. Click the verification link
6. Return to the app and click "Check Verification"
7. Start creating courses and tasks!

## Usage Guide

### Getting Started

1. **Register** - Create an account with your university email
2. **Verify Email** - Click the link sent to your email
3. **Create a Course** - Click the "+" button in the sidebar
4. **Add Tasks** - Click "New Task" on the dashboard or course page
5. **Collaborate** - Share course IDs with classmates (feature coming soon)

### Creating Tasks

1. Click "New Task" or "Add Task"
2. Fill in:
   - Title (required)
   - Description (optional)
   - Course (select from dropdown)
   - Priority (Low/Medium/High)
   - Due Date (optional)
   - Assign To (yourself or course member)
3. Click "Create Task"

### Managing Tasks

- **Complete:** Click the checkbox next to a task
- **Edit:** Click the three-dot menu → Edit
- **Delete:** Click the three-dot menu → Delete
- **Filter:** Use the filter dropdowns on course pages
- **Sort:** Choose to sort by due date or priority

## Real-Time Features

All changes sync instantly across all users:
- New tasks appear immediately
- Task updates reflect in real-time
- Course changes sync across all members
- No page refresh needed!

## Project Structure

```
client/
  src/
    components/      # Reusable UI components
      ui/           # shadcn/ui components
      app-sidebar.tsx
      TaskCard.tsx
      TaskDialog.tsx
      CourseDialog.tsx
    pages/          # Page components
      login.tsx
      register.tsx
      verify-email.tsx
      dashboard.tsx
      course.tsx
    contexts/       # React contexts
      AuthContext.tsx
    lib/           # Utilities
      firebase.ts   # Firebase configuration
      queryClient.ts
      utils.ts
shared/
  schema.ts        # TypeScript types and Zod schemas
server/           # Express server (minimal, just for Vite)
```

## Security

- Email verification required
- Firestore security rules enforce permissions
- Tasks scoped to user's courses only
- Zod validation on all data inputs
- Course membership checks on all operations

## Troubleshooting

### Registration Fails

**Error:** `auth/configuration-not-found`
**Solution:** Enable Email/Password authentication in Firebase Console (see Step 1 above)

**Error:** `auth/email-already-in-use`
**Solution:** This email is already registered. Try logging in instead.

### Email Verification Not Working

1. Check your spam folder
2. Click "Resend Verification Email"
3. Make sure the email is from your Firebase project
4. Check Firebase Console → Authentication → Templates

### Tasks Not Loading

1. Make sure you're verified and logged in
2. Create a course first
3. Check browser console for errors
4. Verify Firestore security rules are set up

### Real-time Updates Not Working

1. Check internet connection
2. Look for console errors
3. Try refreshing the page
4. Verify Firestore security rules allow reads

## Development

To run locally:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

## Firebase Deployment (Optional)

To deploy to Firebase Hosting:

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

## Contributing

This is a student project. Feel free to fork and extend it!

## License

MIT

## Support

For issues or questions, please check:
1. Firebase Console logs
2. Browser console
3. FIREBASE_SETUP.md for detailed configuration
4. This README for troubleshooting steps
