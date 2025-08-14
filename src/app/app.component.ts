// src/app/app.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
    // Default to dark mode if no preference is saved
    this.isDarkMode = savedTheme !== null ? savedTheme === 'true' : true;
    this.applyTheme();
    
    // Request notification permissions
    this.taskService.requestNotificationPermission();
    
    // Check for due tasks every hour
    this.notificationInterval = window.setInterval(() => {
      this.taskService.checkDueTasks();
    }, 60 * 60 * 1000);
    
    // Check immediately on load
    setTimeout(() => this.taskService.checkDueTasks(), 1000);
    
    // Update document title with task count
    this.updateDocumentTitle();
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
      this.updateDocumentTitle();
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
      this.updateDocumentTitle();
    }
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editForm.reset();
  }

  deleteTask(taskId: string): void {
    const task = this.taskService.filteredTasks().find(t => t.id === taskId);
    const taskTitle = task ? task.title : 'this task';
    
    if (confirm(`Delete "${taskTitle}"?\n\nThis action cannot be undone.`)) {
      this.taskService.deleteTask(taskId);
      this.updateDocumentTitle();
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

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Ctrl+Enter or Cmd+Enter to add task
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (this.taskForm.valid && document.activeElement?.tagName !== 'BUTTON') {
        this.addTask();
      }
    }
    
    // Delete key to delete selected task (when no input is focused)
    if (event.key === 'Delete' && this.editingTaskId && document.activeElement?.tagName !== 'INPUT') {
      event.preventDefault();
      this.deleteTask(this.editingTaskId);
    }
    
    // Escape key to cancel editing
    if (event.key === 'Escape' && this.editingTaskId) {
      event.preventDefault();
      this.cancelEdit();
    }
    
    // Enter key to save edit when in edit mode
    if (event.key === 'Enter' && this.editingTaskId && document.activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault();
      this.saveEdit();
    }
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

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return this.formatDate(date);
  }

  updateDocumentTitle(): void {
    const counts = this.taskService.taskCounts();
    const pendingCount = counts.active;
    
    if (pendingCount > 0) {
      document.title = `(${pendingCount}) Task Tracker Pro`;
    } else {
      document.title = 'Task Tracker Pro';
    }
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
    const category = this.taskService.selectedCategorySignal();
    
    if (search && category) return `No "${category}" tasks match "${search}"`;
    if (search) return `No tasks match "${search}"`;
    if (category) return `No tasks in "${category}"`;
    
    switch (filter) {
      case 'active': return 'All caught up! 🎉';
      case 'completed': return 'No completed tasks yet 📝';
      case 'overdue': return 'No overdue tasks! 👍';
      case 'today': return 'Nothing due today 📅';
      case 'upcoming': return 'No upcoming deadlines ⏰';
      default: return 'Ready to be productive? 🚀';
    }
  }

  getEmptyStateMessage(): string {
    const filter = this.taskService.filterSignal();
    const search = this.taskService.searchSignal();
    const category = this.taskService.selectedCategorySignal();
    
    if (search || category) {
      return 'Try adjusting your search terms or clearing filters to see more tasks.';
    }
    
    const shortcutInfo = 'Pro tip: Use Ctrl+Enter to quickly add tasks!';
    
    switch (filter) {
      case 'active': 
        return `You've completed all your active tasks! Time to add new ones or take a well-deserved break. ${shortcutInfo}`;
      case 'completed': 
        return `Complete some tasks to see them here. Each completed task is a step towards your goals! 💪`;
      case 'overdue': 
        return `Excellent! You're staying on top of your deadlines. Keep up the great work! 🌟`;
      case 'today': 
        return `Enjoy a lighter day! Use this time to plan ahead or tackle some upcoming tasks. ${shortcutInfo}`;
      case 'upcoming': 
        return `No future deadlines to worry about right now. Perfect time to focus on current priorities! ✨`;
      default: 
        return `Add your first task above to get started on your productive journey. ${shortcutInfo}`;
    }
  }
}