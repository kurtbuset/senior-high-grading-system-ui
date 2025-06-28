import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

import { provideRouter } from '@angular/router';

import { appInitializer } from './_helpers/app.initializer';
import { AccountService } from './_services/account.service';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  HttpClientModule,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { fakeBackendProvider } from './_helpers/fake-backend';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    BrowserModule,

    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService], },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // optional: fake backend
    // fakeBackendProvider  
  ],
};
