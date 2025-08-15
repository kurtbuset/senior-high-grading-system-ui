import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

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
    
    // Log account changes for debugging
    this.account.subscribe(account => {
      console.log('AccountService: Account state changed:', account);
      if (account) {
        console.log('AccountService: User logged in with role:', account.role);
      } else {
        console.log('AccountService: No user logged in');
      }
    });
  }

  public get accountValue(): Account {
    return this.accountSubject.value;
  }

  // Development helper method to set a mock account
  setMockAccount(account: Account) {
    console.log('AccountService: Setting mock account:', account);
    this.accountSubject.next(account);
  }

  // Method to manually clear account (useful for testing)
  clearAccount() {
    console.log('AccountService: Clearing account');
    this.accountSubject.next(null);
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${baseUrl}/authenticate`, { username, password }, { withCredentials: true })
      .pipe(
        map((account) => {
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  logout() {
    console.log('AccountService: Starting logout process...');

    try {
      // Revoke token on server (don't wait for response)
      this.http
        .post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
        .subscribe({
          next: () => console.log('Token revoked successfully'),
          error: (error) => console.log('Token revocation failed (server may be down):', error)
        });
    } catch (error) {
      console.log('Token revocation request failed:', error);
    }

    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();

    // Stop refresh timer
    this.stopRefreshTokenTimer();

    // Set account to null (this will trigger UI updates)
    this.accountSubject.next(null);

    // Navigate to login page
    this.router.navigate(['/account/login']);

    console.log('AccountService: Logout complete, account set to null, redirected to login');
  }

  refreshToken() {
    console.log('AccountService: Attempting to refresh token...');
    
    return this.http
      .post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((account) => {
          console.log('AccountService: Token refresh successful:', account);
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  getAll() {
    return this.http.get<Account[]>(`${baseUrl}`);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  update(id: string, params: any) {
    return this.http.put(`${baseUrl}/${id}`, params);
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
    try {
      // parse json object from base64 encoded jwt token
      const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - 60 * 1000;
      this.refreshTokenTimeout = setTimeout(
        () => this.refreshToken().subscribe(),
        timeout
      );
    } catch (error) {
      console.log('AccountService: Error parsing JWT token:', error);
    }
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
