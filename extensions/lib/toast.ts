export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptionsInternal extends ToastOptions {
  type: ToastType; // Make type required internally
}

export interface Toast extends Required<Omit<ToastOptions, 'action'>> {
  id: string;
  action?: ToastOptions['action'];
  timestamp: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private container: HTMLElement | null = null;
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private toastElements: Map<string, HTMLElement> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private statusBars: Map<string, HTMLElement> = new Map();

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'compahunt-toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100000;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 400px;
    `;
    
    document.body.appendChild(this.container);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.667 10A6.667 6.667 0 1 1 10 3.333 6.667 6.667 0 0 1 16.667 10Z" stroke="currentColor" stroke-width="1.25"/>
            <path d="m7.5 10 1.667 1.667L12.5 8.333" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      case 'error':
        return `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.667 10A6.667 6.667 0 1 1 10 3.333 6.667 6.667 0 0 1 16.667 10Z" stroke="currentColor" stroke-width="1.25"/>
            <path d="m12.5 7.5-5 5m0-5 5 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
          </svg>
        `;
      case 'warning':
        return `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6.667V10m0 3.333h.008M18.333 10A8.333 8.333 0 1 1 10 1.667 8.333 8.333 0 0 1 18.333 10Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      case 'info':
        return `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13.333V10m0-3.333h.008M18.333 10A8.333 8.333 0 1 1 10 1.667 8.333 8.333 0 0 1 18.333 10Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      default:
        return '';
    }
  }

  private getColorClasses(type: ToastType) {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--compahunt-success)',
          text: '#ffffff',
          border: 'var(--compahunt-success)'
        };
      case 'error':
        return {
          bg: 'var(--compahunt-error)',
          text: '#ffffff',
          border: 'var(--compahunt-error)'
        };
      case 'warning':
        return {
          bg: 'var(--compahunt-warning)',
          text: '#000000',
          border: 'var(--compahunt-warning)'
        };
      case 'info':
        return {
          bg: 'var(--compahunt-info)',
          text: '#ffffff',
          border: 'var(--compahunt-info)'
        };
      default:
        return {
          bg: 'var(--compahunt-card)',
          text: 'var(--compahunt-foreground)',
          border: 'var(--compahunt-border)'
        };
    }
  }

  private createToastElement(toast: Toast): HTMLElement {
    const colors = this.getColorClasses(toast.type);
    const toastEl = document.createElement('div');
    
    toastEl.className = 'compahunt-toast compahunt-font-family';
    toastEl.style.cssText = `
      pointer-events: auto;
      background: ${colors.bg};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      border-radius: var(--compahunt-radius);
      padding: 12px 16px;
      box-shadow: var(--compahunt-shadow-lg);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 300px;
      max-width: 400px;
      font-size: 14px;
      line-height: 1.4;
      animation: compahunt-toast-slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform-origin: top right;
      position: relative;
      overflow: hidden;
    `;

    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    `;
    iconContainer.innerHTML = this.getIcon(toast.type);

    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      min-width: 0;
    `;

    if (toast.title) {
      const title = document.createElement('div');
      title.style.cssText = `
        font-weight: 600;
        margin-bottom: 4px;
        line-height: 1.2;
      `;
      title.textContent = toast.title;
      content.appendChild(title);
    }

    if (toast.description) {
      const description = document.createElement('div');
      description.style.cssText = `
        opacity: 0.9;
        line-height: 1.4;
      `;
      description.textContent = toast.description;
      content.appendChild(description);
    }

    const rightContainer = document.createElement('div');
    rightContainer.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 8px;
      flex-shrink: 0;
    `;

