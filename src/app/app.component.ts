// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService, Task, Priority, FilterType } from './services/task.service';
import { PwaInstallComponent } from './components/pwa-install/pwa-install.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule, PwaInstallComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Task Tracker Pro';
  
  // Form for adding new tasks
  taskForm: FormGroup;
  
  // Editing state
  editingTaskId: string | null = null;
  editForm: FormGroup;
  
  // UI state
  isDarkMode = false;
  showAdvancedForm = false;
  showImportExport = false;
  
  // Notification check interval
  private notificationInterval?: number;

  constructor(
    public taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      dueDate: [''],
      priority: ['medium'],
      category: [''],
      tags: ['']
    });

    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      dueDate: [''],
      priority: ['medium'],
      category: [''],
      tags: ['']
    });
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('darkMode');
    this.isDarkMode = savedTheme === 'true';
    this.applyTheme();
    
    // Request notification permissions
    this.taskService.requestNotificationPermission();
    
    // Check for due tasks every hour
    this.notificationInterval = window.setInterval(() => {
      this.taskService.checkDueTasks();
    }, 60 * 60 * 1000);
    
    // Check immediately on load
    setTimeout(() => this.taskService.checkDueTasks(), 1000);
  }

  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
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

  // Task creation
  addTask(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const tags = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
      
      this.taskService.addTask(
        formValue.title,
        formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        formValue.priority,
        formValue.category || undefined,
        tags
      );
      
      this.taskForm.reset({
        title: '',
        dueDate: '',
        priority: 'medium',
        category: '',
        tags: ''
      });
      
      this.showAdvancedForm = false;
    }
  }

  toggleAdvancedForm(): void {
    this.showAdvancedForm = !this.showAdvancedForm;
  }

  // Task editing
  startEditing(task: Task): void {
    this.editingTaskId = task.id;
    this.editForm.patchValue({
      title: task.title,
      dueDate: task.dueDate ? this.formatDateForInput(task.dueDate) : '',
      priority: task.priority,
      category: task.category || '',
      tags: task.tags.join(', ')
    });
  }

  saveEdit(): void {
    if (this.editingTaskId && this.editForm.valid) {
      const formValue = this.editForm.value;
      const tags = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
      
      this.taskService.updateTask(this.editingTaskId, {
        title: formValue.title,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        priority: formValue.priority,
        category: formValue.category || undefined,
        tags
      });
      
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editForm.reset();
  }

  deleteTask(taskId: string): void {
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  // Drag and drop
  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.taskService.reorderTasks(event.previousIndex, event.currentIndex);
    }
  }

  // Filtering and search
  onSearchChange(search: string): void {
    this.taskService.setSearch(search);
  }

  onCategoryChange(category: string): void {
    this.taskService.setSelectedCategory(category);
  }

  clearFilters(): void {
    this.taskService.clearFilters();
  }

  // Data export/import
  exportTasks(): void {
    const data = this.taskService.exportTasks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (this.taskService.importTasks(content)) {
          alert('Tasks imported successfully!');
        } else {
          alert('Failed to import tasks. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  toggleImportExport(): void {
    this.showImportExport = !this.showImportExport;
  }

  // Utility methods
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  }

  getPriorityColor(priority: Priority): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  getPriorityIcon(priority: Priority): string {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }

  isDueToday(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  }

  getEmptyStateTitle(): string {
    const filter = this.taskService.filterSignal();
    const search = this.taskService.searchSignal();
    
    if (search) return 'No matching tasks found';
    
    switch (filter) {
      case 'active': return 'All caught up! 🎉';
      case 'completed': return 'No completed tasks yet';
      case 'overdue': return 'No overdue tasks! 👍';
      case 'today': return 'Nothing due today';
      case 'upcoming': return 'No upcoming tasks';
      default: return 'Ready to be productive?';
    }
  }

  getEmptyStateMessage(): string {
    const filter = this.taskService.filterSignal();
    const search = this.taskService.searchSignal();
    
    if (search) return 'Try adjusting your search terms or clearing filters.';
    
    switch (filter) {
      case 'active': return 'You\'ve completed all your active tasks!';
      case 'completed': return 'Complete some tasks to see them here.';
      case 'overdue': return 'Great job staying on top of your deadlines!';
      case 'today': return 'Enjoy a lighter day or plan ahead for tomorrow.';
      case 'upcoming': return 'No future deadlines to worry about right now.';
      default: return 'Add your first task above to get started on your journey.';
    }
  }
}