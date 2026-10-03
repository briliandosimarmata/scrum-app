// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ErrorDetail | null;
}

// Error Detail Interface
export interface ErrorDetail {
  code: string;
  message: string;
  errors?: ValidationError[];
}

// Validation Error Interface
export interface ValidationError {
  code: string;
  message: string;
  field: string;
}

// User Interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// User Role Response Interface
export interface UserRoleResponse {
  isProjectManager: boolean;
  isAssignee: boolean;
}

// Health Check Interface
export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

// Project Interface
export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  thumbnailUrl: string;
  projectKey?: string; // Optional project key for display
  createdAt: Date;
  updatedAt: Date;
}

// Project List Response Interface
export interface ProjectListResponse {
  projects: Project[];
}

// Sprint Interface
export interface Sprint {
  id: string;
  name: string;
  storyPointsPerDay: number;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  specificHolidays: string[]; // Array of date strings in YYYY-MM-DD format
  projectId: string;
  totalWorkDays?: number; // Calculated field
}

// Sprint List Item Interface (for dropdown)
export interface SprintListItem {
  id: string;
  name: string;
}

// Sprint List Response Interface
export interface SprintListResponse {
  sprints: SprintListItem[];
}

// Assignee Sprint List Item Interface
export interface AssigneeSprintListItem {
  id: string;
  name: string;
  startDate: string; // ISO format
  endDate: string;   // ISO format
  taskCount: number;
  project: {
    id: string;
    name: string;
    thumbnailUrl: string;
    description: string;
  };
  departments: string[]; // Array of department names
}

// Assignee Sprint List Response Interface
export interface AssigneeSprintListResponse {
  sprints: AssigneeSprintListItem[];
}

// Assignee Dashboard Overview Interfaces
export interface SprintOverviewInfo {
  id: string;
  name: string;
  startDate: string; // ISO format
  endDate: string;   // ISO format
  durationDays: number;
}

export interface ProjectOverviewInfo {
  id: string;
  name: string;
}

export interface TaskStatusSummary {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  closedCount: number;
}

export interface AssigneeOverviewResponse {
  sprint: SprintOverviewInfo;
  project: ProjectOverviewInfo;
  taskSummary: TaskStatusSummary;
  departments: string[];
}

// Assignee Interface
export interface Assignee {
  id: string;
  code: string;
  name: string;
  projectId: string;
  isPriority?: boolean; // Optional - only present when fetched by department
  createdAt?: string;
  updatedAt?: string;
}

// Assignee List Response Interface
export interface AssigneeListResponse {
  assignees: Assignee[];
  totalCount: number;
}

// Department Member Interface
export interface DepartmentMember {
  id: string;
  departmentId: string;
  assigneeId: string;
  assigneeCode: string;
  assigneeName: string;
  isPriority: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Department Member Response Interface (for API responses)
export interface DepartmentMemberResponse {
  id: string;
  departmentId: string;
  assigneeId: string;
  assigneeCode: string;
  assigneeName: string;
  isPriority: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Department Member Request Interface (for API requests)
export interface DepartmentMemberRequest {
  id?: string; // Optional - present for existing members, absent for new members
  assigneeId: string;
  isPriority: boolean;
  markForDelete?: boolean; // Optional - only used in update operations to mark members for deletion
}

// Department Interface (base - without members)
export interface Department {
  id: string;
  code: string;
  name: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Department with members for API requests
export interface DepartmentWithMembers extends Department {
  members: DepartmentMember[];
}

// Department Request Interface (for API requests)
export interface DepartmentRequest {
  id?: string; // Optional - present for update, absent for create
  name: string;
  projectId: string;
  members: DepartmentMemberRequest[];
}

// Department with members for list page response
export interface DepartmentWithMembersResponse {
  id: string;
  code: string;
  name: string;
  projectId: string;
  memberCount: number;
  members: DepartmentMemberResponse[];
  createdAt?: string;
  updatedAt?: string;
}

// Department List with Members Response
export interface DepartmentListWithMembersResponse {
  departments: DepartmentWithMembersResponse[];
  totalCount: number;
}


// Task Request Interface (for API requests)
export interface TaskRequest {
  description: string;
  storyPoints: number;
  status: TaskStatus;
  priority: TaskPriority;
  sprintId: string;
  assigneeId?: string;
  departmentId?: string;
  dependencyTaskId?: string; // Fixed field name to match backend
}

// Task Response Interface (for API responses)
export interface TaskResponse {
  id: string;
  code: string;
  description: string;
  storyPoints: number;
  status: TaskStatus;
  priority: TaskPriority;
  sprintId: string;
  assigneeId?: string;
  departmentId?: string;
  dependencyTaskId?: string;
  taskOrder: number;
  projectId: string;
  assigneeName?: string;
  departmentName?: string;
  dependencyTaskCode?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  totalTasks: number;
  totalSprints: number;
  totalDepartments: number;
  totalAssignees: number;
}

// Enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CLOSED = 'CLOSED'
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Global utility functions for enum handling
export class EnumUtils {
  /**
   * Get display name for TaskStatus
   */
  static getTaskStatusDisplayName(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
      case TaskStatus.CLOSED: return 'Closed';
      default: return 'Unknown';
    }
  }

