# StudySync Tasks - Design Guidelines

## Design Approach
**System Selected:** Linear/Notion-inspired productivity design system
**Rationale:** As a utility-focused task management tool for students, the design prioritizes clarity, efficiency, and information density over visual flourishes. Drawing from Linear's clean typography and Notion's organized layouts ensures optimal usability for real-time collaboration.

## Core Design Principles
1. **Scannable Information Hierarchy** - Students need to quickly identify urgent tasks
2. **Clear Status Communication** - Real-time updates must be instantly visible
3. **Efficient Task Creation** - Minimize friction in adding/editing tasks
4. **Course-Based Visual Organization** - Each course should feel distinct but cohesive

---

## Typography System

**Font Family:** Inter (Google Fonts) - modern, highly legible at all sizes

**Hierarchy:**
- Page Titles: 2xl/3xl, semibold (Dashboard, Course Names)
- Section Headers: xl, semibold (Today's Tasks, Upcoming)
- Task Titles: base/lg, medium
- Task Metadata: sm, regular (due dates, assignees, descriptions)
- Labels/Tags: xs, medium (priority badges, status)
- Form Labels: sm, medium
- Button Text: sm, semibold

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 3, 4, 6, 8, 12, 16**
- Tight spacing (2-3): Within components, badge padding
- Standard spacing (4-6): Between related elements, form fields
- Generous spacing (8-12): Between sections, card padding
- Section spacing (16): Page margins, major content blocks

**Container Strategy:**
- Dashboard: max-w-7xl with sidebar navigation
- Course Pages: max-w-6xl centered
- Forms/Modals: max-w-2xl for focused input

---

## Component Library

### Navigation
**Sidebar (Desktop):**
- Fixed left sidebar (w-64)
- Logo/App name at top
- Course list with unread counts/task indicators
- User profile at bottom with logout
- Active course highlighted with subtle accent

**Mobile Navigation:**
- Top header with hamburger menu
- Slide-out drawer for course list
- Bottom tab bar for Dashboard/Profile quick access

### Dashboard Layout
**Multi-Column Grid:**
- Desktop: 2-column layout (lg:grid-cols-2)
  - Left: "Due Today" + "Upcoming This Week"
  - Right: "By Course" overview cards
- Tablet: Single column stack
- Each section uses card containers with subtle borders

**Course Overview Cards:**
- 2-column grid (md:grid-cols-2) within dashboard
- Shows course name, task count, next due date
- Progress indicator (completed/total tasks)
- Click to navigate to course page

### Task List Components
**Task Card Structure:**
- Checkbox (left) for completion toggle
- Task title (medium weight)
- Priority badge (small, rounded pill)
- Due date with icon (sm text)
- Assignee avatar/initials (if assigned to others)
- Action menu (3-dot) on hover (edit/delete)

**Visual States:**
- Pending: Full opacity, clean borders
- Completed: Reduced opacity, strike-through title
- Overdue: Red accent on due date, subtle red border
- High Priority: Red badge, slight red glow/border
- Medium Priority: Orange badge
- Low Priority: Gray badge

### Course Page Layout
**Header Section:**
- Course title (2xl)
- Add Task button (prominent, top-right)
- Quick stats: X pending, Y completed
- Filter/Sort controls in toolbar

**Task List:**
- Grouped by status (Pending → Completed)
- Sortable columns approach OR card-based list
- Empty states with encouraging CTAs

### Forms
**Task Creation/Edit Modal:**
- Overlay modal (max-w-2xl)
- Fields stack vertically with consistent spacing (space-y-4)
- Title: Full-width input, large text
- Description: Textarea, 3-4 rows
- Due Date: Date picker input
- Priority: Radio buttons OR dropdown (horizontal layout)
- Assign To: Dropdown showing course members
- Action buttons: Cancel (ghost) + Save (primary, right-aligned)

### Authentication Pages
**Login/Register:**
- Centered card (max-w-md)
- Logo/app name at top
- Form fields with clear labels above inputs
- Primary CTA button (full-width)
- Link to alternate action below (Register/Login switch)
- Email verification message displayed prominently

### Real-Time Indicators
- Subtle pulse animation on newly added tasks (1-2 seconds)
- "Live" dot indicator in header when connected
- Toast notifications (top-right) for task assignments: "You were assigned to [Task]"

---

## Responsive Behavior

**Breakpoints:**
- Mobile: base (stack all)
- Tablet: md (2-column task grids)
- Desktop: lg (sidebar + multi-column dashboard)

**Mobile Optimizations:**
- Hide sidebar, use drawer navigation
- Stack dashboard sections vertically
- Full-width task cards
- Floating Add Task button (bottom-right)
- Swipe gestures for task actions (bonus)

---

## Icons
**Library:** Heroicons (via CDN)
- Navigation: outline style
- Task actions: outline style  
- Status indicators: solid style for emphasis
- Common icons: check, calendar, user, flag (priority), menu, plus, pencil, trash

---

## Images
**No large hero image required** - this is a productivity app, not a marketing site.

**Avatar Images:**
- User profile pictures (circular, 32px-40px)
- Course member avatars in task assignments
- Initials fallback for users without photos

**Empty States:**
- Simple illustrative icons (Heroicons) for "No tasks yet"
- No decorative imagery needed

---

## Special Considerations

**Course Distinction:**
- Each course can have a subtle accent (auto-assigned from palette)
- Used in badges, borders, and navigation highlights
- Maintains overall design consistency while adding visual differentiation

**Accessibility:**
- Form inputs: visible labels, proper focus states
- Task checkboxes: Large enough hit targets (min 44px)
- Priority badges: Include text, not just color coding
- Keyboard navigation: Full support for task list traversal

**Performance:**
- Minimize animations - only use for real-time feedback
- No auto-playing animations
- Subtle transitions on hover/focus (150-200ms)

---

This design creates a professional, efficient study tool that prioritizes clarity and usability while maintaining a modern aesthetic appropriate for university students.