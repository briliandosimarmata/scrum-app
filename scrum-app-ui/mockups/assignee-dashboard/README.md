# Assignee Dashboard Feature

This directory contains the complete UI mockup for the **Assignee Dashboard** feature, which allows users to register as assignees and manage their assigned tasks within projects.

## 📁 File Structure

```
assignee-dashboard/
├── README.md                           # This documentation
├── role-selection.html                 # Role selection page (Project Manager vs Assignee)
├── assignee-registration.html          # Register as assignee for a project
├── assignee-sprint-list.html          # Sprint selection page for assignees
├── assignee-dashboard.html            # Main assignee dashboard overview
├── assignee-my-tasks.html             # Task management page
└── assignee-timeline.html             # Timeline view for assigned tasks
```

## 🚀 Feature Overview

The Assignee Dashboard feature provides a complete workflow for users who want to work as team members (assignees) on specific projects. This feature includes:

- **Role Selection**: Choose between Project Manager and Assignee roles
- **Assignee Registration**: Register as an assignee for a specific project
- **Sprint Management**: Select and switch between different sprints
- **Task Management**: View and update assigned tasks
- **Timeline View**: Visual timeline of task schedules
- **Responsive Design**: Mobile-first approach with collapsible sidebar

## 📋 User Flow

### 1. Role Selection (`role-selection.html`)
- **Purpose**: Appears after login when user has both Project Manager and Assignee roles
- **Features**:
  - Two role cards: Project Manager and Assignee
  - Clear descriptions of each role's capabilities
  - Responsive design with hover effects
  - User navbar with avatar and dropdown

### 2. Assignee Registration (`assignee-registration.html`)
- **Purpose**: Allow existing users to register as assignees for a specific project
- **Form Fields**:
  - **Email**: User's email address
  - **Password**: User's password for authentication
  - **Assignee Code**: Code provided by project manager (auto-uppercase)
  - **Project Secret Key**: Secret key for project access
- **Validation**:
  - Email format validation
  - Password minimum length (6 characters)
  - Required field validation
  - Mock validation for assignee codes and secret keys
- **Features**:
  - Real-time form validation
  - Loading states during submission
  - Success/error message display
  - Auto-redirect to login on success

### 3. Sprint Selection (`assignee-sprint-list.html`)
- **Purpose**: Select a sprint to work on after login
- **Features**:
  - Grid of sprint cards with project information
  - Sprint details: name, project, description, duration, task count
  - Responsive card layout
  - User navbar with responsive design
  - Empty state handling

### 4. Main Dashboard (`assignee-dashboard.html`)
- **Purpose**: Overview of current sprint and task status
- **Sections**:
  - **Sprint Overview**: Sprint name, duration, total tasks, departments
  - **Task Status Summary**: Count of tasks by status (To Do, In Progress, Done, Closed)
  - **Quick Actions**: Links to My Tasks, Timeline, and Switch Sprint
- **Features**:
  - Collapsible sidebar for mobile
  - Sticky header and sidebar elements
  - Department tags display
  - Responsive grid layout

### 5. Task Management (`assignee-my-tasks.html`)
- **Purpose**: View and manage assigned tasks
- **Features**:
  - **Task Cards**: Card-based layout with prominent status section
  - **Status Management**: Interactive dropdown to change task status
  - **Task Details**: Story points, department, dependency, order
  - **Status Restrictions**: Assignees can only set TODO, IN_PROGRESS, DONE (not CLOSED)
  - **Filtering**: Closed tasks are hidden from assignee view
  - **Responsive Design**: Mobile-optimized card layout

### 6. Timeline View (`assignee-timeline.html`)
- **Purpose**: Visual timeline of assigned tasks
- **Features**:
  - **Month Navigation**: Pagination-style month header with chevron buttons
  - **Card-Based Timeline**: Responsive card layout for all devices
  - **Task Information**: Code, description, status, date range, duration
  - **Status Indicators**: Color-coded borders and badges
  - **Empty State**: Message when no tasks are available

## 🎨 Design System

### Color Scheme
- **Primary**: Blue (`#3B82F6`)
- **Success**: Green (`#10B981`)
- **Warning**: Orange (`#F59E0B`)
- **Error**: Red (`#EF4444`)
- **Background**: Light Blue (`#EFF6FF`)

### Typography
- **Font Family**: Plus Jakarta Sans
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Components
- **Cards**: White background with shadow and rounded corners
- **Buttons**: Rounded with hover effects and focus states
- **Forms**: Clean inputs with validation states
- **Navigation**: Collapsible sidebar with sticky elements

## 📱 Responsive Design

### Mobile (< 768px)
- **Sidebar**: Collapsible with slide transition
- **Navigation**: Hamburger menu with overlay
- **Cards**: Single column layout
- **Forms**: Full-width inputs
- **User Navbar**: Avatar only, user info in dropdown