    if (toast.action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'compahunt-btn compahunt-btn-xs';
      actionBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        color: ${colors.text};
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 12px;
        padding: 4px 8px;
        margin-top: 2px;
      `;
      actionBtn.textContent = toast.action.label;
      actionBtn.onclick = toast.action.onClick;
      rightContainer.appendChild(actionBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: ${colors.text};
      cursor: pointer;
      padding: 2px;
      opacity: 0.7;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m12 4-8 8m0-8 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
    closeBtn.onclick = () => this.dismiss(toast.id);
    closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';

    rightContainer.appendChild(closeBtn);

    toastEl.appendChild(iconContainer);
    toastEl.appendChild(content);
    toastEl.appendChild(rightContainer);

    // Status bar with countdown for timed toasts
    if (toast.duration > 0) {
      const statusBarContainer = document.createElement('div');
      statusBarContainer.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 20px;
        background: rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 500;
        opacity: 0;
        transition: opacity 0.2s ease;
        backdrop-filter: blur(4px);
      `;
      
      const countdownText = document.createElement('span');
      countdownText.style.cssText = `
        color: ${colors.text};
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      `;
      
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.6);
        animation: compahunt-toast-progress ${toast.duration}ms cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: left;
        border-radius: 1px;
      `;
      
      statusBarContainer.appendChild(countdownText);
      statusBarContainer.appendChild(progressBar);
      toastEl.appendChild(statusBarContainer);
      
      this.statusBars.set(toast.id, statusBarContainer);
      this.startCountdown(toast.id, toast.duration, countdownText);
      
      // Show status bar on hover
      toastEl.addEventListener('mouseenter', () => {
        statusBarContainer.style.opacity = '1';
        progressBar.style.animationPlayState = 'paused';
      });
      
      toastEl.addEventListener('mouseleave', () => {
        statusBarContainer.style.opacity = '0';
        progressBar.style.animationPlayState = 'running';
      });
    }

    return toastEl;
  }

  private addToastToContainer(toast: Toast) {
    if (!this.container) return;
    
    const toastEl = this.createToastElement(toast);
    this.toastElements.set(toast.id, toastEl);
    this.container.appendChild(toastEl);
    
    this.listeners.forEach(listener => listener(this.toasts));
  }

  private removeToastFromContainer(id: string) {
    // Clear timer and status bar
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
    this.statusBars.delete(id);
    
    const toastEl = this.toastElements.get(id);
    if (toastEl && this.container) {
      toastEl.style.animation = 'compahunt-toast-slide-out 0.3s cubic-bezier(0.4, 0, 0.6, 1) forwards';
      setTimeout(() => {
        if (this.container?.contains(toastEl)) {
          this.container.removeChild(toastEl);
        }
        this.toastElements.delete(id);
        this.toasts = this.toasts.filter(toast => toast.id !== id);
        this.listeners.forEach(listener => listener(this.toasts));
      }, 300);
    } else {
      this.toasts = this.toasts.filter(toast => toast.id !== id);
      this.toastElements.delete(id);
      this.listeners.forEach(listener => listener(this.toasts));
    }
  }

  show(options: ToastOptions): string {
    const toast: Toast = {
      id: this.generateId(),
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 5000,
      title: options.title || '',
      description: options.description || '',
      action: options.action,
      timestamp: Date.now(),
    };

    this.toasts.push(toast);
    this.addToastToContainer(toast);

    if (toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }

  dismiss(id: string) {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index === -1) return;

    this.removeToastFromContainer(id);
  }

  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    this.statusBars.clear();
    
    // Animate out all toasts
    this.toasts.forEach(toast => {
      const toastEl = this.toastElements.get(toast.id);
      if (toastEl) {
        toastEl.style.animation = 'compahunt-toast-slide-out 0.3s cubic-bezier(0.4, 0, 0.6, 1) forwards';
      }
    });
    
    setTimeout(() => {
      this.toasts = [];
      this.toastElements.clear();
      if (this.container) {
        this.container.innerHTML = '';
      }
      this.listeners.forEach(listener => listener(this.toasts));
    }, 300);
  }

  private startCountdown(id: string, duration: number, countdownElement: HTMLElement) {
    const startTime = Date.now();
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      
      countdownElement.textContent = `${seconds}s`;
      
      if (remaining <= 0) {
        const timer = this.timers.get(id);
        if (timer) {
          clearInterval(timer);
          this.timers.delete(id);
        }
      }
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 100);
    this.timers.set(id, timer);
  }
  
  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Global toast manager instance
let toastManager: ToastManager | null = null;

function getToastManager(): ToastManager {
  if (!toastManager) {
    toastManager = new ToastManager();
    
    // Add CSS animations if not already added
    if (!document.getElementById('compahunt-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'compahunt-toast-styles';
      style.textContent = `
        @keyframes compahunt-toast-slide-in {
          from {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes compahunt-toast-slide-out {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
            max-height: 200px;
          }
          to {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
        
        @keyframes compahunt-toast-progress {
          0% {
            transform: scaleX(1);
            opacity: 1;
          }
          90% {
            transform: scaleX(0.1);
            opacity: 0.8;
          }
          100% {
            transform: scaleX(0);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  return toastManager;
}

// Convenience functions
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    getToastManager().show({ ...options, type: 'success', description: message }),
  
  error: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    getToastManager().show({ ...options, type: 'error', description: message }),
  
  info: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    getToastManager().show({ ...options, type: 'info', description: message }),
  
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) =>
    getToastManager().show({ ...options, type: 'warning', description: message }),
  
  custom: (options: ToastOptions) => getToastManager().show(options),
  
  dismiss: (id: string) => getToastManager().dismiss(id),
  
  clear: () => getToastManager().clear(),
  
  subscribe: (listener: (toasts: Toast[]) => void) => getToastManager().subscribe(listener)
};

export default toast;