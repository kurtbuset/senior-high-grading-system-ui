import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';

import { AccountService } from '@app/_services/account.service';

export function ErrorInterceptor(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const accountService = inject(AccountService);
  
  return next(request).pipe(catchError(err => {
    if ([401, 403].includes(err.status) && accountService.accountValue) {
      // auto logout if 401 or 403 response returned from api
      accountService.logout();
    }

    const error = (err && err.error && err.error.message) || err.statusText;

    // Only log errors that aren't expected authentication failures
    if (!(err.status === 401 && request.url.includes('refresh-token'))) {
      console.error('HTTP Error:', {
        status: err.status,
        url: request.url,
        message: error
      });
    }

    return throwError(() => error);
  }));
}