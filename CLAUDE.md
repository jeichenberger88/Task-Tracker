# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Task Tracker Pro** is an enhanced Angular 20 Progressive Web App (PWA) with advanced task management features including:
- ✅ Due dates with notifications
- 🔍 Advanced search and filtering  
- 🏷️ Categories and tags system
- 📱 Drag & drop reordering (Angular CDK)
- 📥📤 Data export/import functionality
- 🎨 Priority levels with visual indicators
- 🌓 Dark/light theme support
- 💾 Local storage persistence with migration support

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
- **Angular CDK** for drag & drop functionality
- **TypeScript 5.8** with strict mode enabled
- **SCSS** for advanced styling with dark theme support
- **Service Worker** for PWA functionality via @angular/service-worker
- **Signals** for reactive state management (Angular's new reactivity model)
- **Reactive Forms** for advanced form handling and validation

### Application Structure

#### Services
- **TaskService** (`src/app/services/task.service.ts`): Enhanced core business logic using Angular signals
  - **Extended Task Interface**: id, title, completed, createdAt, dueDate, priority, category, tags, order
  - **Signal-based State**: `tasksSignal`, `filterSignal`, `searchSignal`, `selectedCategorySignal`
  - **Computed Properties**: `filteredTasks`, `taskCounts`, `categories`, `allTags`
  - **Advanced Features**: Search/filter, drag & drop reordering, data export/import
  - **Notifications**: Browser notification support for due/overdue tasks
  - **Data Migration**: Automatic migration from old task format to new enhanced format

#### Components
- **AppComponent**: Main application shell with comprehensive task management
  - **Reactive Forms**: Advanced task creation with due dates, priorities, categories, tags
  - **Search & Filter UI**: Real-time search and category filtering
  - **Data Management**: Import/export functionality with file handling
  - **Theme Management**: Dark/light mode with localStorage persistence
  - **Notification Handling**: Due task notifications with permission management

- **PwaInstallComponent**: Handles PWA installation prompts and events

#### Enhanced State Management
Advanced signal-based architecture:
- **Multi-dimensional Filtering**: Status, search term, category, due date combinations
- **Smart Sorting**: Priority, due date, order, and creation date based sorting
- **Real-time Updates**: All UI updates automatically via computed signals
- **Persistent State**: localStorage with automatic data migration

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

### Enhanced Component Architecture
- **Standalone Components**: All components use standalone: true (no NgModules)
- **Reactive Forms**: Advanced FormBuilder usage with validation for complex forms
- **Signal-based Reactivity**: Comprehensive use of signals, computed, and effects
- **CDK Integration**: Angular CDK for drag & drop with proper event handling
- **Type Safety**: Extensive use of TypeScript interfaces and proper typing

### Advanced Styling System
- **CSS Custom Properties**: Comprehensive theming system with light/dark modes
- **Responsive Design**: Mobile-first approach with proper touch targets
- **Accessibility**: WCAG compliant with proper ARIA labels and focus management
- **Animations**: CSS animations with respect for prefers-reduced-motion
- **Modern CSS**: Flexbox, Grid, backdrop-filter, and advanced selectors

### Data Management Patterns
- **Signal Architecture**: Multi-layered reactive state management
- **Data Migration**: Automatic schema migration for backward compatibility
- **Export/Import**: JSON-based data portability with validation
- **Local Persistence**: Robust localStorage handling with error recovery
- **Search & Filter**: Real-time multi-dimensional filtering system

### User Experience Features
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch Interactions**: Mobile-optimized touch targets and gestures
- **Visual Feedback**: Priority colors, due date indicators, completion states
- **Contextual UI**: Dynamic navigation based on task states and counts

## Deployment

### Vercel Configuration
- Build command: `npm install && ./node_modules/.bin/ng build --configuration=production`
- Output directory: `dist/browser`
- SPA routing configured with catch-all rewrites to `/index.html`

### Build Output
- Production builds to `dist/browser/`
- Service worker enabled in production builds only
- Asset optimization and hashing for cache busting