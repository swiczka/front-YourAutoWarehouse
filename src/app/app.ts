import { Component, signal } from '@angular/core';
import { Mainarea } from './mainarea/mainarea';
import { Header } from './components/header/header';
import { ToastHost } from './components/ui/toast/toast';

@Component({
  selector: 'app-root',
  imports: [Mainarea, Header, ToastHost],
  template: `
    <app-header/>
    <main>
      <app-mainarea/>
    </main>
    <app-toast/>
  `,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('front-YourAutoWarehouse');
}
