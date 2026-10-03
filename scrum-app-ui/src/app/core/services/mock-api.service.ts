import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LayoutService } from './layout.service';
import { 
  ApiResponse, 
  User, 
  Project, 
  Sprint, 
  SprintListItem,
  SprintListResponse,
  Assignee, 
  Department, 
  DepartmentWithMembers,
  DepartmentWithMembersResponse,
  DepartmentListWithMembersResponse,
  DepartmentMember,
  DepartmentRequest,
  DepartmentMemberRequest,
  TaskRequest,
  TaskResponse,
  ProjectSummary,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TaskStatus,
  TaskPriority,
  DepartmentTasksResponse,
  DepartmentTask,
  AssigneeTasksResponse,
  AssigneeTask,
  TaskOrderUpdate
} from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private layoutService = inject(LayoutService);
  private readonly STORAGE_KEYS = {
    USERS: 'scrum_app_users',
    PROJECTS: 'scrum_app_projects',
    SPRINTS: 'scrum_app_sprints',
    ASSIGNEES: 'scrum_app_assignees',
    DEPARTMENTS: 'scrum_app_departments',
    TASKS: 'scrum_app_tasks',
    CURRENT_USER: 'scrum_app_current_user',
    AUTH_TOKEN: 'scrum_app_auth_token'
  };

  // Signals for reactive state management
  public users = signal<User[]>(this.getFromStorage<User[]>(this.STORAGE_KEYS.USERS, []));
  public projects = signal<Project[]>(this.getFromStorage<Project[]>(this.STORAGE_KEYS.PROJECTS, []));
  public sprints = signal<Sprint[]>(this.getFromStorage<Sprint[]>(this.STORAGE_KEYS.SPRINTS, []));
  public assignees = signal<Assignee[]>(this.getFromStorage<Assignee[]>(this.STORAGE_KEYS.ASSIGNEES, []));
  public departments = signal<Department[]>(this.getFromStorage<Department[]>(this.STORAGE_KEYS.DEPARTMENTS, []));
  public tasks = signal<TaskResponse[]>(this.getFromStorage<TaskResponse[]>(this.STORAGE_KEYS.TASKS, []));

  constructor() {
    this.initializeMockData();
  }

  // Generic storage methods
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Initialize mock data if empty
  private initializeMockData(): void {
    if (this.users().length === 0) {
      this.initializeUsers();
    }
    if (this.projects().length === 0) {
      this.initializeProjects();
    }
    if (this.assignees().length === 0) {
      this.initializeAssignees();
    }
    if (this.departments().length === 0) {
      this.initializeDepartments();
    }
    if (this.sprints().length === 0) {
      this.initializeSprints();
    }
    if (this.tasks().length === 0) {
      this.initializeTasks();
    } else {
      // Migrate existing tasks data if needed
      this.migrateTasksData();
    }
  }

  // Mock data initialization
  private initializeUsers(): void {
    const users: User[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.users.set(users);
    this.saveToStorage(this.STORAGE_KEYS.USERS, users);
  }

  private initializeProjects(): void {
    const projects: Project[] = [
      {
        id: 'ecom',
        name: 'E-commerce Platform',
        code: 'ECOM',
        description: 'A complete overhaul of the existing online store to improve user experience and increase conversion rates.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mbap',
        name: 'Mobile Banking App',
        code: 'MBAP',
        description: 'Developing a new native mobile application for iOS and Android to provide banking services on the go.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.projects.set(projects);
    this.saveToStorage(this.STORAGE_KEYS.PROJECTS, projects);
  }

  private initializeAssignees(): void {
    const assignees: Assignee[] = [
      {
        id: '1',
        code: 'ECOM-AS-001',
        name: 'Alice Johnson',
        projectId: 'ecom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        code: 'ECOM-AS-002',
        name: 'Bob Smith',
        projectId: 'ecom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        code: 'MBAP-AS-001',
        name: 'Charlie Brown',
        projectId: 'mbap',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        code: 'MBAP-AS-002',
        name: 'Diana Prince',
        projectId: 'mbap',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.assignees.set(assignees);
    this.saveToStorage(this.STORAGE_KEYS.ASSIGNEES, assignees);
  }

  private initializeDepartments(): void {
    const departments: Department[] = [
      {
        id: '1',
        code: 'ECOM-DE-001',
        name: 'Frontend',
        projectId: 'ecom'
      },
      {
        id: '2',
        code: 'ECOM-DE-002',
        name: 'Backend',
        projectId: 'ecom'
      },
      {
        id: '3',
        code: 'MBAP-DE-001',
        name: 'Mobile Development',
        projectId: 'mbap'
      },
      {
        id: '4',
        code: 'MBAP-DE-002',
        name: 'Security',
        projectId: 'mbap'
      }
    ];
    this.departments.set(departments);
    this.saveToStorage(this.STORAGE_KEYS.DEPARTMENTS, departments);
    
    // Initialize department members separately
    this.initializeDepartmentMembers();
  }

  private initializeDepartmentMembers(): void {
    const departmentMembers: { [departmentId: string]: DepartmentMember[] } = {
      '1': [
        {
          id: '1',
          departmentId: '1',
          assigneeId: '1',
          assigneeCode: 'ECOM-AS-001',
          assigneeName: 'Alice Johnson',
          isPriority: true
        }
      ],
      '2': [
        {
          id: '2',
          departmentId: '2',
          assigneeId: '2',
          assigneeCode: 'ECOM-AS-002',
          assigneeName: 'Bob Smith',
          isPriority: true
        }
      ],
      '3': [
        {
          id: '3',
          departmentId: '3',
          assigneeId: '3',
          assigneeCode: 'MBAP-AS-001',
          assigneeName: 'Charlie Brown',
          isPriority: true
        }
      ],
      '4': [
        {
          id: '4',
          departmentId: '4',
          assigneeId: '4',
          assigneeCode: 'MBAP-AS-002',
          assigneeName: 'Diana Prince',
          isPriority: true
        }
      ]
    };
    this.saveToStorage('departmentMembers', departmentMembers);
  }

  private initializeSprints(): void {
    const sprints: Sprint[] = [
      {
        id: 'ecom-sprint-1',
        name: 'Sprint 1 - UI Redesign',
        storyPointsPerDay: 8,
        startDate: '2024-01-15',
        endDate: '2024-01-28',
        specificHolidays: ['2024-01-20', '2024-01-21', '2024-01-27', '2024-01-28'], // Including weekends
        projectId: 'ecom',
        totalWorkDays: 10
      },
      {
        id: 'ecom-sprint-2',
        name: 'Sprint 2 - Backend Integration',
        storyPointsPerDay: 6,
        startDate: '2024-01-29',
        endDate: '2024-02-11',
        specificHolidays: ['2024-02-03', '2024-02-04', '2024-02-10', '2024-02-11'], // Including weekends
        projectId: 'ecom',
        totalWorkDays: 12
      },
      {
        id: 'mbap-sprint-1',
        name: 'Sprint 1 - Core Features',
        storyPointsPerDay: 5,
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        specificHolidays: ['2024-02-03', '2024-02-04', '2024-02-10', '2024-02-11'], // Including weekends
        projectId: 'mbap',
        totalWorkDays: 10
      }
    ];
    this.sprints.set(sprints);
    this.saveToStorage(this.STORAGE_KEYS.SPRINTS, sprints);
  }

  private initializeTasks(): void {
    const tasks: TaskResponse[] = [
      {
        id: '1',
        code: 'ECOM-T-01',
        description: 'Setup project structure',
        assigneeId: '1',
        departmentId: '1',
        storyPoints: 5,
        status: TaskStatus.DONE,
        dependencyTaskId: undefined,
        priority: TaskPriority.HIGH,
        taskOrder: 1,
        projectId: 'ecom',
        sprintId: 'ecom-sprint-1',
        assigneeName: undefined,
        departmentName: undefined,
        dependencyTaskCode: undefined,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        code: 'ECOM-T-02',
        description: 'Develop dashboard component',
        assigneeId: '1',
        departmentId: '1',
        storyPoints: 8,
        status: TaskStatus.IN_PROGRESS,
        dependencyTaskId: '1',
        priority: TaskPriority.HIGH,
        taskOrder: 2,
        projectId: 'ecom',
        sprintId: 'ecom-sprint-1',
        assigneeName: undefined,
        departmentName: undefined,
        dependencyTaskCode: undefined,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '3',
        code: 'ECOM-T-03',
        description: 'Implement user authentication',
        assigneeId: '2',
        departmentId: '2',
        storyPoints: 13,
        status: TaskStatus.TODO,
        dependencyTaskId: undefined,
        priority: TaskPriority.HIGH,
        taskOrder: 1,
        projectId: 'ecom',
        sprintId: 'ecom-sprint-2',
        assigneeName: undefined,
        departmentName: undefined,
        dependencyTaskCode: undefined,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '4',
        code: 'MBAP-T-01',
        description: 'Design mobile UI components',
        assigneeId: '3',
        departmentId: '3',
        storyPoints: 8,
        status: TaskStatus.IN_PROGRESS,
        dependencyTaskId: undefined,
        priority: TaskPriority.MEDIUM,
        taskOrder: 1,
        projectId: 'mbap',
        sprintId: 'mbap-sprint-1',
        assigneeName: undefined,
        departmentName: undefined,
        dependencyTaskCode: undefined,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '5',
        code: 'MBAP-T-02',
        description: 'Implement security protocols',
        assigneeId: '4',
        departmentId: '4',
        storyPoints: 21,
        status: TaskStatus.TODO,
        dependencyTaskId: undefined,
        priority: TaskPriority.HIGH,
        taskOrder: 1,
        projectId: 'mbap',
        sprintId: 'mbap-sprint-1',
        assigneeName: undefined,
        departmentName: undefined,
        dependencyTaskCode: undefined,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];
    this.tasks.set(tasks);
    this.saveToStorage(this.STORAGE_KEYS.TASKS, tasks);
  }

  // Migration function to convert old string enum values to new enum values
  private migrateTasksData(): void {
    const currentTasks = this.tasks();
    let needsMigration = false;
    
    const migratedTasks = currentTasks.map(task => {
      const migratedTask = { ...task };
      
      // Migrate status from string to enum
      if (typeof task.status === 'string') {
        needsMigration = true;
        switch (task.status) {
          case 'TODO':
            migratedTask.status = TaskStatus.TODO;
            break;
          case 'IN_PROGRESS':
            migratedTask.status = TaskStatus.IN_PROGRESS;
            break;
          case 'DONE':
            migratedTask.status = TaskStatus.DONE;
            break;
          case 'CLOSED':
            migratedTask.status = TaskStatus.CLOSED;
            break;
          default:
            migratedTask.status = TaskStatus.TODO;
        }
      }
      
      // Migrate priority from string to enum
      if (typeof task.priority === 'string') {
        needsMigration = true;
        switch (task.priority) {
          case 'HIGH':
            migratedTask.priority = TaskPriority.HIGH;
            break;
          case 'MEDIUM':
            migratedTask.priority = TaskPriority.MEDIUM;
            break;
          case 'LOW':
            migratedTask.priority = TaskPriority.LOW;
            break;
          default:
            migratedTask.priority = TaskPriority.MEDIUM;
        }
      }
      
      return migratedTask;
    });
    
    if (needsMigration) {
      console.log('Migrating task data from string enums to enum values...');
      this.tasks.set(migratedTasks);
      this.saveToStorage(this.STORAGE_KEYS.TASKS, migratedTasks);
    }
  }

  // Auth methods
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    const user = this.users().find(u => u.email === credentials.email);
    
    if (user) {
      const token = this.generateMockToken();
      const authResponse: AuthResponse = {
        token,
        refreshToken: this.generateMockToken(),
        user
      };
      
      this.saveToStorage(this.STORAGE_KEYS.AUTH_TOKEN, token);
      this.saveToStorage(this.STORAGE_KEYS.CURRENT_USER, user);
      
      return of({
        success: true,
        message: 'Login successful',
        data: authResponse,
        error: null
      }).pipe(delay(1000));
    }
    
    return of({
      success: false,
      message: 'Invalid credentials',
      data: null,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials'
      }
    }).pipe(delay(1000));
  }

  register(userData: RegisterRequest): Observable<ApiResponse<User>> {
    const existingUser = this.users().find(u => u.email === userData.email);
    
    if (existingUser) {
      return of({
        success: false,
        message: 'User already exists',
        data: null,
        error: {
          code: 'USER_EXISTS',
          message: 'User already exists'
        }
      }).pipe(delay(1000));
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedUsers = [...this.users(), newUser];
    this.users.set(updatedUsers);
    this.saveToStorage(this.STORAGE_KEYS.USERS, updatedUsers);
    
    return of({
      success: true,
      message: 'User created successfully',
      data: newUser,
      error: null
    }).pipe(delay(1000));
  }

  logout(): Observable<ApiResponse<null>> {
    localStorage.removeItem(this.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    
    return of({
      success: true,
      message: 'Logout successful',
      data: null,
      error: null
    }).pipe(delay(500));
  }

  getCurrentUser(): User | null {
    return this.getFromStorage<User | null>(this.STORAGE_KEYS.CURRENT_USER, null);
  }

  getAuthToken(): string | null {
    return this.getFromStorage<string | null>(this.STORAGE_KEYS.AUTH_TOKEN, null);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  private generateMockToken(): string {
    return 'mock-jwt-token-' + Date.now();
  }

  // Generic CRUD methods
  create<T>(key: string, item: T): Observable<ApiResponse<T>> {
    // Implementation for creating items
    return of({
      success: true, error: null,
      message: 'Created successfully',
      data: item
    }).pipe(delay(500));
  }

  update<T>(key: string, id: string, item: T): Observable<ApiResponse<T>> {
    // Implementation for updating items
    return of({
      success: true, error: null,
      message: 'Updated successfully',
      data: item
    }).pipe(delay(500));
  }

  delete(key: string, id: string): Observable<ApiResponse<null>> {
    // Implementation for deleting items
    return of({
      success: true, error: null,
      message: 'Deleted successfully',
      data: null
    }).pipe(delay(500));
  }

  getById<T>(key: string, id: string): Observable<ApiResponse<T>> {
    // Implementation for getting item by ID
    return of({
      success: true, error: null,
      message: 'Retrieved successfully',
      data: null as any
    }).pipe(delay(500));
  }


  // Project-specific methods
  getProjectsApi(): Observable<ApiResponse<Project[]>> {
    return of({
      success: true,
      message: 'Projects retrieved successfully',
      data: this.projects(),
      error: null
    }).pipe(delay(300));
  }

  createProject(projectData: Omit<Project, 'id'>): Observable<ApiResponse<Project>> {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedProjects = [...this.projects(), newProject];
    this.projects.set(updatedProjects);
    this.saveToStorage(this.STORAGE_KEYS.PROJECTS, updatedProjects);

    return of({
      success: true, error: null,
      message: 'Project created successfully',
      data: newProject
    }).pipe(delay(500));
  }

  updateProject(projectData: Project): Observable<ApiResponse<Project>> {
    const updatedProject = {
      ...projectData,
      updatedAt: new Date()
    };

    const updatedProjects = this.projects().map(p => 
      p.id === projectData.id ? updatedProject : p
    );
    this.projects.set(updatedProjects);
    this.saveToStorage(this.STORAGE_KEYS.PROJECTS, updatedProjects);

    return of({
      success: true, error: null,
      message: 'Project updated successfully',
      data: updatedProject
    }).pipe(delay(500));
  }

  deleteProject(projectId: string): Observable<ApiResponse<null>> {
    const updatedProjects = this.projects().filter(p => p.id !== projectId);
    this.projects.set(updatedProjects);
    this.saveToStorage(this.STORAGE_KEYS.PROJECTS, updatedProjects);

    return of({
      success: true, error: null,
      message: 'Project deleted successfully',
      data: null
    }).pipe(delay(500));
  }

  getProjectById(projectId: string): Observable<ApiResponse<Project | null>> {
    const project = this.projects().find(p => p.id === projectId);
    return of({
      success: true,
      message: 'Project retrieved successfully',
      data: project || null,
      error: null
    }).pipe(delay(300));
  }

  getProjectByCode(projectCode: string): Observable<ApiResponse<Project | null>> {
    const project = this.projects().find(p => p.code === projectCode);
    return of({
      success: true,
      message: 'Project retrieved successfully',
      data: project || null,
      error: null
    }).pipe(delay(300));
  }

  // Sprint-specific methods
  getSprintsByProject(projectId: string): Observable<ApiResponse<Sprint[]>> {
    const projectSprints = this.sprints().filter(s => s.projectId === projectId);
    return of({
      success: true, error: null,
      message: 'Sprints retrieved successfully',
      data: projectSprints
    }).pipe(delay(300));
  }

  createSprint(sprintData: Omit<Sprint, 'id'>): Observable<ApiResponse<Sprint>> {
    const newSprint: Sprint = {
      ...sprintData,
      id: `sprint-${Date.now()}`
    };

    const updatedSprints = [...this.sprints(), newSprint];
    this.sprints.set(updatedSprints);
    this.saveToStorage(this.STORAGE_KEYS.SPRINTS, updatedSprints);

    return of({
      success: true, error: null,
      message: 'Sprint created successfully',
      data: newSprint
    }).pipe(delay(500));
  }

  updateSprint(sprintData: Sprint): Observable<ApiResponse<Sprint>> {
    const updatedSprints = this.sprints().map(s => 
      s.id === sprintData.id ? sprintData : s
    );
    this.sprints.set(updatedSprints);
    this.saveToStorage(this.STORAGE_KEYS.SPRINTS, updatedSprints);

    return of({
      success: true, error: null,
      message: 'Sprint updated successfully',
      data: sprintData
    }).pipe(delay(500));
  }

  deleteSprint(sprintId: string): Observable<ApiResponse<null>> {
    const updatedSprints = this.sprints().filter(s => s.id !== sprintId);
    this.sprints.set(updatedSprints);
    this.saveToStorage(this.STORAGE_KEYS.SPRINTS, updatedSprints);

    return of({
      success: true, error: null,
      message: 'Sprint deleted successfully',
      data: null
    }).pipe(delay(500));
  }

  // Get sprint list for dropdown (only id and name)
  getSprintList(projectId: string): Observable<ApiResponse<SprintListResponse>> {
    const projectSprints = this.sprints().filter(s => s.projectId === projectId);
    const sprintList: SprintListItem[] = projectSprints.map(sprint => ({
      id: sprint.id,
      name: sprint.name
    }));

    return of({
      success: true, error: null,
      message: 'Sprint list retrieved successfully',
      data: { sprints: sprintList }
    }).pipe(delay(300));
  }

  // Get full sprint data by ID
  getSprintById(sprintId: string): Observable<ApiResponse<Sprint>> {
    const sprint = this.sprints().find(s => s.id === sprintId);
    
    if (sprint == null) {
      return of({
        success: false, error: { code: "NOT_FOUND", message: "Not found" },
        message: 'Sprint not found',
        data: {} as Sprint
      }).pipe(delay(300));
    }

    return of({
      success: true, error: null,
      message: 'Sprint retrieved successfully',
      data: sprint
    }).pipe(delay(300));
  }

  // Helper method to calculate work days
  calculateWorkDays(startDate: string, endDate: string, specificHolidays: string[]): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workDays = 0;
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (specificHolidays.includes(dateStr) === false) {
        workDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workDays;
  }

  // Project Summary methods
  getProjectSummary(projectId: string): Observable<ApiResponse<ProjectSummary>> {
    // Calculate summary data based on existing data
    const projectTasks = this.tasks().filter(t => t.projectId === projectId);
    const projectSprints = this.sprints().filter(s => s.projectId === projectId);
    const projectDepartments = this.departments().filter(d => d.projectId === projectId);
    const projectAssignees = this.assignees().filter(a => a.projectId === projectId);

    const summary: ProjectSummary = {
      totalTasks: projectTasks.length,
      totalSprints: projectSprints.length,
      totalDepartments: projectDepartments.length,
      totalAssignees: projectAssignees.length
    };

    return of({
      success: true, error: null,
      message: 'Project summary retrieved successfully',
      data: summary
    }).pipe(delay(300));
  }

  // Assignee methods
  getAssigneesByProject(projectId: string): Observable<ApiResponse<Assignee[]>> {
    const projectAssignees = this.assignees().filter(a => a.projectId === projectId);
    return of({
      success: true, error: null,
      message: 'Assignees retrieved successfully',
      data: projectAssignees
    }).pipe(delay(300));
  }

  createAssignee(assigneeData: Omit<Assignee, 'id' | 'code'>): Observable<ApiResponse<Assignee>> {
    const project = this.projects().find(p => p.id === assigneeData.projectId);
    const projectCode = project?.code || 'PROJ';
    
    // Generate code
    const existingAssignees = this.assignees().filter(a => a.projectId === assigneeData.projectId);
    const nextNumber = existingAssignees.length + 1;
    const code = `${projectCode}-AS-${String(nextNumber).padStart(3, '0')}`;

    const newAssignee: Assignee = {
      ...assigneeData,
      id: `assignee-${Date.now()}`,
      code
    };

    const updatedAssignees = [...this.assignees(), newAssignee];
    this.assignees.set(updatedAssignees);
    this.saveToStorage(this.STORAGE_KEYS.ASSIGNEES, updatedAssignees);

    return of({
      success: true, error: null,
      message: 'Assignee created successfully',
      data: newAssignee
    }).pipe(delay(500));
  }

  updateAssignee(assigneeData: Assignee): Observable<ApiResponse<Assignee>> {
    const updatedAssignees = this.assignees().map(a => 
      a.id === assigneeData.id ? assigneeData : a
    );
    this.assignees.set(updatedAssignees);
    this.saveToStorage(this.STORAGE_KEYS.ASSIGNEES, updatedAssignees);

    return of({
      success: true, error: null,
      message: 'Assignee updated successfully',
      data: assigneeData
    }).pipe(delay(500));
  }

  deleteAssignee(assigneeId: string): Observable<ApiResponse<null>> {
    const updatedAssignees = this.assignees().filter(a => a.id !== assigneeId);
    this.assignees.set(updatedAssignees);
    this.saveToStorage(this.STORAGE_KEYS.ASSIGNEES, updatedAssignees);

    return of({
      success: true, error: null,
      message: 'Assignee deleted successfully',
      data: null
    }).pipe(delay(500));
  }

  // Department methods
  getDepartmentsByProject(projectId: string): Observable<ApiResponse<DepartmentListWithMembersResponse>> {
    const projectDepartments = this.departments().filter(d => d.projectId === projectId);
    
    const departmentsWithMembers = projectDepartments.map(dept => {
      const members = this.getDepartmentMembers(dept.id);
      const memberDetails = members
        .map(member => {
          const assignee = this.assignees().find(a => a.id === member.assigneeId);
          return {
            id: member.id,
            departmentId: member.departmentId,
            assigneeId: member.assigneeId,
            assigneeCode: member.assigneeCode,
            assigneeName: member.assigneeName,
            isPriority: member.isPriority
          };
        });
      
      return {
        ...dept,
        memberCount: memberDetails.length,
        members: memberDetails
      };
    });
    
    return of({
      success: true, error: null,
      message: 'Departments with members retrieved successfully',
      data: {
        departments: departmentsWithMembers,
        totalCount: departmentsWithMembers.length
      }
    }).pipe(delay(300));
  }

  createDepartment(departmentData: DepartmentRequest): Observable<ApiResponse<Department>> {
    const project = this.projects().find(p => p.id === departmentData.projectId);
    const projectCode = project?.code || 'PROJ';
    
    // Generate unique department code
    const code = this.generateDepartmentCode(projectCode, departmentData.projectId);

    const newDepartment: Department = {
      id: `department-${Date.now()}`,
      code,
      name: departmentData.name,
      projectId: departmentData.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedDepartments = [...this.departments(), newDepartment];
    this.departments.set(updatedDepartments);
    this.saveToStorage(this.STORAGE_KEYS.DEPARTMENTS, updatedDepartments);

    // Update department members storage
    this.updateDepartmentMembersFromRequest(newDepartment.id, departmentData.members);

    return of({
      success: true, error: null,
      message: 'Department created successfully',
      data: newDepartment
    }).pipe(delay(500));
  }

  updateDepartment(departmentData: DepartmentRequest): Observable<ApiResponse<Department>> {
    const existingDepartment = this.departments().find(d => d.id === departmentData.id);
    if (!existingDepartment) {
      return of({
        success: false, error: { code: 'DEPARTMENT_NOT_FOUND', message: 'Department not found' },
        message: 'Department not found',
        data: null
      }).pipe(delay(500));
    }

    const updatedDepartment: Department = {
      ...existingDepartment,
      name: departmentData.name,
      updatedAt: new Date().toISOString()
    };

    const updatedDepartments = this.departments().map(d => 
      d.id === departmentData.id ? updatedDepartment : d
    );
    this.departments.set(updatedDepartments);
    this.saveToStorage(this.STORAGE_KEYS.DEPARTMENTS, updatedDepartments);

    // Update department members storage
    this.updateDepartmentMembersFromRequest(departmentData.id!, departmentData.members);

    return of({
      success: true, error: null,
      message: 'Department updated successfully',
      data: updatedDepartment
    }).pipe(delay(500));
  }

  deleteDepartment(departmentId: string): Observable<ApiResponse<null>> {
    const updatedDepartments = this.departments().filter(d => d.id !== departmentId);
    this.departments.set(updatedDepartments);
    this.saveToStorage(this.STORAGE_KEYS.DEPARTMENTS, updatedDepartments);

    // Remove department members from storage
    const departmentMembers = this.getFromStorage('departmentMembers', {}) as { [key: string]: DepartmentMember[] };
    delete departmentMembers[departmentId];
    this.saveToStorage('departmentMembers', departmentMembers);

    return of({
      success: true, error: null,
      message: 'Department deleted successfully',
      data: null
    }).pipe(delay(500));
  }


  // Assignee methods for department management
  getAssigneesByDepartment(departmentId: string): Observable<ApiResponse<{ assignees: Assignee[], totalCount: number }>> {
    const departmentMembers = this.getDepartmentMembers(departmentId);
    const memberIds = departmentMembers
      .map(member => member.assigneeId);
    
    const assignees = this.assignees().filter(assignee => 
      memberIds.includes(assignee.id)
    ).map(assignee => {
      // Find the member info to get isPriority
      const member = departmentMembers.find(m => m.assigneeId === assignee.id);
      return {
        ...assignee,
        isPriority: member?.isPriority || false
      };
    });
    
    return of({
      success: true, error: null,
      message: 'Department members retrieved successfully',
      data: {
        assignees,
        totalCount: assignees.length
      }
    }).pipe(delay(300));
  }

  // Helper method to get department members
  private getDepartmentMembers(departmentId: string): DepartmentMember[] {
    const departmentMembers = this.getFromStorage('departmentMembers', {}) as { [key: string]: DepartmentMember[] };
    return departmentMembers[departmentId] || [];
  }

  // Helper method to update department members storage
  private updateDepartmentMembers(departmentId: string, members: DepartmentMember[]): void {
    const departmentMembers = this.getFromStorage('departmentMembers', {}) as { [key: string]: DepartmentMember[] };
    departmentMembers[departmentId] = members;
    this.saveToStorage('departmentMembers', departmentMembers);
  }

  // Helper method to update department members from request
  private updateDepartmentMembersFromRequest(departmentId: string, memberRequests: DepartmentMemberRequest[]): void {
    const departmentMembers = this.getFromStorage('departmentMembers', {}) as { [key: string]: DepartmentMember[] };
    
    // Convert request members to DepartmentMember format
    const members: DepartmentMember[] = memberRequests
      .filter(member => !member.markForDelete) // Only include non-deleted members
      .map(member => {
        const assignee = this.assignees().find(a => a.id === member.assigneeId);
        return {
          id: member.id || `member-${Date.now()}-${Math.random()}`,
          departmentId: departmentId,
          assigneeId: member.assigneeId,
          assigneeCode: assignee?.code || '',
          assigneeName: assignee?.name || '',
          isPriority: member.isPriority,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
    
    departmentMembers[departmentId] = members;
    this.saveToStorage('departmentMembers', departmentMembers);
  }

  // Helper method to generate unique department code
  private generateDepartmentCode(projectCode: string, projectId: string): string {
    const existingDepartments = this.departments().filter(d => d.projectId === projectId);
    const nextNumber = existingDepartments.length + 1;
    return `${projectCode}-DE-${String(nextNumber).padStart(3, '0')}`;
  }

  // Get single department by ID for modal
  getDepartmentById(departmentId: string): Observable<ApiResponse<Department>> {
    const department = this.departments().find(d => d.id === departmentId);
    if (department == null) {
      return of({
        success: false, error: { code: "NOT_FOUND", message: "Not found" },
        message: 'Department not found',
        data: null as any
      }).pipe(delay(300));
    }

    return of({
      success: true, error: null,
      message: 'Department retrieved successfully',
      data: department
    }).pipe(delay(300));
  }

  // Task-related methods
  getTasksBySprint(sprintId: string): Observable<ApiResponse<TaskResponse[]>> {
    const sprintTasks = this.tasks().filter(t => t.sprintId === sprintId);

    return of({
      success: true, error: null,
      message: 'Tasks retrieved successfully',
      data: sprintTasks
    }).pipe(delay(300));
  }

  createTask(taskData: TaskRequest): Observable<ApiResponse<TaskResponse>> {
    // Generate task code
    const projectCode = this.getCurrentProjectCode();
    const taskCode = this.generateTaskCode(projectCode, taskData.sprintId);
    
    const newTask: TaskResponse = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: taskCode,
      description: taskData.description,
      storyPoints: taskData.storyPoints,
      status: taskData.status,
      priority: taskData.priority,
      sprintId: taskData.sprintId,
      assigneeId: taskData.assigneeId,
      departmentId: taskData.departmentId,
      dependencyTaskId: taskData.dependencyTaskId,
      taskOrder: 0,
      projectId: 'ecom', // Mock project ID
      assigneeName: undefined,
      departmentName: undefined,
      dependencyTaskCode: undefined,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentTasks = this.tasks();
    this.tasks.set([...currentTasks, newTask]);
    this.saveToStorage('tasks', this.tasks());

    return of({
      success: true, error: null,
      message: 'Task created successfully',
      data: newTask
    }).pipe(delay(300));
  }

  updateTask(taskId: string, taskData: TaskRequest): Observable<ApiResponse<TaskResponse>> {
    const currentTasks = this.tasks();
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return of({
        success: false, error: { code: "NOT_FOUND", message: "Not found" },
        message: 'Task not found',
        data: {} as TaskResponse
      }).pipe(delay(300));
    }

    const existingTask = currentTasks[taskIndex];
    const updatedTask: TaskResponse = {
      ...existingTask,
      description: taskData.description,
      storyPoints: taskData.storyPoints,
      status: taskData.status,
      priority: taskData.priority,
      sprintId: taskData.sprintId,
      assigneeId: taskData.assigneeId,
      departmentId: taskData.departmentId,
      dependencyTaskId: taskData.dependencyTaskId,
      updatedAt: new Date().toISOString()
    };

    const updatedTasks = [...currentTasks];
    updatedTasks[taskIndex] = updatedTask;
    this.tasks.set(updatedTasks);
    this.saveToStorage('tasks', this.tasks());

    return of({
      success: true, error: null,
      message: 'Task updated successfully',
      data: updatedTask
    }).pipe(delay(300));
  }

  deleteTask(taskId: string): Observable<ApiResponse<null>> {
    const currentTasks = this.tasks();
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return of({
        success: false, error: { code: "NOT_FOUND", message: "Not found" },
        message: 'Task not found',
        data: null
      }).pipe(delay(300));
    }

    const updatedTasks = currentTasks.filter(t => t.id !== taskId);
    this.tasks.set(updatedTasks);
    this.saveToStorage('tasks', this.tasks());

    return of({
      success: true, error: null,
      message: 'Task deleted successfully',
      data: null
    }).pipe(delay(300));
  }

  private getCurrentProjectCode(): string {
    // Get current project ID from localStorage (same as other methods)
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId == null) return 'PROJ';
    
    const projects = this.projects();
    const project = projects.find(p => p.id === currentProjectId);
    return project?.code || 'PROJ';
  }

  private generateTaskCode(projectCode: string, sprintId: string): string {
    const currentTasks = this.tasks();
    const sprintTasks = currentTasks.filter(task => task.sprintId === sprintId);
    const nextNumber = sprintTasks.length + 1;
    return `${projectCode}-T-${String(nextNumber).padStart(2, '0')}`;
  }

  /**
   * Get department tasks with summary data
   */
  getDepartmentTasks(departmentId: string, sprintId: string): Observable<ApiResponse<DepartmentTasksResponse>> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          const departments = this.departments();
          const tasks = this.tasks();
          const assignees = this.assignees();
          const sprints = this.sprints();
          const currentProjectId = this.layoutService.currentProjectId();

          // Find the department
          const department = departments.find(d => d.id === departmentId && d.projectId === currentProjectId);
          if (department == null) {
            observer.error(new Error('Department not found'));
            return;
          }

          // Get tasks for this department and sprint
          const departmentTasks = tasks.filter(task => 
            task.departmentId === departmentId && 
            task.sprintId === sprintId &&
            task.projectId === currentProjectId
          );

          // Get assignees in this department
          // Note: Since we removed departmentId from Assignee, we'll get all assignees for now
          // In a real implementation, this would need to be handled differently
          const departmentAssignees = assignees.filter(assignee => 
            assignee.projectId === currentProjectId
          );

          // Get sprint info for capacity calculation
          const sprint = sprints.find(s => s.id === sprintId && s.projectId === currentProjectId);
          if (sprint == null) {
            observer.error(new Error('Sprint not found'));
            return;
          }
          const storyPointsPerDay = sprint.storyPointsPerDay;
          const totalWorkDays = sprint.totalWorkDays || 26;

          // Calculate total story points
          const totalStoryPoints = departmentTasks.reduce((sum, task) => sum + task.storyPoints, 0);

          // Calculate total team capacity
          const totalCapacityBase = totalWorkDays * storyPointsPerDay * departmentAssignees.length;
          
          // Calculate external task load (tasks assigned to department members but in other departments)
          const assigneeIds = departmentAssignees.map(a => a.id);
          const externalTasksLoad = tasks
            .filter(task => 
              task.departmentId !== departmentId && 
              task.sprintId === sprintId &&
              task.assigneeId && assigneeIds.includes(task.assigneeId) &&
              task.projectId === currentProjectId
            )
            .reduce((sum, task) => sum + task.storyPoints, 0);

          const totalTeamCapacity = totalCapacityBase - externalTasksLoad;

          // Transform tasks to DepartmentTask format
          const transformedTasks: DepartmentTask[] = departmentTasks.map(task => {
            const assignee = assignees.find(a => a.id === task.assigneeId);
            const daysSpent = task.storyPoints / storyPointsPerDay;

            return {
              taskId: task.id,
              taskCode: task.code,
              description: task.description,
              assigneeName: assignee?.name || 'Unassigned',
              priority: task.priority,
              storyPoints: task.storyPoints,
              daysSpent: Math.round(daysSpent * 10) / 10 // Round to 1 decimal place
            };
          });

          const response: DepartmentTasksResponse = {
            departmentId: department.id,
            departmentName: department.name,
            totalStoryPoints,
            totalTeamCapacityLeft: totalTeamCapacity,
            tasks: transformedTasks
          };

          observer.next({
            success: true,
            message: 'Department tasks retrieved successfully',
            data: response,
            error: null
          });
          observer.complete();

        } catch (error) {
          observer.error(error);
        }
      }, 500); // Simulate API delay
    });
  }

  /**
   * Get assignee tasks with summary data
   */
  getAssigneeTasks(assigneeId: string, sprintId: string): Observable<ApiResponse<AssigneeTasksResponse>> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          const assignees = this.assignees();
          const tasks = this.tasks();
          const sprints = this.sprints();
          const currentProjectId = this.layoutService.currentProjectId();

          // Find the assignee
          const assignee = assignees.find(a => a.id === assigneeId && a.projectId === currentProjectId);
          if (assignee == null) {
            observer.error(new Error('Assignee not found'));
            return;
          }

          // Get sprint info for capacity calculation
          const sprint = sprints.find(s => s.id === sprintId && s.projectId === currentProjectId);
          if (sprint == null) {
            observer.error(new Error('Sprint not found'));
            return;
          }

          // Get tasks for this assignee (exclude closed tasks)
          const assigneeTasks = tasks.filter(task => 
            task.assigneeId === assigneeId && 
            task.sprintId === sprintId &&
            task.projectId === currentProjectId &&
            task.status !== TaskStatus.CLOSED
          );

          // Calculate total capacity
          const totalCapacity = (sprint.totalWorkDays || 26) * sprint.storyPointsPerDay;
          
          // Calculate total capacity left
          const totalAssignedStoryPoints = assigneeTasks.reduce((sum, task) => sum + task.storyPoints, 0);
          const totalCapacityLeft = totalCapacity - totalAssignedStoryPoints;

          // Transform tasks to AssigneeTask format
          const transformedTasks: AssigneeTask[] = assigneeTasks.map(task => {
            const dependencyTask = task.dependencyTaskId ? tasks.find(t => t.id === task.dependencyTaskId) : null;
            const daysSpent = task.storyPoints / sprint.storyPointsPerDay;

            return {
              taskId: task.id,
              taskCode: task.code,
              taskDependency: dependencyTask ? dependencyTask.code : null,
              taskDescription: task.description,
              priority: task.priority,
              status: task.status,
              storyPoints: task.storyPoints,
              daysSpent: Math.round(daysSpent * 10) / 10, // Round to 1 decimal place
              order: task.taskOrder
            };
          });

          // Sort by order
          transformedTasks.sort((a, b) => a.order - b.order);

          const response: AssigneeTasksResponse = {
            assigneeId: assignee.id,
            assigneeName: assignee.name,
            totalCapacity,
            totalCapacityLeft,
            tasks: transformedTasks
          };

          observer.next({
            success: true,
            message: 'Assignee tasks retrieved successfully',
            data: response,
            error: null
          });
          observer.complete();

        } catch (error) {
          observer.error(error);
        }
      }, 500); // Simulate API delay
    });
  }

  /**
   * Update task order for drag and drop reordering
   */
  updateTaskOrder(orderData: TaskOrderUpdate[]): Observable<ApiResponse<null>> {
    return new Observable(observer => {
      setTimeout(() => {
        try {
          const currentTasks = this.tasks();
          
          // Update task orders
          orderData.forEach(orderUpdate => {
            const taskIndex = currentTasks.findIndex(task => task.id === orderUpdate.taskId);
            if (taskIndex !== -1) {
              currentTasks[taskIndex] = { ...currentTasks[taskIndex], taskOrder: orderUpdate.taskOrder };
            }
          });

          // Update the tasks signal
          this.tasks.set([...currentTasks]);

          observer.next({
            success: true,
            message: 'Task order updated successfully',
            data: null,
            error: null
          });
          observer.complete();

        } catch (error) {
          observer.error(error);
        }
      }, 300); // Simulate API delay
    });
  }
}
