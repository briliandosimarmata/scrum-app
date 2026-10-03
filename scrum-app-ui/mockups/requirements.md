# Scrum Board Web App - Requirements & Specifications

## Project Overview
A custom Scrum Board web application for agile project management with comprehensive task tracking, sprint management, and team organization capabilities.

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Tailwind CSS
- **Font**: Plus Jakarta Sans
- **Icons**: Font Awesome 6.4.2
- **Color Scheme**: White, Soft Blue base colors (no dark themes)

## Core Features

### 1. Authentication System
- **Login Page** (`login.html`)
  - Email and password authentication
  - Email serves as user ID
  - Redirects to project list after successful login
  - Link to registration page

- **Registration Page** (`register.html`)
  - Required fields: First Name, Last Name, Email, Password
  - Email validation
  - Redirects to login page after successful registration
  - Link to login page

### 2. Project Management
- **Project List Page** (`project-list.html`)
  - Card-based project display
  - "Create New Project" button at top
  - Project cards show: thumbnail, name, description, project code
  - **Draggable modal** for creating/editing projects
  - **Edit and Delete project** functionality with circular soft-color buttons
  - Empty state when no projects exist
  - Header with user info and logout

- **Project Creation/Edit Modal**
  - Required fields: Project Name (max 20 chars), Project Code (max 4 chars, alphanumeric), Project Description, Project Thumbnail URL
  - **Real-time form validation** with character counters
  - **Project code uniqueness validation** across all projects
  - **Auto-uppercase conversion** for project codes
  - **Draggable dialog** - click anywhere to move (except form elements)
  - Dynamic project card creation
  - Cancel and Create/Update actions

### 3. Dashboard (`dashboard.html`)
- **Project Overview**
  - Project description display
  - Summary cards showing:
    - Total Tasks
    - Total Sprints
    - Total Departments
    - Total Assignees

- **Sidebar Navigation**
  - **Scrollable navigation area** with sticky header and footer
  - Dashboard (active state)
  - Masters submenu (collapsible)
    - Assignee
    - Department
  - Add New Sprint button
  - Sprint Menu (appears when sprints exist)
    - Sprint dropdown selector
    - Backlog
    - Department Tasks
    - Assignee Tasks
    - Timeline
    - Sprint Settings
  - **Sticky elements**: Project title and "Back to Projects" button remain fixed

### 4. Sprint Management
- **Sprint Creation/Edit Modal**
  - Required fields:
    - Sprint Name
    - Story Points per Day (decimal)
    - Start Date
    - End Date
  - Calculated field: Total Days of Work
  - Holiday Selector:
    - Recurring day selection (Su-Sa checkboxes)
    - Calendar picker for specific dates
    - Visual holiday marking
  - Form validation and date constraints

- **Sprint Dropdown**
  - Searchable sprint selection
  - Active sprint display
  - Dynamic sprint list management

### 5. Masters Management

#### Assignee Management (`assignee.html`)
- **Search Functionality**
  - Real-time search by assignee name or code
  - Search field replaces "Manage Assignees" title
  - Case-insensitive search with instant filtering

- **Assignee Table with Pagination**
  - Columns: Code (auto-generated with project prefix), Name, Actions
  - **Client-side pagination** with configurable page sizes (5, 10, 25, 50)
  - **Font Awesome pagination icons** (First, Previous, Next, Last)
  - **Ellipsis for large page counts**
  - **Page size dropdown** with custom styling
  - Pagination resets to page 1 when filters change

- **Assignee Management**
  - Add new assignee functionality (resets search and pagination)
  - Edit assignee names inline
  - Delete assignees with confirmation
  - Auto-generated codes with project prefix (e.g., MBAP-AS-001)

#### Department Management (`department.html`)
- **Department Cards Grid**
  - Department name and code display
  - Member count and avatars
  - Priority member indication (star icon)
  - Edit and Delete actions

- **Department Modal**
  - Department name and auto-generated code with project prefix
  - Member management:
    - Available assignees list (searchable)
    - Department members list (searchable)
    - Drag-and-drop or click-to-move functionality
    - Priority department setting (star toggle)
  - Form validation

### 6. Task Management

