// src/app/components/task-list/task-list.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Task, TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  editingTaskId: string | null = null;
  editControl = new FormControl('');

  constructor(public taskService: TaskService) {}

  startEditing(task: Task): void {
    this.editingTaskId = task.id;
    this.editControl.setValue(task.title);
  }

  cancelEditing(): void {
    this.editingTaskId = null;
    this.editControl.setValue('');
  }

  saveEdit(): void {
    if (this.editingTaskId && this.editControl.value?.trim()) {
      this.taskService.updateTask(this.editingTaskId, this.editControl.value.trim());
      this.cancelEditing();
    }
  }

  onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEditing();
    }
  }

  toggleTask(task: Task): void {
    this.taskService.toggleTask(task.id);
  }

  deleteTask(task: Task): void {
    if (confirm(`Delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id);
    }
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}