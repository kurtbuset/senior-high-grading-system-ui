import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { appInitializer } from './_helpers/app.initializer';
import { AccountService } from './_services/account.service';
import routes from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([JwtInterceptor, ErrorInterceptor])
    ),
    { 
      provide: APP_INITIALIZER, 
      useFactory: appInitializer, 
      multi: true, 
      deps: [AccountService] 
    },
    // Fake backend disabled - using real backend
  ],
};
