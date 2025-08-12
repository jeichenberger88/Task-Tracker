// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';
import { PwaInstallComponent } from './components/pwa-install/pwa-install.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, PwaInstallComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Task Tracker';
  newTaskTitle = '';
  editingTaskId: string | null = null;
  editingTitle = '';
  isDarkMode = false;

  constructor(public taskService: TaskService) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('darkMode');
    this.isDarkMode = savedTheme === 'true';
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  addTask(): void {
    if (this.newTaskTitle.trim()) {
      this.taskService.addTask(this.newTaskTitle);
      this.newTaskTitle = '';
    }
  }

  startEditing(task: any): void {
    this.editingTaskId = task.id;
    this.editingTitle = task.title;
  }

  saveEdit(): void {
    if (this.editingTaskId && this.editingTitle.trim()) {
      this.taskService.updateTask(this.editingTaskId, this.editingTitle);
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editingTitle = '';
  }

  onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  deleteTask(taskId: string): void {
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  getEmptyStateTitle(): string {
    const filter = this.taskService.filterSignal();
    switch (filter) {
      case 'active': return 'All caught up! 🎉';
      case 'completed': return 'No completed tasks yet';
      default: return 'Ready to be productive?';
    }
  }

  getEmptyStateMessage(): string {
    const filter = this.taskService.filterSignal();
    switch (filter) {
      case 'active': return 'You\'ve completed all your active tasks!';
      case 'completed': return 'Complete some tasks to see them here.';
      default: return 'Add your first task above to get started on your journey.';
    }
  }
}