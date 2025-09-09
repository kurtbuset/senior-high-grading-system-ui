import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';

import { SubjectService } from './subject.service';
import { environment } from '@environments/environment';
import { Account } from '@app/_models/account';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account>;
  public account: Observable<Account>;

  constructor(private router: Router, private http: HttpClient, private subjectService: SubjectService) {
    this.accountSubject = new BehaviorSubject<Account>(null);
    this.account = this.accountSubject.asObservable();
  }

  public get accountValue(): Account {
    return this.accountSubject.value;
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${baseUrl}/authenticate`, { username, password }, { withCredentials: true })
      .pipe(
        map((account) => {
          console.log(account)
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        }),
        catchError(this.handleError)
      );
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account).pipe(
      catchError(this.handleError)
    );
  }

  logout() {
    this.http
      .post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
      .subscribe();
    localStorage.removeItem('account');
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    return this.http
      .post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((account) => {
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        }),
        catchError(this.handleError)
      );
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token }).pipe(
      catchError(this.handleError)
    );
  }

  // Admin CRUD operations
  getAllAccounts() {
    return this.http.get<Account[]>(`${baseUrl}`).pipe(
      catchError(this.handleError)
    );
  }

  getAccountById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createAccount(account: Account) {
    return this.http.post<Account>(`${baseUrl}`, account).pipe(
      catchError(this.handleError)
    );
  }

  updateAccount(id: string, account: Partial<Account>) {
    return this.http.put<Account>(`${baseUrl}/${id}`, account).pipe(
      catchError(this.handleError)
    );
  }

  deleteAccount(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleAccountStatus(id: string, isActive: boolean) {
    return this.http.put<Account>(`${baseUrl}/${id}`, { isActive: !isActive }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side errors
      if (error.status === 0) {
        errorMessage = 'Network error: Unable to connect to the server';
      } else if (error.status) {
        errorMessage = `Server Error ${error.status}: ${error.message || 'Unknown server error'}`;
        // If there's a detailed error message from the server
        if (error.error && typeof error.error === 'object') {
          if (error.error.msg) {
            errorMessage = `Server Error ${error.status}: ${error.error.msg}`;
          } else if (error.error.message) {
            errorMessage = `Server Error ${error.status}: ${error.error.message}`;
          }
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = `Server Error ${error.status}: ${error.error}`;
        }
      }
    }
    
    console.error('API Error:', error);
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message
    });
    return throwError(errorMessage);
  }

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = setTimeout(
      () => this.refreshToken().subscribe(),
      timeout
    );
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