#### Backlog (`backlog.html`)
- **Task Table with Pagination**
  - Columns: Code (with project prefix), Dependency, Description, Priority, Story Points, Status, Department, Assignee, Actions
  - **Client-side pagination** with configurable page sizes (5, 10, 25, 50)
  - **Font Awesome pagination icons** (First, Previous, Next, Last)
  - **Ellipsis for large page counts**
  - **Page size dropdown** with custom styling
  - Pagination resets to page 1 when filters change

- **Task Management**
  - Inline editing for description and story points
  - Dropdown selectors for all fields
  - Searchable dropdowns for Department and Assignee
  - Task dependency management
  - Close task functionality
  - Delete task functionality
  - Closed tasks styling (strikethrough, disabled editing)

- **Filtering System**
  - Department filter (searchable)
  - Assignee filter (searchable, dependent on department)
  - Priority filter
  - Status filter
  - Show/Hide closed tasks toggle

- **Task Creation**
  - Add new task button (resets filters and pagination)
  - Auto-generated task codes with project prefix (e.g., MBAP-T-01)
  - Default values for new tasks

#### Department Tasks Overview (`department-tasks.html`)
- **Department Filter**
  - Searchable department dropdown
  - Default to first department

- **Summary Section**
  - Department name
  - Total Story Points of Tasks
  - Total Team's Capacity in Story Points
    - Formula: (Total work days × Story points per day × Number of assignees) - External task load

- **Tasks List**
  - Columns: Task Code, Description, Assignee, Priority (color-coded badge), Story Points, Days Spent
  - **Priority Badges**: Color-coded badges (High: red, Medium: orange, Low: green)
  - Days Spent calculation: Story Points ÷ Story Points per Day
  - Empty state when no tasks

#### Assignee Tasks Overview (`assignee-tasks.html`)
- **Assignee Filter**
  - Searchable assignee dropdown
  - Default to first assignee

- **Summary Section**
  - Assignee name
  - **Total Capacity in Story Points**: (Total work days × Story points per day)
  - **Total Capacity Left**: Total Capacity - Sum of all assigned task story points

- **Tasks List with Drag-and-Drop Ordering**
  - **Order Column**: Leftmost column showing execution sequence (1, 2, 3...)
  - **Drag-and-Drop Functionality**:
    - Draggable rows with visual drag handles (grip icons)
    - Drag from anywhere on the row
    - Visual feedback: semi-transparent dragging with rotation effect
    - Drop zone highlighting with blue borders
    - Cursor changes (grab/grabbing) for better UX
    - Automatic order number updates when rows are reordered
    - Real-time persistence of order changes
  - **Enhanced Columns**: Order, Task Code (with project prefix), Task Dependency (shows task code or "None"), Task Description, Priority (color-coded badge), Status (color-coded badge), Story Points, Days Spent
  - **Priority and Status Badges**: Color-coded badges for visual clarity
  - **Closed Task Filtering**: Tasks with "closed" status are automatically filtered out
  - Days Spent calculation: Story Points ÷ Story Points per Day
  - Empty state when no tasks assigned

### 7. Timeline (`timeline.html`)
- **Department Filter**
  - Searchable department dropdown
  - All departments option

- **Timeline Grid**
  - Frozen pane with task names
  - Scrollable pane with date columns
  - Month headers spanning multiple columns
  - Date headers with day names
  - Holiday highlighting (red background)
  - Task bars with:
    - Assignee avatars (initials)
    - Task descriptions
    - Status-based colors
    - Proper date positioning

## Data Models

### User
- First Name, Last Name, Email, Password

### Project
- Name (max 20 characters), Code (max 4 characters, alphanumeric, unique), Description, Thumbnail URL

### Sprint
- Name, Story Points per Day, Start Date, End Date
- Recurring Holidays (array of day numbers 0-6)
- Specific Holidays (array of date strings)
- Calculated: Total Work Days

### Assignee
- Code (auto-generated with project prefix), Name
- Priority Department (foreign key)

### Department
- Code (auto-generated with project prefix), Name
- Members (many-to-many with Assignee)
- Priority relationships

### Task
- Code (auto-generated with project prefix), Dependency (foreign key), Description
- Priority (High/Medium/Low), Story Points, Status (To Do/In Progress/Done/Closed)
- Department (foreign key), Assignee (foreign key)
- **Order** (integer, user-defined execution sequence starting from 1)
- Start Date, End Date (for timeline)

