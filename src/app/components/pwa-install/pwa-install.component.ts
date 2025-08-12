// src/app/components/pwa-install/pwa-install.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install.component.html',
  styleUrl: './pwa-install.component.scss'
})
export class PwaInstallComponent implements OnInit {
  deferredPrompt: any;
  showInstallPrompt = false;
  isInstalled = false;

  ngOnInit() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt = true;
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.showInstallPrompt = false;
      console.log('Task Tracker was installed successfully!');
    });

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    this.deferredPrompt = null;
    this.showInstallPrompt = false;
  }

  dismissPrompt() {
    this.showInstallPrompt = false;
  }
}