### Desktop (≥ 768px)
- **Sidebar**: Always visible, fixed position
- **Navigation**: Full sidebar with all menu items
- **Cards**: Multi-column grid layout
- **Forms**: Centered with max-width
- **User Navbar**: Full user info display

## 🔧 Technical Features

### JavaScript Functionality
- **Form Validation**: Real-time validation with error display
- **Sidebar Management**: Mobile sidebar toggle with overlay
- **Dropdown Menus**: User avatar dropdown with click-outside handling
- **Status Updates**: Task status change with immediate UI update
- **Month Navigation**: Timeline month switching with data filtering
- **Mock Data**: Complete mock data for testing all features

### State Management
- **localStorage**: Sprint selection persistence
- **Session State**: Current user and role information
- **Form State**: Validation and submission states
- **UI State**: Sidebar visibility, dropdown states

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color combinations

## 🧪 Mock Data

### Valid Test Credentials
- **Project Secret Keys**: `PROJECT123SECRET`, `TEAM456KEY`, `SPRINT789CODE`
- **Assignee Codes**: `DEV001`, `TEST002`, `UI003`

### Sample Tasks
- Multiple tasks with different statuses (TODO, IN_PROGRESS, DONE)
- Various priorities (HIGH, MEDIUM, LOW)
- Different departments (Frontend, Backend, Mobile)
- Task dependencies and ordering

### Timeline Data
- October and November task data
- Holiday information
- Task date ranges and durations

## 🚦 Navigation Flow

```
Login → Role Selection → Assignee Registration (if needed)
    ↓
Sprint Selection → Assignee Dashboard
    ↓
├── My Tasks (Task Management)
├── Timeline (Task Schedule)
└── Switch Sprint (Back to Sprint Selection)
```

## 🔐 Security Features

### Form Validation
- **Client-side validation** for immediate feedback
- **Email format validation** with regex
- **Password strength requirements**
- **Required field validation**

### Mock Authentication
- **Assignee code validation** against predefined codes
- **Project secret key validation** for project access
- **Session management** with localStorage

## 📊 Status Management

### Task Statuses
- **TODO**: Gray badge, not started
- **IN_PROGRESS**: Blue badge, currently working
- **DONE**: Green badge, completed
- **CLOSED**: Red badge, closed (assignees cannot set this)

### Status Restrictions
- **Assignees**: Can set TODO, IN_PROGRESS, DONE
- **Project Managers**: Can set all statuses including CLOSED

## 🎯 Key Features

### Interactive Elements
- **Status Dropdowns**: Large, prominent status change buttons
- **Hover Effects**: Card lift and shadow effects
- **Loading States**: Spinner animations during form submission
- **Success/Error Messages**: Clear feedback for user actions

### User Experience
- **Auto-focus**: First input focused on page load
- **Auto-redirect**: Success redirects after delay
- **Sticky Elements**: Headers and navigation stay visible
- **Smooth Transitions**: CSS transitions for all interactions

## 🔄 Future Enhancements

### Potential Improvements
- **Real API Integration**: Replace mock data with actual backend calls
- **Advanced Filtering**: Filter tasks by status, priority, department
- **Search Functionality**: Search tasks by code or description
- **Bulk Actions**: Select multiple tasks for batch operations
- **Notifications**: Real-time updates for task changes
- **Dark Mode**: Toggle between light and dark themes

### Additional Features
- **Task Comments**: Add comments to tasks
- **File Attachments**: Upload files to tasks
- **Time Tracking**: Track time spent on tasks
- **Progress Reports**: Generate progress reports
- **Team Collaboration**: See other team members' tasks

## 📝 Usage Instructions

### For Developers
1. **Open any HTML file** in a web browser
2. **Test form validation** with various inputs
3. **Try responsive design** by resizing browser window
4. **Test navigation** between different pages
5. **Use mock credentials** for testing registration

### For Users
1. **Start with role selection** if you have multiple roles
2. **Register as assignee** if you need to join a project
3. **Select a sprint** to work on
4. **View your dashboard** for sprint overview
5. **Manage tasks** in the My Tasks page
6. **Check timeline** for task schedules

## 🐛 Known Issues

### Current Limitations
- **Mock Data Only**: All data is hardcoded for demonstration
- **No Persistence**: Form data is not saved between sessions
- **Limited Validation**: Only basic client-side validation
- **No Error Recovery**: Limited error handling for edge cases

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **CSS Features**: Uses modern CSS features (Grid, Flexbox, Custom Properties)

## 📞 Support

For questions or issues with this feature:
1. **Check the mock data** for valid test credentials
2. **Verify browser compatibility** for CSS features
3. **Test responsive design** on different screen sizes
4. **Review JavaScript console** for any errors

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Complete UI Mockup