## UI/UX Guidelines

### Design Principles
- Simple and elegant interface
- Consistent spacing and typography
- Hover states and transitions
- Responsive design
- Accessible color contrast

### Color Scheme
- Primary: Blue (#2563eb)
- Background: Soft Blue (#eff6ff)
- Success: Green
- Warning: Orange
- Error: Red
- Neutral: Gray

### Typography
- Font Family: Plus Jakarta Sans
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Sizes: 10pt for tables, 12pt for general text, larger for headers

### Interactive Elements
- Hover effects on buttons and links
- Focus states for accessibility
- Loading states for async operations
- Confirmation dialogs for destructive actions
- Toast notifications for success/error messages
- **Draggable modals** with smart element exclusions
- **Circular soft-color buttons** with glass-morphism effects
- **Pagination with Font Awesome icons** and ellipsis
- **Real-time search** with instant filtering
- **Drag-and-drop task ordering** with visual feedback and automatic persistence
- **Color-coded badges** for priority and status indicators

## Navigation Flow
1. Login → Project List
2. Project List → Dashboard (select project)
3. Dashboard → Various pages via sidebar
4. All pages → Project List (via "Back to Projects")
5. All pages → Login (via logout)

## Current Implementation Status
✅ **Login & Registration** - Complete with form validation
✅ **Project List & Management** - Complete with draggable modals, edit/delete functionality, project codes
✅ **Dashboard with Sprint Management** - Complete with scrollable sidebar
✅ **Assignee Management** - Complete with search, pagination, and project code prefixes
✅ **Department Management** - Complete with project code prefixes
✅ **Backlog with Advanced Filtering** - Complete with pagination, Font Awesome icons, project code prefixes
✅ **Department Tasks Overview** - Complete with priority badges
✅ **Assignee Tasks Overview** - Complete with drag-and-drop task ordering, priority/status badges, closed task filtering
✅ **Timeline View** - Complete
✅ **Enhanced UI Features** - Draggable modals, circular buttons, pagination, search, drag-and-drop

## Recent Enhancements Completed
1. ✅ **Project Code System** - 4-character alphanumeric codes with uniqueness validation
2. ✅ **Draggable Modals** - Click anywhere to drag (except form elements)
3. ✅ **Circular Soft-Color Buttons** - Modern glass-morphism design for edit/delete actions
4. ✅ **Advanced Pagination** - Font Awesome icons, ellipsis, configurable page sizes
5. ✅ **Real-time Search** - Instant filtering for assignees and other entities
6. ✅ **Scrollable Sidebar** - Sticky header/footer with scrollable navigation
7. ✅ **Enhanced Form Validation** - Character counters, real-time validation
8. ✅ **Project Management** - Full CRUD operations with edit/delete functionality
9. ✅ **Task Ordering System** - Drag-and-drop reordering with visual feedback
10. ✅ **Priority & Status Badges** - Color-coded badges for better visual clarity
11. ✅ **Enhanced Mock Data** - Expanded to 20 tasks for comprehensive testing
12. ✅ **Department Tasks Priority Column** - Added priority badges to department task overview
13. ✅ **Closed Task Filtering** - Automatic filtering of completed tasks from assignee view

## Technical Improvements
- **Code Generation**: All entities now use project code prefixes (e.g., MBAP-T-01, MBAP-AS-001)
- **UI/UX**: Modern design with soft colors, glass-morphism effects, smooth animations
- **Performance**: Client-side pagination and filtering for better responsiveness
- **Accessibility**: Proper focus states, keyboard navigation, screen reader support
- **Mobile Support**: Touch-friendly interfaces, responsive design
- **Drag-and-Drop**: HTML5 Drag and Drop API with visual feedback and automatic persistence
- **Data Management**: Enhanced mock data structure with order fields and comprehensive task relationships

## Future Enhancements (Optional)
1. Add data persistence (localStorage or backend integration)
2. Enhance error handling and validation
3. Add export/import functionality
4. Implement real-time updates
5. Add user role management
6. Enhance mobile responsiveness
7. Add keyboard shortcuts
8. Add bulk task operations (bulk edit, bulk delete)
9. Implement task templates and recurring tasks
10. Add advanced reporting and analytics
