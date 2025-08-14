# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20 Progressive Web App (PWA) task tracker that allows users to manage tasks with local storage persistence. The application uses standalone components, Angular signals for reactive state management, and includes PWA installation capabilities.

## Development Commands

### Essential Commands
- `npm start` - Start development server (ng serve)
- `npm run build` - Production build (ng build --configuration=production)
- `npm run watch` - Development build with watch mode
- `npm test` - Run unit tests with Karma

### Angular CLI Commands
- `npx ng generate component <name>` - Generate new component
- `npx ng generate service <name>` - Generate new service
- `npx ng build --configuration development` - Development build
- `npx ng serve --port 4200` - Serve on specific port

## Architecture

### Core Technologies
- **Angular 20** with standalone components architecture
- **TypeScript 5.8** with strict mode enabled
- **SCSS** for styling with dark theme support
- **Service Worker** for PWA functionality via @angular/service-worker
- **Signals** for reactive state management (Angular's new reactivity model)

### Application Structure

#### Services
- **TaskService** (`src/app/services/task.service.ts`): Core business logic using Angular signals
  - Uses `signal()` for reactive state management
  - `computed()` signals for derived state (filtered tasks, counts)
  - `effect()` for localStorage persistence
  - Manages Task interface with id, title, completed, createdAt properties

#### Components
- **AppComponent**: Main application shell with theme management
- **TaskListComponent**: Displays filtered tasks with edit/delete functionality
- **TaskInputComponent**: Form-based task creation with validation
- **PwaInstallComponent**: Handles PWA installation prompts and events

#### State Management Pattern
The app uses Angular signals exclusively for state management:
- Private `tasksSignal` for all tasks data
- Public `filterSignal` for current filter state
- Computed signals for derived state (filtered tasks, counts)
- Effects for side effects (localStorage persistence)

### PWA Configuration
- **Service Worker**: Configured via `ngsw-config.json` with app shell and lazy asset caching
- **Manifest**: `public/manifest.webmanifest` with comprehensive icon sizes
- **Installation**: Custom install component with beforeinstallprompt handling

### Routing
Simple route-based filtering system:
- `/tasks` - All tasks (default)
- `/active` - Active tasks only  
- `/completed` - Completed tasks only
- All routes lazy-load the same TaskListComponent

### Data Persistence
- **LocalStorage**: Automatic persistence via effect in TaskService
- **Date Handling**: Proper serialization/deserialization of Date objects
- **Error Handling**: Graceful fallback for localStorage failures

## Key Development Patterns

### Component Architecture
- All components use standalone: true (no NgModules)
- Reactive Forms with FormControl for user input
- Signal-based reactivity throughout the application

### Styling Approach
- Global SCSS with CSS custom properties for theming
- Dark mode implementation via body class toggle
- Component-scoped SCSS files

### Type Safety
- Strict TypeScript configuration with comprehensive compiler options
- Defined interfaces for all data structures (Task, FilterType)
- Proper typing for all component properties and methods

## Deployment

### Vercel Configuration
- Build command: `npm install && ./node_modules/.bin/ng build --configuration=production`
- Output directory: `dist/browser`
- SPA routing configured with catch-all rewrites to `/index.html`

### Build Output
- Production builds to `dist/browser/`
- Service worker enabled in production builds only
- Asset optimization and hashing for cache busting