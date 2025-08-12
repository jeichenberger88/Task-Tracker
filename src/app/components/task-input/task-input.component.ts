// src/app/components/task-input/task-input.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-input.component.html',
  styleUrl: './task-input.component.scss'
})
export class TaskInputComponent {
  taskControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(200)
  ]);

  constructor(private taskService: TaskService) {}

  onSubmit(): void {
    if (this.taskControl.valid && this.taskControl.value?.trim()) {
      this.taskService.addTask(this.taskControl.value.trim());
      this.taskControl.reset();
    }
  }

  get isInvalid(): boolean {
    return this.taskControl.invalid && (this.taskControl.dirty || this.taskControl.touched);
  }
}