import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api/api.interceptor';
import { RxStompService } from './stomp/rx-stomp.service';
import { rxStompServiceFactory } from './stomp/rx-stomp-service-factory';

// Polish month names and formats for DatePipe (e.g. "19 paź, 18:22")
registerLocaleData(localePl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pl' },
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiInterceptor])
    ),
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory 
    }
  ]
};
