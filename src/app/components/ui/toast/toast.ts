import { Component, inject } from '@angular/core';
import { ToastService } from '../../../services/toast-service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastHost {
  private toastService = inject(ToastService);

  protected readonly toast = this.toastService.toast;
  protected readonly leaving = this.toastService.leaving;

  protected close(): void {
    this.toastService.hide();
  }
}
