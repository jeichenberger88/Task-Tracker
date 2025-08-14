# Task Tracker Pro 🚀

A modern, feature-rich Progressive Web App (PWA) for task management built with Angular 20. Manage your tasks with style, efficiency, and powerful features.

![Task Tracker Pro](https://img.shields.io/badge/Angular-20-red?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### 🎯 **Core Task Management**
- ✅ Create, edit, and delete tasks
- 🏷️ Categories and tags system
- 🎨 Priority levels (High, Medium, Low) with visual indicators
- 📅 Due dates with smart notifications
- ✔️ Mark tasks as complete/incomplete
- 🔄 Drag & drop reordering

### 🔍 **Advanced Filtering & Search**
- 🔎 Real-time search across titles, tags, and categories
- 📊 Smart filtering by status (All, Active, Completed, Overdue, Today, Upcoming)
- 🗂️ Category-based filtering
- 🏷️ Clickable tags for quick search

### 🎨 **User Experience**
- 🌓 Dark/Light theme with system preference detection (defaults to dark)
- 📱 Fully responsive design
- ⌨️ Keyboard shortcuts (Ctrl+Enter to add, Delete to remove, Escape to cancel)
- 🎭 Engaging empty states with helpful tips
- ⏰ Relative time display ("2h ago", "Just now")
- 📊 Live task count in browser tab title

### 💾 **Data Management**
- 🏠 Local storage persistence
- 📥 Import tasks from JSON
- 📤 Export tasks to JSON
- 🔄 Automatic data migration for updates
- 🛡️ Robust error handling

### 📱 **Progressive Web App**
- 📲 Installable on desktop and mobile
- 🔔 Browser notifications for due/overdue tasks
- 🚀 Service worker for offline capability
- 📊 App-like experience

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🎮 Usage

### Creating Tasks
- **Quick Add**: Type in the input field and press Enter or click "Add"
- **Advanced Mode**: Click the "+" button next to the input for due dates, priorities, categories, and tags
- **Keyboard Shortcut**: Use `Ctrl+Enter` (or `Cmd+Enter` on Mac) to quickly add tasks

### Managing Tasks
- **Edit**: Double-click a task or click the edit button (✏️)
- **Complete**: Click the checkbox to mark as complete/incomplete
- **Delete**: Click the delete button (🗑️) or use Delete key when editing
- **Reorder**: Drag and drop tasks to reorder them

### Keyboard Shortcuts
- `Ctrl+Enter` / `Cmd+Enter` - Add new task
- `Delete` - Delete selected task (when editing)
- `Escape` - Cancel editing
- `Enter` - Save edits

### Filtering & Search
- Use the search bar to find tasks by title, category, or tags
- Click filter buttons to show specific task states
- Click tags to search for similar tasks
- Use category dropdown to filter by specific categories

### Themes
- Toggle between light and dark themes using the theme button
- The app defaults to dark mode
- Your preference is saved automatically

## 🏗️ Architecture

### Technologies Used
- **Angular 20** - Modern framework with standalone components
- **TypeScript 5.8** - Type-safe development
- **Angular CDK** - Drag & drop functionality
- **SCSS** - Advanced styling with CSS custom properties
- **Angular Service Worker** - PWA capabilities
- **Reactive Forms** - Form handling and validation

### Key Patterns
- **Signal-based State Management** - Reactive state with Angular signals
- **Standalone Components** - No NgModules required
- **Progressive Enhancement** - Works without JavaScript
- **Mobile-first Design** - Responsive and touch-friendly

### Project Structure
```
src/
├── app/
│   ├── components/
│   │   └── pwa-install/          # PWA installation component
│   ├── services/
│   │   └── task.service.ts       # Core business logic
│   ├── app.component.ts          # Main application component
│   ├── app.component.html        # Main template
│   ├── app.component.scss        # Main styles
│   └── app.config.ts            # App configuration
├── styles.scss                  # Global styles
└── main.ts                      # Application bootstrap
```

## 🎨 Customization

### Themes
The app uses CSS custom properties for theming. You can customize colors by modifying the CSS variables in `app.component.scss`:

```scss
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  // ... more variables
}
```

### Adding New Features
The app is built with extensibility in mind:

1. **New Task Properties**: Extend the `Task` interface in `task.service.ts`
2. **New Filters**: Add cases to the filtering logic in `filteredTasks` computed signal
3. **New Components**: Create standalone components and import them as needed

## 🚀 Deployment

### Vercel (Recommended)
The project includes Vercel configuration (`vercel.json`):

```bash
npm run build
vercel --prod
```

### Docker
Build and run with Docker:

```bash
docker build -t task-tracker .
docker run -p 80:80 task-tracker
```

### Static Hosting
Build the project and serve the `dist/browser` folder:

```bash
npm run build
# Deploy contents of dist/browser/ to your static host
```

## 📱 PWA Installation

### Desktop
1. Look for the install prompt in supported browsers
2. Click "Install" when prompted
3. Or use the browser's "Install App" option

### Mobile
1. Open in Chrome/Safari
2. Use "Add to Home Screen" option
3. The app will behave like a native app

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Production build
- `npm run watch` - Development build with watch mode
- `npm test` - Run unit tests

### Code Style
The project uses Prettier for code formatting with Angular-specific settings.

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Build Warnings**
- CSS budget exceeded: This is expected due to comprehensive styling
- Can be ignored or budget can be increased in `angular.json`

**Notifications Not Working**
- Ensure browser permissions are granted
- Check if notifications are supported in your browser
- Verify the app is served over HTTPS in production

**PWA Installation Issues**
- Ensure the app is served over HTTPS
- Check that service worker is registered
- Verify manifest.json is accessible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- Built with Angular 20 and modern web technologies
- Icons and emojis for enhanced visual experience
- Inspired by modern task management applications

---

**Happy Task Managing! 🎉**

For questions or support, please open an issue on the repository.