  /**
   * Get display name for TaskPriority
   */
  static getTaskPriorityDisplayName(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH: return 'High';
      case TaskPriority.MEDIUM: return 'Medium';
      case TaskPriority.LOW: return 'Low';
      default: return 'Unknown';
    }
  }

  /**
   * Get CSS classes for TaskStatus badges
   */
  static getTaskStatusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-100 text-gray-700';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TaskStatus.DONE: return 'bg-green-100 text-green-700';
      case TaskStatus.CLOSED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  /**
   * Get CSS classes for TaskPriority badges
   */
  static getTaskPriorityBadgeClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH: return 'bg-red-100 text-red-700';
      case TaskPriority.MEDIUM: return 'bg-orange-100 text-orange-700';
      case TaskPriority.LOW: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  /**
   * Convert string to TaskStatus enum (for backend integration)
   */
  static stringToTaskStatus(statusString: string): TaskStatus {
    switch (statusString.toUpperCase()) {
      case 'TODO': return TaskStatus.TODO;
      case 'IN_PROGRESS': return TaskStatus.IN_PROGRESS;
      case 'DONE': return TaskStatus.DONE;
      case 'CLOSED': return TaskStatus.CLOSED;
      default: return TaskStatus.TODO;
    }
  }

  /**
   * Convert string to TaskPriority enum (for backend integration)
   */
  static stringToTaskPriority(priorityString: string): TaskPriority {
    switch (priorityString.toUpperCase()) {
      case 'HIGH': return TaskPriority.HIGH;
      case 'MEDIUM': return TaskPriority.MEDIUM;
      case 'LOW': return TaskPriority.LOW;
      default: return TaskPriority.MEDIUM;
    }
  }
}

// Dropdown interfaces
export interface AssigneeMetadata {
  departmentId: string;
}

export interface DropdownOption<T = any> {
  id: string | number | null;
  name: string;
  displayName?: string;
  badgeClass?: string;
  metadata?: T; // Generic metadata for additional dropdown data
}

export interface DropdownConfig {
  type: string;
  isSearchable: boolean;
  placeholder: string;
  isDisabled?: boolean;
}

// Timeline Interfaces
export interface TaskColumnItem {
  id: string;
  code: string;
  description: string;
  departmentId: string;
}

export interface TaskBarItem {
  id: string;
  code: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  departmentId: string;
  startDate: string;
  endDate: string;
}

export interface SprintTimelineData {
  startDate: string;
  endDate: string;
  holidays: string[];
  taskColumn: TaskColumnItem[];
  taskBars: TaskBarItem[];
}

export interface TimelineDate {
  date: string;
  dayOfWeek: number;
  dayName: string;
  isHoliday: boolean;
  month: string;
  monthIndex: number;
}

// Department Tasks Interfaces
export interface DepartmentTask {
  taskId: string;
  taskCode: string;
  description: string;
  assigneeName: string;
  priority: TaskPriority;
  storyPoints: number;
  daysSpent: number;
}

export interface DepartmentTasksResponse {
  departmentId: string;
  departmentName: string;
  totalStoryPoints: number;
  totalTeamCapacityLeft: number;
  tasks: DepartmentTask[];
}

// Assignee Tasks Interfaces
export interface AssigneeTask {
  taskId: string;
  taskCode: string;
  taskDependency: string | null; // null becomes "None"
  taskDescription: string;
  priority: TaskPriority;
  status: TaskStatus;
  storyPoints: number;
  daysSpent: number;
  order: number;
  departmentName?: string;
}

export interface AssigneeTasksResponse {
  assigneeId: string;
  assigneeName: string;
  totalCapacity: number;
  totalCapacityLeft: number;
  tasks: AssigneeTask[];
}

// UI paginated response for assignee tasks endpoint
export interface AssigneeTasksPage {
  tasks: AssigneeTask[];
  nextCursor: string | null;
}

// Task Order Update Interface
export interface TaskOrderUpdate {
  taskId: string;
  taskOrder: number;
}

// Assignee Registration
export interface AssigneeRegistrationRequest {
  email: string;
  password: string;
  assigneeCode: string;
  projectKey: string;
}

export type AssigneeRegistrationResponse = Record<string, unknown>;

// Assignee Timeline Interfaces
export interface AssigneeTimelineTask {
  id: string;
  code: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string;
  departmentId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface AssigneeTimelineResponse {
  sprintId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  holidays: string[];
  tasks: AssigneeTimelineTask[];
}

