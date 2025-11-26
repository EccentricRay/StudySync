# Firebase Setup Instructions

This document provides instructions for setting up Firebase Security Rules for your StudySync Tasks application.

## Firestore Security Rules

To ensure your data is properly secured, set up the following Firestore Security Rules in your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user's email is verified
    function isVerified() {
      return request.auth.token.email_verified == true;
    }
    
    // Helper function to check if user is a member of a course
    function isMemberOf(courseId) {
      let membershipId = courseId + '_' + request.auth.uid;
      return exists(/databases/$(database)/documents/courseMembers/$(membershipId));
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read any user profile (for task assignments and creator display)
      allow read: if isSignedIn() && isVerified();
      
      // Users can only create/update their own profile
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && request.auth.uid == userId;
      
      // Users cannot delete profiles
      allow delete: if false;
    }
    
    // Course members collection (join table)
    match /courseMembers/{membershipId} {
      // All verified users can read all memberships (for displaying member counts)
      allow read: if isSignedIn() && isVerified();
      
      // Users can create their own memberships (join courses)
      allow create: if isSignedIn() && isVerified() &&
                       request.auth.uid == request.resource.data.userId &&
                       request.resource.data.id == membershipId;
      
      // Users can delete their own memberships (leave courses)
      allow delete: if isSignedIn() && isVerified() &&
                       request.auth.uid == resource.data.userId;
      
      // Users cannot update memberships directly
      allow update: if false;
    }
    
    // Courses collection
    match /courses/{courseId} {
      // All verified users can read all courses (global catalog)
      allow read: if isSignedIn() && isVerified();
      
      // Any verified user can create a course
      allow create: if isSignedIn() && isVerified() &&
                       request.auth.uid == request.resource.data.createdBy;
      
      // Only the course creator can update or delete the course
      allow update: if isSignedIn() && isVerified() &&
                       request.auth.uid == resource.data.createdBy;
      allow delete: if isSignedIn() && isVerified() &&
                       request.auth.uid == resource.data.createdBy;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      // Users can read tasks for courses they are members of
      allow read: if isSignedIn() && isVerified() &&
                     isMemberOf(resource.data.courseId);
      
      // Users can create tasks in courses they are members of
      allow create: if isSignedIn() && isVerified() &&
                       request.auth.uid == request.resource.data.createdBy &&
                       isMemberOf(request.resource.data.courseId);
      
      // Users can update tasks in courses they are members of
      // courseId is immutable - prevents moving tasks between courses
      allow update: if isSignedIn() && isVerified() &&
                       isMemberOf(resource.data.courseId) &&
                       request.resource.data.courseId == resource.data.courseId;
      
      // Users can delete tasks in courses they are members of
      allow delete: if isSignedIn() && isVerified() &&
                       isMemberOf(resource.data.courseId);
    }
  }
}
```

3. Click **Publish** to save the rules

## Email Verification Setup

To enable email verification:

1. In Firebase Console, go to **Authentication** → **Templates** tab
2. Click on **Email address verification**
3. Customize the email template if desired
4. Save changes

## Optional: Configure Email Provider Settings

For better email deliverability:

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your deployment domain (if using Firebase Hosting or custom domain)
3. Configure SMTP settings in **Authentication** → **Templates** (optional)

## Testing

After setting up the security rules:

1. Register a new user account
2. Verify your email
3. Create a course
4. Create tasks within the course
5. Test that real-time updates work across multiple browser windows

## Important Notes

- Users must verify their email before accessing the app
- **Global Course Catalog**: All verified users can see all courses and join any course
- **Membership-Based Access**: Tasks are only visible to members of the course they belong to
- **Security Model**: 
  - Course metadata (name, description, creator) is globally readable
  - Task access requires membership verification via the `courseMembers` collection
  - Only course creators can edit or delete courses
  - All course members can create, edit, and delete tasks within their courses
  - **Task courseId is immutable** - tasks cannot be moved between courses after creation
- All real-time updates use Firestore's onSnapshot listeners for instant synchronization
- Membership is tracked via a separate `courseMembers` collection with composite key format: `{courseId}_{userId}`

## Privacy Considerations

- **Course Membership Visibility**: All authenticated users can see who is a member of which course (necessary for displaying member counts in the course directory). If this is a concern, consider implementing aggregated member counts stored on the course document instead.
- **Course Discovery**: All course names and descriptions are globally visible to facilitate discovery and collaboration among students.
