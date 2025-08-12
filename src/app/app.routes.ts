// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    title: 'All Tasks'
  },
  {
    path: 'active',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    title: 'Active Tasks'
  },
  {
    path: 'completed',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    title: 'Completed Tasks'
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];