# StudySync Tasks - Replit Project Guide

## Overview

StudySync Tasks is a real-time collaborative task management application designed for university students. It enables students to organize course-specific tasks, assign them to group members, and sync changes instantly across all devices. The application features email-based authentication with verification, course-based task organization, and a modern, Linear/Notion-inspired UI built with React and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with functional components and hooks for UI development
- **Vite** as the build tool and development server, configured with hot module replacement (HMR)
- **TypeScript** for type safety across the entire frontend codebase
- **Wouter** for lightweight client-side routing (instead of React Router)

**State Management**
- **React Context API** for authentication state (`AuthContext`)
- **TanStack Query** (React Query) for server state management and caching
- Real-time state synchronization through Firestore listeners in the main `App.tsx` component
- Local component state using `useState` for UI-specific concerns

**UI Component Library**
- **shadcn/ui** components (Radix UI primitives with Tailwind styling)
- Custom design system following Linear/Notion principles with Inter font
- Responsive design with mobile-first approach using Tailwind breakpoints
- Sidebar navigation pattern with `SidebarProvider` for desktop/mobile adaptability

**Styling Approach**
- **Tailwind CSS** with custom configuration extending the base theme
- CSS custom properties for theming (light/dark mode support built-in)
- Utility-first approach with component-level customization
- Design tokens defined in `tailwind.config.ts` and `index.css`

**Key Frontend Patterns**
- Protected routes using `ProtectedRoute` wrapper component that checks authentication and email verification
- Dialog-based workflows for task and course creation/editing
- Real-time data subscription pattern with `useEffect` cleanup for Firestore listeners
- Optimistic UI updates with toast notifications for user feedback

### Backend Architecture

**Database & Hosting**
- **Firebase Firestore** as the primary real-time NoSQL database
- **Firebase Authentication** for user management with email/password provider
- **Firebase Hosting** for static asset deployment (configured but not visible in current structure)

**Data Schema Design**
The schema is defined in `shared/schema.ts` using Zod for validation:

- **Users Collection**: Stores user profiles with email, displayName, emailVerified status
- **Courses Collection**: Contains course information, member lists, and ownership (createdBy)
- **Tasks Collection**: Task entities with title, description, priority, status, assignments, and due dates

**Security Model**
- Firestore Security Rules enforce data access control (documented in `FIREBASE_SETUP.md`)
- Users can only read courses they are members of
- Email verification required for all data access operations
- User profiles are readable by all authenticated users (for task assignment purposes)

**Server Layer**
The Express server (`server/index.ts`) is minimal and serves primarily as:
- Static file server for the Vite-built frontend in production
- Development proxy for Vite's dev server with HMR
- Placeholder for future API routes (currently uses `/api` prefix pattern)

**Storage Interface**
- `MemStorage` class provides in-memory storage interface (not actively used)
- Pattern suggests future backend API implementation for hybrid Firebase/PostgreSQL setup
- Drizzle ORM configured for PostgreSQL with schema definitions (currently unused)

### Data Flow Architecture

**Real-Time Synchronization**
1. User actions trigger Firestore write operations (addDoc, updateDoc, deleteDoc)
2. Firestore `onSnapshot` listeners detect changes in real-time
3. React state updates trigger component re-renders
4. UI reflects changes instantly across all connected clients

**Authentication Flow**
1. User registers → Firebase creates account → Email verification sent
2. User verifies email → Status updated in Firebase Auth
3. User profile created in Firestore `/users` collection
4. `onAuthStateChanged` listener maintains session state
5. Protected routes check `currentUser` and `emailVerified` status

**Task Management Flow**
1. Tasks filtered by course membership on client-side
2. Dialog forms validate input using Zod schemas
3. Firestore operations wrapped in try-catch with toast notifications
4. Real-time listeners propagate changes to all UI components

### External Dependencies

**Firebase Services**
- **Firebase Authentication** - Email/password authentication with email verification
- **Firebase Firestore** - Real-time NoSQL database for all application data (users, courses, tasks)
- Configured via environment variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.

**Database (Configured but Inactive)**
- **Neon PostgreSQL** - Serverless PostgreSQL provider configured via `DATABASE_URL`
- **Drizzle ORM** - TypeScript ORM with schema definitions in `shared/schema.ts`
- Migration system configured in `drizzle.config.ts` (not currently utilized)
- Note: PostgreSQL infrastructure is set up but the application currently uses only Firebase Firestore

**UI Component Libraries**
- **Radix UI** - Headless accessible component primitives (@radix-ui/react-*)
- **shadcn/ui** - Pre-styled components built on Radix UI
- **Lucide React** - Icon library for consistent iconography
- **date-fns** - Date manipulation and formatting utilities
- **react-day-picker** - Calendar component for date selection

**Development & Build Tools**
- **Vite Plugins**: Runtime error overlay, source mapping, Replit-specific tooling
- **esbuild** - Fast JavaScript bundler for production server build
- **PostCSS** with Tailwind for CSS processing
- **tsx** - TypeScript execution for development server

**Validation & Forms**
- **Zod** - Schema validation for all data models
- **React Hook Form** with @hookform/resolvers for form state management
- **drizzle-zod** - Integration between Drizzle schemas and Zod validation

**Routing & Data Fetching**
- **Wouter** - Minimalist client-side routing library
- **TanStack Query** - Server state management with caching and background updates

**Session Management**
- **connect-pg-simple** - PostgreSQL session store for Express (configured for future use)
- Currently relies on Firebase Authentication session management