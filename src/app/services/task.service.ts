// src/app/services/task.service.ts
import { computed, effect, Injectable, signal } from '@angular/core';

export type Priority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'active' | 'completed' | 'overdue' | 'today' | 'upcoming';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  category?: string;
  tags: string[];
  order: number;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  dueToday: number;
  upcoming: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Private signal for all tasks
  private tasksSignal = signal<Task[]>([]);
  
  // Public signals for filtering and searching
  filterSignal = signal<FilterType>('all');
  searchSignal = signal<string>('');
  selectedCategorySignal = signal<string>('');
  
  // Computed signal for filtered and searched tasks
  filteredTasks = computed(() => {
    let tasks = [...this.tasksSignal()];
    const filter = this.filterSignal();
    const search = this.searchSignal().toLowerCase();
    const category = this.selectedCategorySignal();
    
    // Apply search filter
    if (search) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(search) ||
        task.tags.some(tag => tag.toLowerCase().includes(search)) ||
        (task.category && task.category.toLowerCase().includes(search))
      );
    }
    
    // Apply category filter
    if (category) {
      tasks = tasks.filter(task => task.category === category);
    }
    
    // Apply status filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (filter) {
      case 'active':
        tasks = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        tasks = tasks.filter(task => task.completed);
        break;
      case 'overdue':
        tasks = tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) < today
        );
        break;
      case 'today':
        tasks = tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) >= today &&
          new Date(task.dueDate) < tomorrow
        );
        break;
      case 'upcoming':
        tasks = tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          new Date(task.dueDate) >= tomorrow
        );
        break;
    }
    
    // Sort by order, then priority, then due date
    return tasks.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });
  
  // Enhanced task statistics
  taskCounts = computed(() => {
    const tasks = this.tasksSignal();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      total: tasks.length,
      active: tasks.filter(task => !task.completed).length,
      completed: tasks.filter(task => task.completed).length,
      overdue: tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < today
      ).length,
      dueToday: tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) >= today &&
        new Date(task.dueDate) < tomorrow
      ).length,
      upcoming: tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) >= tomorrow
      ).length
    };
  });
  
  // Available categories
  categories = computed(() => {
    const tasks = this.tasksSignal();
    const categories = new Set<string>();
    tasks.forEach(task => {
      if (task.category) categories.add(task.category);
    });
    return Array.from(categories).sort();
  });
  
  // Available tags
  allTags = computed(() => {
    const tasks = this.tasksSignal();
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  constructor() {
    this.loadFromStorage();
    
    // Save to localStorage whenever tasks change
    effect(() => {
      const tasks = this.tasksSignal();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('tasks');
      if (stored) {
        const tasks: Task[] = JSON.parse(stored);
        // Convert date strings back to Date objects and ensure all fields exist
        tasks.forEach(task => {
          task.createdAt = new Date(task.createdAt);
          if (task.dueDate) {
            task.dueDate = new Date(task.dueDate);
          }
          // Migrate old tasks to new format
          if (!task.priority) task.priority = 'medium';
          if (!task.tags) task.tags = [];
          if (task.order === undefined) task.order = 0;
        });
        this.tasksSignal.set(tasks);
      }
    } catch (error) {
      console.warn('Failed to load tasks from localStorage:', error);
    }
  }

  addTask(
    title: string, 
    dueDate?: Date, 
    priority: Priority = 'medium', 
    category?: string, 
    tags: string[] = []
  ): void {
    const tasks = this.tasksSignal();
    const maxOrder = Math.max(...tasks.map(t => t.order), -1);
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      dueDate,
      priority,
      category,
      tags,
      order: maxOrder + 1
    };
    
    this.tasksSignal.update(tasks => [...tasks, newTask]);
  }

  toggleTask(id: string): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }

  deleteTask(id: string): void {
    this.tasksSignal.update(tasks => 
      tasks.filter(task => task.id !== id)
    );
  }

  reorderTasks(fromIndex: number, toIndex: number): void {
    this.tasksSignal.update(tasks => {
      const filteredTasks = this.filteredTasks();
      const item = filteredTasks[fromIndex];
      
      // Update the order of affected tasks
      const reorderedTasks = [...tasks];
      const fromTask = reorderedTasks.find(t => t.id === item.id);
      if (!fromTask) return tasks;
      
      const targetTask = filteredTasks[toIndex];
      const targetOrder = reorderedTasks.find(t => t.id === targetTask.id)?.order ?? 0;
      
      fromTask.order = targetOrder;
      
      // Adjust other tasks' orders
      reorderedTasks.forEach(task => {
        if (task.id !== fromTask.id && task.order >= targetOrder) {
          task.order += 1;
        }
      });
      
      return reorderedTasks;
    });
  }

  // Filter and search methods
  setFilter(filter: FilterType): void {
    this.filterSignal.set(filter);
  }

  setSearch(search: string): void {
    this.searchSignal.set(search);
  }

  setSelectedCategory(category: string): void {
    this.selectedCategorySignal.set(category);
  }

  clearFilters(): void {
    this.filterSignal.set('all');
    this.searchSignal.set('');
    this.selectedCategorySignal.set('');
  }

  // Data export/import
  exportTasks(): string {
    const tasks = this.tasksSignal();
    return JSON.stringify(tasks, null, 2);
  }

  importTasks(data: string, format: 'json' | 'csv' | 'txt' = 'json'): { success: boolean; message: string; tasksImported?: number } {
    try {
      let importedTasks: Task[] = [];
      
      switch (format) {
        case 'json':
          importedTasks = this.parseJsonTasks(data);
          break;
        case 'csv':
          importedTasks = this.parseCsvTasks(data);
          break;
        case 'txt':
          importedTasks = this.parseTextTasks(data);
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      if (importedTasks.length === 0) {
        return { success: false, message: 'No valid tasks found in the file.' };
      }
      
      // Add order to imported tasks
      const currentTasks = this.tasksSignal();
      const maxOrder = Math.max(...currentTasks.map(t => t.order), -1);
      
      importedTasks.forEach((task, index) => {
        task.order = maxOrder + 1 + index;
      });
      
      // Append to existing tasks or replace (user choice could be added later)
      const allTasks = [...currentTasks, ...importedTasks];
      this.tasksSignal.set(allTasks);
      
      return { 
        success: true, 
        message: `Successfully imported ${importedTasks.length} task${importedTasks.length > 1 ? 's' : ''}.`,
        tasksImported: importedTasks.length
      };
    } catch (error) {
      console.error('Failed to import tasks:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to import tasks. Please check the file format.'
      };
    }
  }

  private parseJsonTasks(jsonData: string): Task[] {
    const parsed = JSON.parse(jsonData);
    const importedTasks = Array.isArray(parsed) ? parsed : [parsed];
    
    // Validate task structure
    const isValid = importedTasks.every(task => 
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.completed === 'boolean' &&
      task.createdAt
    );
    
    if (!isValid) {
      throw new Error('Invalid JSON task data format');
    }
    
    // Convert dates and ensure all fields
    importedTasks.forEach(task => {
      task.createdAt = new Date(task.createdAt);
      if (task.dueDate) {
        task.dueDate = new Date(task.dueDate);
      }
      if (!task.priority) task.priority = 'medium';
      if (!task.tags) task.tags = [];
      if (task.order === undefined) task.order = 0;
    });
    
    return importedTasks;
  }

  private parseCsvTasks(csvData: string): Task[] {
    const lines = csvData.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const tasks: Task[] = [];
    
    // Expected headers: title, completed, priority, category, tags, dueDate
    const titleIndex = headers.findIndex(h => h.includes('title') || h.includes('task'));
    const completedIndex = headers.findIndex(h => h.includes('completed') || h.includes('done'));
    const priorityIndex = headers.findIndex(h => h.includes('priority'));
    const categoryIndex = headers.findIndex(h => h.includes('category'));
    const tagsIndex = headers.findIndex(h => h.includes('tags'));
    const dueDateIndex = headers.findIndex(h => h.includes('due') || h.includes('date'));
    
    if (titleIndex === -1) {
      throw new Error('CSV must have a "title" column');
    }
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length === 0 || !values[titleIndex]) continue;
      
      const task: Task = {
        id: crypto.randomUUID(),
        title: values[titleIndex].replace(/^"|"$/g, ''), // Remove quotes
        completed: completedIndex !== -1 ? 
          ['true', '1', 'yes', 'completed'].includes(values[completedIndex].toLowerCase()) : false,
        priority: (priorityIndex !== -1 && ['low', 'medium', 'high'].includes(values[priorityIndex].toLowerCase())) ? 
          values[priorityIndex].toLowerCase() as Priority : 'medium',
        category: categoryIndex !== -1 ? values[categoryIndex].replace(/^"|"$/g, '') || undefined : undefined,
        tags: tagsIndex !== -1 ? 
          values[tagsIndex].split(';').map(t => t.trim()).filter(t => t) : [],
        createdAt: new Date(),
        order: 0
      };
      
      // Parse due date
      if (dueDateIndex !== -1 && values[dueDateIndex]) {
        const dueDate = new Date(values[dueDateIndex]);
        if (!isNaN(dueDate.getTime())) {
          task.dueDate = dueDate;
        }
      }
      
      tasks.push(task);
    }
    
    return tasks;
  }

  private parseTextTasks(textData: string): Task[] {
    const lines = textData.trim().split('\n');
    const tasks: Task[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Parse different text formats
      let title = trimmedLine;
      let completed = false;
      let priority: Priority = 'medium';
      
      // Check for completed tasks (starting with [x] or ✓)
      if (trimmedLine.match(/^\[x\]|^✓|^- \[x\]/i)) {
        completed = true;
        title = trimmedLine.replace(/^\[x\]|^✓|^- \[x\]/i, '').trim();
      }
      // Check for incomplete tasks (starting with [ ] or -)
      else if (trimmedLine.match(/^\[ \]|^-|^• /)) {
        title = trimmedLine.replace(/^\[ \]|^-|^• /, '').trim();
      }
      
      // Check for priority indicators (!!! = high, !! = medium, ! = low)
      const priorityMatch = title.match(/(!{1,3})/);
      if (priorityMatch) {
        const exclamations = priorityMatch[1].length;
        priority = exclamations >= 3 ? 'high' : exclamations >= 2 ? 'medium' : 'low';
        title = title.replace(/!{1,3}/, '').trim();
      }
      
      if (title) {
        tasks.push({
          id: crypto.randomUUID(),
          title,
          completed,
          priority,
          category: undefined,
          tags: [],
          createdAt: new Date(),
          order: 0
        });
      }
    }
    
    return tasks;
  }

  // Notification methods
  requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  checkDueTasks(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const today = new Date();
      const overdueTasks = this.tasksSignal().filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < today
      );
      
      const todayTasks = this.tasksSignal().filter(task => {
        if (task.completed || !task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === today.toDateString();
      });

      if (overdueTasks.length > 0) {
        new Notification(`${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`, {
          body: `You have overdue tasks that need attention.`,
          icon: '/icons/icon-192x192.png'
        });
      }

      if (todayTasks.length > 0) {
        new Notification(`${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today`, {
          body: todayTasks.map(t => t.title).join(', '),
          icon: '/icons/icon-192x192.png'
        });
      }
    }
  }

  // Track by function for ngFor
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}