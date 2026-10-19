import { Service, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  text: string;
}

const VISIBLE_MS = 5000;
// must match the leave animation in toast.scss
const LEAVE_MS = 300;

// One toast at a time, sliding up from the bottom of the screen.
@Service()
export class ToastService {
  readonly toast = signal<Toast | null>(null);
  readonly leaving = signal(false);

  private nextId = 1;
  private timer: ReturnType<typeof setTimeout> | undefined;

  success(title: string, text: string): void {
    this.show('success', title, text);
  }

  error(title: string, text: string): void {
    this.show('error', title, text);
  }

  hide(): void {
    if (!this.toast()) {
      return;
    }
    clearTimeout(this.timer);
    this.leaving.set(true);
    this.timer = setTimeout(() => {
      this.toast.set(null);
      this.leaving.set(false);
    }, LEAVE_MS);
  }

  private show(kind: ToastKind, title: string, text: string): void {
    clearTimeout(this.timer);
    this.leaving.set(false);
    // a new id re-creates the element, so the enter animation plays again
    this.toast.set({ id: this.nextId++, kind, title, text });
    this.timer = setTimeout(() => this.hide(), VISIBLE_MS);
  }
}
