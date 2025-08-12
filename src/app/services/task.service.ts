// src/app/services/task.service.ts
import { computed, effect, Injectable, signal } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export type FilterType = 'all' | 'active' | 'completed';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Private signal for all tasks
  private tasksSignal = signal<Task[]>([]);
  
  // Public signal for current filter
  filterSignal = signal<FilterType>('all');
  
  // Computed signal for filtered tasks
  filteredTasks = computed(() => {
    const tasks = this.tasksSignal();
    const filter = this.filterSignal();
    
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  });
  
  // Computed signal for task counts
  taskCounts = computed(() => {
    const tasks = this.tasksSignal();
    return {
      total: tasks.length,
      active: tasks.filter(task => !task.completed).length,
      completed: tasks.filter(task => task.completed).length
    };
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
        // Convert date strings back to Date objects
        tasks.forEach(task => {
          task.createdAt = new Date(task.createdAt);
        });
        this.tasksSignal.set(tasks);
      }
    } catch (error) {
      console.warn('Failed to load tasks from localStorage:', error);
    }
  }

  addTask(title: string): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date()
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

  updateTask(id: string, title: string): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, title: title.trim() } : task
      )
    );
  }

  deleteTask(id: string): void {
    this.tasksSignal.update(tasks => 
      tasks.filter(task => task.id !== id)
    );
  }

  setFilter(filter: FilterType): void {
    this.filterSignal.set(filter);
  }
}