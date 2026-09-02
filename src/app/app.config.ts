import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api/api.interceptor';
import { RxStompService } from './stomp/rx-stomp.service';
import { rxStompServiceFactory } from './stomp/rx-stomp-service-factory';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
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
