import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/_services/account.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            // Only auto logout for authentication-related errors
            if ([401, 403].includes(err.status) && this.accountService.accountValue) {
                // Check if this is an authentication endpoint
                const isAuthEndpoint = request.url.includes('/authenticate') || 
                                      request.url.includes('/refresh-token') || 
                                      request.url.includes('/revoke-token');
                
                // For account operations, we should not logout automatically
                const isAccountOperation = request.url.includes('/accounts/');
                
                // Only logout for authentication endpoints, not for account operations
                if (isAuthEndpoint && !isAccountOperation) {
                    this.accountService.logout();
                }
            }

            const error = (err && err.error && err.error.message) || err.statusText || 'An unknown error occurred!';
            console.error('HTTP Error:', err);
            return throwError(error);
        }))
    }
}